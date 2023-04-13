/**
 * Design Tokens
 * Autogenerated from tokens.json.
 * DO NOT EDIT!
 */

import {
  CubicBezierToken,
  DurationToken,
  ParsedCubicBezierToken,
  ParsedDurationToken,
  ParsedTransitionToken,
  TransitionToken,
} from '@cobalt-ui/core';

export declare const tokens: {
  'ease.circ-in': CubicBezierToken['$value'];
  'ease.circ-out': CubicBezierToken['$value'];
  'ease.circ-in-out': CubicBezierToken['$value'];
  'ease.cubic-in': CubicBezierToken['$value'];
  'ease.cubic-in-out': CubicBezierToken['$value'];
  'ease.cubic-out': CubicBezierToken['$value'];
  'ease.linear': CubicBezierToken['$value'];
  'timing.instant': DurationToken['$value'];
  'timing.quick': DurationToken['$value'];
  'timing.moderate': DurationToken['$value'];
  'timing.deliberate': DurationToken['$value'];
  'timing.slow': DurationToken['$value'];
  'transition.circ-in-instant': TransitionToken['$value'];
  'transition.circ-in-quick': TransitionToken['$value'];
  'transition.circ-in-moderate': TransitionToken['$value'];
  'transition.circ-in-deliberate': TransitionToken['$value'];
  'transition.circ-in-slow': TransitionToken['$value'];
  'transition.circ-in-out-instant': TransitionToken['$value'];
  'transition.circ-in-out-quick': TransitionToken['$value'];
  'transition.circ-in-out-moderate': TransitionToken['$value'];
  'transition.circ-in-out-deliberate': TransitionToken['$value'];
  'transition.circ-in-out-slow': TransitionToken['$value'];
  'transition.circ-out-instant': TransitionToken['$value'];
  'transition.circ-out-quick': TransitionToken['$value'];
  'transition.circ-out-moderate': TransitionToken['$value'];
  'transition.circ-out-deliberate': TransitionToken['$value'];
  'transition.circ-out-slow': TransitionToken['$value'];
  'transition.cubic-in-instant': TransitionToken['$value'];
  'transition.cubic-in-quick': TransitionToken['$value'];
  'transition.cubic-in-moderate': TransitionToken['$value'];
  'transition.cubic-in-deliberate': TransitionToken['$value'];
  'transition.cubic-in-slow': TransitionToken['$value'];
  'transition.cubic-in-out-instant': TransitionToken['$value'];
  'transition.cubic-in-out-quick': TransitionToken['$value'];
  'transition.cubic-in-out-moderate': TransitionToken['$value'];
  'transition.cubic-in-out-deliberate': TransitionToken['$value'];
  'transition.cubic-in-out-slow': TransitionToken['$value'];
  'transition.cubic-out-instant': TransitionToken['$value'];
  'transition.cubic-out-quick': TransitionToken['$value'];
  'transition.cubic-out-moderate': TransitionToken['$value'];
  'transition.cubic-out-deliberate': TransitionToken['$value'];
  'transition.cubic-out-slow': TransitionToken['$value'];
  'transition.linear-instant': TransitionToken['$value'];
  'transition.linear-quick': TransitionToken['$value'];
  'transition.linear-moderate': TransitionToken['$value'];
  'transition.linear-deliberate': TransitionToken['$value'];
  'transition.linear-slow': TransitionToken['$value'];
};

export declare const meta: {
  'ease.circ-in': ParsedCubicBezierToken;
  'ease.circ-out': ParsedCubicBezierToken;
  'ease.circ-in-out': ParsedCubicBezierToken;
  'ease.cubic-in': ParsedCubicBezierToken;
  'ease.cubic-in-out': ParsedCubicBezierToken;
  'ease.cubic-out': ParsedCubicBezierToken;
  'ease.linear': ParsedCubicBezierToken;
  'timing.instant': ParsedDurationToken;
  'timing.quick': ParsedDurationToken;
  'timing.moderate': ParsedDurationToken;
  'timing.deliberate': ParsedDurationToken;
  'timing.slow': ParsedDurationToken;
  'transition.circ-in-instant': ParsedTransitionToken;
  'transition.circ-in-quick': ParsedTransitionToken;
  'transition.circ-in-moderate': ParsedTransitionToken;
  'transition.circ-in-deliberate': ParsedTransitionToken;
  'transition.circ-in-slow': ParsedTransitionToken;
  'transition.circ-in-out-instant': ParsedTransitionToken;
  'transition.circ-in-out-quick': ParsedTransitionToken;
  'transition.circ-in-out-moderate': ParsedTransitionToken;
  'transition.circ-in-out-deliberate': ParsedTransitionToken;
  'transition.circ-in-out-slow': ParsedTransitionToken;
  'transition.circ-out-instant': ParsedTransitionToken;
  'transition.circ-out-quick': ParsedTransitionToken;
  'transition.circ-out-moderate': ParsedTransitionToken;
  'transition.circ-out-deliberate': ParsedTransitionToken;
  'transition.circ-out-slow': ParsedTransitionToken;
  'transition.cubic-in-instant': ParsedTransitionToken;
  'transition.cubic-in-quick': ParsedTransitionToken;
  'transition.cubic-in-moderate': ParsedTransitionToken;
  'transition.cubic-in-deliberate': ParsedTransitionToken;
  'transition.cubic-in-slow': ParsedTransitionToken;
  'transition.cubic-in-out-instant': ParsedTransitionToken;
  'transition.cubic-in-out-quick': ParsedTransitionToken;
  'transition.cubic-in-out-moderate': ParsedTransitionToken;
  'transition.cubic-in-out-deliberate': ParsedTransitionToken;
  'transition.cubic-in-out-slow': ParsedTransitionToken;
  'transition.cubic-out-instant': ParsedTransitionToken;
  'transition.cubic-out-quick': ParsedTransitionToken;
  'transition.cubic-out-moderate': ParsedTransitionToken;
  'transition.cubic-out-deliberate': ParsedTransitionToken;
  'transition.cubic-out-slow': ParsedTransitionToken;
  'transition.linear-instant': ParsedTransitionToken;
  'transition.linear-quick': ParsedTransitionToken;
  'transition.linear-moderate': ParsedTransitionToken;
  'transition.linear-deliberate': ParsedTransitionToken;
  'transition.linear-slow': ParsedTransitionToken;
};

export declare const modes: Record<string, never>;

export declare function token<K extends keyof typeof tokens>(tokenID: K, modeName?: never): typeof tokens[K];
export declare function token<K extends keyof typeof modes, M extends keyof typeof modes[K]>(tokenID: K, modeName: M): typeof modes[K][M];
