import type {ShadowValue} from '../../token.js';
import {ParseColorOptions, normalizeColorValue} from './color.js';
import {normalizeDimensionValue} from './dimension.js';

export interface ParseShadowOptions {
  color: ParseColorOptions;
}

/**
 * 9.5 Shadow
 * https://design-tokens.github.io/community-group/format/#shadow
 * {
 *   "$type": "shadow",
 *   "$value": {
 *     "color": "{color.shadow-050}",
 *     "offsetX": "{space.small}",
 *     "offsetY": "{space.small}",
 *     "blur": "1.5rem",
 *     "spread": "0rem"
 *   }
 * }
 */
export function normalizeShadowValue(value: unknown, options: ParseShadowOptions): ShadowValue {
  if (!value) throw new Error('missing value');
  if (typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid shadow');
  const v = value as any;
  for (const k of ['offsetX', 'offsetX', 'blur', 'spread', 'color']) {
    if (typeof v[k] === 'number' && v[k] > 0) throw new Error(`${k} missing units`);
    if (k === 'offsetX' || k === 'offsetY') {
      if (typeof v[k] !== 'string' && v[k] !== 0) throw new Error(`missing ${k}`);
    }
  }
  return {
    offsetX: normalizeDimensionValue(v.offsetX || '0'),
    offsetY: normalizeDimensionValue(v.offsetY || '0'),
    blur: normalizeDimensionValue(v.blur || '0'),
    spread: normalizeDimensionValue(v.spread || '0'),
    color: normalizeColorValue(v.color, options.color),
    // extra values are discarded rather than throwing an error
  };
}
