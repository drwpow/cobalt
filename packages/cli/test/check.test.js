import {execa} from 'execa';
import {URL} from 'node:url';
import {describe, expect, test} from 'vitest';

const cmd = '../../../bin/cli.js';

describe('co check', () => {
  test('default filename', async () => {
    const cwd = new URL('./fixtures/check-default/', import.meta.url);
    const result = await execa('node', [cmd, 'check'], {cwd});
    expect(result.exitCode).toBe(0);
  });

  test('custom filename', async () => {
    const cwd = new URL('./fixtures/check-custom/', import.meta.url);
    const result = await execa('node', [cmd, 'check', 'tokens-2.json'], {cwd});
    expect(result.exitCode).toBe(0);
  });

  test('invalid tokens', async () => {
    const cwd = new URL('./fixtures/check-invalid/', import.meta.url);
    await expect(async () => await execa('node', [cmd, 'check'], {cwd, throwOnStderr: false})).rejects.toThrow();
  });
});
