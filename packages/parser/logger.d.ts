import type { AnyNode } from '@humanwhocodes/momoa';

declare const LOG_ORDER: readonly ['error', 'warn', 'info', 'debug'];

export type LogSeverity = 'error' | 'warn' | 'info' | 'debug';

export type LogLevel = LogSeverity | 'silent';

export type LogGroup = 'core' | 'plugin';

export interface LogEntry {
  /** Error message to be logged */
  message: string;
  /** (optional) Prefix message with label */
  label?: string;
  /** (optional) File in disk */
  filename?: URL;
  /** Continue on error? (default: false) */
  continueOnError?: boolean;
  /** (optional) Show a code frame for the erring node */
  node?: AnyNode;
  /** (optional) To show a code frame, provide the original source code */
  src?: string;
}

export interface DebugEntry {
  /** `parser` | `plugin` */
  group: 'parser' | 'plugin';
  /** Current subtask or submodule */
  task: string;
  /** Error message to be logged */
  message: string;
  /** (optional) Show code below message */
  codeFrame?: { src: string; line: number; column: number };
  /** (optional) Display performance timing */
  timing?: number;
}

export default class Logger {
  constructor(options?: { level?: LogLevel; debugScope: string });

  setLevel(level: LogLevel): void;

  /** Log an error message (always; can’t be silenced) */
  error(entry: LogEntry): void;

  /** Log an info message (if logging level permits) */
  info(entry: LogEntry): void;

  /** Log a warning message (if logging level permits) */
  warn(entry: LogEntry): void;

  /** Log a diagnostics message (if logging level permits) */
  debug(entry: DebugEntry): void;

  /** Get current stats for logger instance */
  stats(): {
    errorCount: number;
    infoCount: number;
    warnCount: number;
    debugCount: number;
  };
}

export class TokensJSONError extends Error {
  level: LogLevel;
  debugScope: string;
  node?: AnyNode;

  constructor(message: string, node: AnyNode);
}
