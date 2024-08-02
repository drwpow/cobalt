import type { AnyNode, DocumentNode } from '@humanwhocodes/momoa';
import type { Group } from '@terrazzo/token-tools';
import type { ConfigInit } from '../config.js';
import type Logger from '../logger.js';

export interface LintNotice {
  /** Lint message shown to the user */
  message: string;
  /** Erring node (used to point to a specific line) */
  node?: AnyNode;
}

export type LintRuleSeverity = 'error' | 'warn' | 'off';
export type LintRuleShorthand = LintRuleSeverity | 0 | 1 | 2;
export type LintRuleLonghand = [LintRuleSeverity | 0 | 1 | 2, any];

export interface LintRuleNormalized<O = any> {
  id: string;
  severity: LintRuleSeverity;
  options?: O;
}

export interface LinterOptions<O = any> {
  tokens: Group;
  rule: {
    id: string;
    severity: LintRuleSeverity;
  };
  document: DocumentNode;
  filename?: URL;
  source?: string;
  /** Any options the user has declared for this plugin */
  options?: O;
}
export type Linter = (options: LinterOptions) => Promise<LintNotice[] | undefined>;

export interface LintRunnerOptions {
  document: DocumentNode;
  filename?: URL;
  config: ConfigInit;
  logger: Logger;
}

export default function lintRunner(options: LintRunnerOptions): Promise<void>;
