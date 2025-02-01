import { type DocumentNode, type ObjectNode, print, type StringNode } from '@humanwhocodes/momoa';
import { type Token, type TokenNormalized, pluralize, splitID } from '@terrazzo/token-tools';
import type ytm from 'yaml-to-momoa';
import lintRunner from '../lint/index.js';
import Logger from '../logger.js';
import type { ConfigInit, InputSource } from '../types.js';
import applyAliases from './alias.js';
import { getObjMembers, pointerToTokenID, toMomoa, tracePointer, traverse } from './json.js';
import normalize from './normalize.js';
import validateTokenNode from './validate.js';

export * from './alias.js';
export * from './normalize.js';
export * from './json.js';
export * from './resolve.js';
export * from './validate.js';
export { normalize, validateTokenNode };

const INVALID_POINTERS = new Set(['', '#', '/', '#/']); // we can’t support these pointers which will recursively embed themselves
// these are reserved keys on token nodes that may or may not exist, but get special behavior on token nodes specifically
const TOKEN_RESERVED_KEYS = new Set(['$value', '$type', '$description', '$extensions', '$deprecated']);

export interface ParseOptions {
  logger?: Logger;
  config: ConfigInit;
  /**
   * Skip lint step
   * @default false
   */
  skipLint?: boolean;
  /**
   * Continue on error? (Useful for `tz check`)
   * @default false
   */
  continueOnError?: boolean;
  /** Provide yamlToMomoa module to parse YAML (by default, this isn’t shipped to cut down on package weight) */
  yamlToMomoa?: typeof ytm;
  /** (internal cache; do not use) */
  _sources?: Record<string, InputSource>;
}

export interface ParseResult {
  tokens: Record<string, TokenNormalized>;
  sources: InputSource[];
}

/** Parse */
export default async function parse(
  _input: Omit<InputSource, 'document'> | Omit<InputSource, 'document'>[],
  {
    logger = new Logger(),
    skipLint = false,
    config = {} as ConfigInit,
    continueOnError = false,
    yamlToMomoa,
    _sources = {},
  }: ParseOptions = {} as ParseOptions,
): Promise<ParseResult> {
  const input = Array.isArray(_input) ? _input : [_input];
  let tokensSet: Record<string, TokenNormalized> = {};

  if (!Array.isArray(input)) {
    logger.error({ group: 'parser', label: 'init', message: 'Input must be an array of input objects.' });
  }
  await Promise.all(
    input.map(async (src, i) => {
      if (!src || typeof src !== 'object') {
        logger.error({ group: 'parser', label: 'init', message: `Input (${i}) must be an object.` });
      }
      if (!src.src || (typeof src.src !== 'string' && typeof src.src !== 'object')) {
        logger.error({
          message: `Input (${i}) missing "src" with a JSON/YAML string, or JSON object.`,
          group: 'parser',
          label: 'init',
        });
      }
      if (src.filename) {
        if (!(src.filename instanceof URL)) {
          logger.error({
            message: `Input (${i}) "filename" must be a URL (remote or file URL).`,
            group: 'parser',
            label: 'init',
          });
        }

        // if already parsed/scanned, skip
        if (_sources[src.filename.href]) {
          return;
        }
      }

      const result = await parseSingle(src.src, {
        filename: src.filename!,
        logger,
        config,
        skipLint,
        continueOnError,
        yamlToMomoa,
      });
      tokensSet = Object.assign(tokensSet, result.tokens);
      if (src.filename) {
        _sources[src.filename.href] = {
          filename: src.filename,
          src: result.src,
          document: result.document,
        };
      }
    }),
  );

  const totalStart = performance.now();

  // 5. Resolve {…} aliases and populate groups
  const aliasesStart = performance.now();
  let aliasCount = 0;
  for (const [id, token] of Object.entries(tokensSet)) {
    applyAliases(token, {
      tokensSet,
      filename: _sources[token.source.loc!]?.filename!,
      src: _sources[token.source.loc!]?.src as string,
      node: (getObjMembers(token.source.node).$value as any) || token.source.node,
      logger,
    });
    aliasCount++;
    const { group: parentGroup } = splitID(id);
    if (parentGroup) {
      for (const siblingID of Object.keys(tokensSet)) {
        const { group: siblingGroup } = splitID(siblingID);
        if (siblingGroup?.startsWith(parentGroup)) {
          token.group.tokens.push(siblingID);
        }
      }
    }
  }
  logger.debug({
    message: `Resolved ${aliasCount} aliases`,
    group: 'parser',
    label: 'alias',
    timing: performance.now() - aliasesStart,
  });

  logger.debug({
    message: 'Finish all parser tasks',
    group: 'parser',
    label: 'core',
    timing: performance.now() - totalStart,
  });

  if (continueOnError) {
    const { errorCount } = logger.stats();
    if (errorCount > 0) {
      logger.error({
        group: 'parser',
        message: `Parser encountered ${errorCount} ${pluralize(errorCount, 'error', 'errors')}. Exiting.`,
      });
    }
  }

  return {
    tokens: tokensSet,
    sources: Object.values(_sources),
  };
}

/** Parse a single input */
async function parseSingle(
  input: string | Record<string, any>,
  {
    filename,
    logger,
    config,
    skipLint,
    continueOnError = false,
    yamlToMomoa, // optional dependency, declared here so the parser itself doesn’t have to load a heavy dep in-browser
    _sources = {},
  }: {
    filename: URL;
    logger: Logger;
    config: ConfigInit;
    skipLint: boolean;
    continueOnError?: boolean;
    yamlToMomoa?: typeof ytm;
    _sources?: Record<string, InputSource>;
  },
): Promise<{ tokens: Record<string, Token>; document: DocumentNode; src?: string }> {
  // 1. Build AST
  const startParsing = performance.now();
  const { src, document } = toMomoa(input, { filename, logger, continueOnError, yamlToMomoa });
  logger.debug({
    group: 'parser',
    label: 'json',
    message: 'Finish JSON parsing',
    timing: performance.now() - startParsing,
  });
  const tokensSet: Record<string, TokenNormalized> = {};

  // 2. Resolve JSON Pointer aliases ($refs)
  //    Note: this can happen first because they are capable of pointing to
  //    other files, while {…} aliases can’t and can only be resolved after all
  //    files have been loaded & parsed.
  const startResolve = performance.now();
  logger.debug({ group: 'parser', label: 'resolve', message: 'Start tokens resolving' });
  const openResolvers: Promise<any>[] = [];
  const baseMessage = { group: 'parser' as const, label: 'alias', filename, src };
  traverse(document, {
    enter(node) {
      // handle $refs and $defs
      if (node.type !== 'Member' || node.value.type !== 'Object') {
        return; // don’t skipTree()
      }
      const rootName = (node.name as StringNode).value;
      const { members: nodeMembers } = node.value;
      const $refI = nodeMembers.findIndex((m) => (m.name as StringNode).value === '$ref');
      if ($refI === -1) {
        return;
      }
      const $ref = nodeMembers[$refI]!;
      if ($ref.value.type !== 'String') {
        logger.error({
          ...baseMessage,
          message: `Invalid ref: ${print($ref)}. Must be a valid JSON pointer (RFC 6901).`,
          node,
        });
        return;
      }
      const pointerValue = $ref.value.value;
      if (INVALID_POINTERS.has(pointerValue)) {
        logger.error({
          ...baseMessage,
          message: `Invalid $ref: ${pointerValue}. Can’t recursively embed the same document within itself.`,
          node: $ref,
        });
        return;
      }
      // note: by pushing these to the background, we can parallelize as many as possible at once
      openResolvers.push(
        tracePointer(pointerValue, { filename, src, node: $ref, document, logger, yamlToMomoa, _sources }).then(
          (result) => {
            if (!result) {
              return;
            }

            // resrved keys
            if (TOKEN_RESERVED_KEYS.has(rootName)) {
              // shorthand: if the $ref is an object that matches the rootName, hoist that up
              // this ONLY happens for reserved keys, and in no other instances
              const aliasNode =
                (result.node.type === 'Object' &&
                  result.node.members.find((m) => (m.name as StringNode).value === rootName)) ||
                result.node;
              node.value = { ...aliasNode } as any;
              if (rootName === '$value') {
                (node as any)._aliasOf = pointerToTokenID(pointerValue);
                (node as any)._aliasChain = result.pointerChain.map(pointerToTokenID);
              }
            }

            // handle object alias
            if (nodeMembers.length > 1 || result.node.type === 'Object') {
              // throw error if trying to merge a non-object
              if (result.node.type !== 'Object') {
                logger.error({
                  ...baseMessage,
                  message: `Invalid $ref: can’t spread type ${result.node.type} into object node. $ref must be the only key and will replace the entire node.`,
                  node: node.value,
                });
                return;
              }

              // remove $ref
              const keys = nodeMembers.map((m) => (m.name as StringNode).value);
              (node.value as ObjectNode).members = [...nodeMembers.slice(0, $refI), ...nodeMembers.slice($refI + 1)];

              // add new members, but skip local conflicts (those are overrides)
              for (const aliasMember of result.node.members) {
                const isNewMember = !keys.includes((aliasMember.name as StringNode).value);
                if (isNewMember) {
                  const newMember = { ...aliasMember };
                  if ((aliasMember.name as StringNode).value === '$value') {
                    (newMember as any)._aliasOf = pointerToTokenID(pointerValue);
                    (newMember as any)._aliasChain = result.pointerChain.map(pointerToTokenID);
                  }
                  nodeMembers.push(newMember);
                }
              }
              return;
            }

            // handle arrays and primitives
            // @ts-expect-error this is safe
            node.value = { ...result.node };
          },
        ),
      );
    },
  });
  if (openResolvers.length) {
    await Promise.all(openResolvers);
  }
  logger.debug({
    message: 'Finish tokens resolving',
    group: 'parser',
    label: 'resolve',
    timing: performance.now() - startResolve,
  });

  // 3. Walk AST a 2nd time to validate tokens (can only be done after everything has settled, otherwise we’d have to
  // restart the traversal every $ref insert, and we’d redo too much work
  let tokenCount = 0;
  const startValidate = performance.now();
  const $typeInheritance: Record<string, Token['$type']> = {};
  traverse(document, {
    enter(node, parent, subpath, skipTree) {
      // if $type appears at root of tokens.json, collect it
      if (node.type === 'Document' && node.body.type === 'Object' && node.body.members) {
        const members = getObjMembers(node.body);
        if (members.$type && members.$type.type === 'String' && !members.$value) {
          // @ts-ignore
          $typeInheritance['.'] = node.body.members.find((m) => m.name.value === '$type');
        }
      }

      // handle tokens
      if (node.type === 'Member') {
        if (node.value.type !== 'Object') {
          skipTree();
          return;
        }

        const memberName = node.name.type === 'String' && node.name.value;

        // don’t evaluate $value | $extensions | $defs
        const isUnvalidatable = memberName === '$value' || memberName === '$extensions' || memberName === '$defs';
        if (isUnvalidatable) {
          skipTree();
          return;
        }

        const members = getObjMembers(node.value);
        const isTokenNode = !!members.$value;
        if (isTokenNode) {
          const token = validateTokenNode(node, { filename, src, config, logger, parent, subpath, $typeInheritance });
          if (token) {
            tokensSet[token.id] = token;

            const $valueMember = node.value.members.find((m) => (m.name as StringNode).value === '$value');
            if (($valueMember as any)?._aliasOf) {
              tokensSet[token.id]!.aliasOf = ($valueMember as any)._aliasOf;
            }
            if (($valueMember as any)?._aliasChain) {
              tokensSet[token.id]!.aliasChain = ($valueMember as any)._aliasChain;
            }
            tokenCount++;
          }
        }
        // preserve $type inheritance from groups down to token nodes (only for non-tokens)
        else if ($typeInheritance && members.$type && members.$type.type === 'String') {
          // @ts-ignore
          $typeInheritance[subpath.join('.') || '.'] = node.value.members.find((m) => m.name.value === '$type');
        }
      }
    },
  });
  logger.debug({
    message: `Validated ${tokenCount} tokens`,
    group: 'parser',
    label: 'validate',
    timing: performance.now() - startValidate,
  });

  // 4. normalize values
  const normalizeStart = performance.now();
  for (const [id, token] of Object.entries(tokensSet)) {
    try {
      tokensSet[id]!.$value = normalize(token);
    } catch (err) {
      let { node } = token.source;
      const members = getObjMembers(node);
      if (members.$value) {
        node = members.$value as ObjectNode;
      }
      logger.error({
        group: 'parser',
        label: 'normalize',
        message: (err as Error).message,
        filename,
        src,
        node,
        continueOnError,
      });
    }
    for (const [mode, modeValue] of Object.entries(token.mode)) {
      if (mode === '.') {
        continue;
      }
      try {
        tokensSet[id]!.mode[mode]!.$value = normalize({ $type: token.$type, ...modeValue });
      } catch (err) {
        let { node } = token.source;
        const members = getObjMembers(node);
        if (members.$value) {
          node = members.$value as ObjectNode;
        }
        logger.error({
          group: 'parser',
          label: 'normalize',
          message: (err as Error).message,
          filename,
          src,
          node: modeValue.source.node,
          continueOnError,
        });
      }
    }
  }
  logger.debug({
    message: `Normalized ${tokenCount} tokens`,
    group: 'parser',
    label: 'normalize',
    timing: performance.now() - normalizeStart,
  });

  // 5. Execute lint runner with loaded plugins
  if (!skipLint && config?.plugins?.length) {
    const lintStart = performance.now();
    await lintRunner({ tokens: tokensSet, src, config, logger });
    logger.debug({
      message: `Linted ${tokenCount} tokens`,
      group: 'parser',
      label: 'lint',
      timing: performance.now() - lintStart,
    });
  } else {
    logger.debug({ message: 'Linting skipped', group: 'parser', label: 'lint' });
  }

  return {
    tokens: tokensSet,
    document,
    src,
  };
}
