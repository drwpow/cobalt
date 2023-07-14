import {build} from '@cobalt-ui/cli/dist/build.js';
import fs from 'node:fs';
import {URL} from 'node:url';
import {describe, expect, test} from 'vitest';
import pluginCSS from '../dist/index.js';

describe('@cobalt-ui/plugin-css', () => {
  test.each(['border', 'color', 'typography', 'transition'])('%s', async (dir) => {
    const cwd = new URL(`./${dir}/`, import.meta.url);
    const tokens = JSON.parse(fs.readFileSync(new URL('./tokens.json', cwd)));
    await build(tokens, {
      outDir: cwd,
      plugins: [
        pluginCSS({
          filename: 'actual.css',
          prefix: 'ds-',
          modeSelectors: {
            'border#light': ['[data-color-theme="light"]'],
            'border#dark': ['[data-color-theme="dark"]'],
            'color#light': ['[data-color-theme="light"]'],
            'color#dark': ['[data-color-theme="dark"]'],
            'color#light-colorblind': ['[data-color-theme="light-colorblind"]'],
            'color#light-high-contrast': ['[data-color-theme="light-high-contrast"]'],
            'color#dark-dimmed': ['[data-color-theme="dark-dimmed"]'],
            'color#dark-high-contrast': ['[data-color-theme="high-contrast"]'],
            'color#dark-colorblind': ['[data-color-theme="dark-colorblind"]'],
          },
        }),
      ],
      color: {},
    });

    expect(fs.readFileSync(new URL('./actual.css', cwd), 'utf8')).toBe(fs.readFileSync(new URL('./want.css', cwd), 'utf8'));
  });

  describe('options', () => {
    test('p3', async () => {
      const cwd = new URL(`./p3/`, import.meta.url);
      const tokens = JSON.parse(fs.readFileSync(new URL('./tokens.json', cwd)));
      await build(tokens, {
        outDir: cwd,
        plugins: [
          pluginCSS({
            filename: 'actual.css',
            p3: false,
          }),
        ],
        color: {},
      });
      expect(fs.readFileSync(new URL('./actual.css', cwd), 'utf8')).toBe(fs.readFileSync(new URL('./want.css', cwd), 'utf8'));
    });
  });
});
