import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build, defineConfig, parse } from '@terrazzo/parser';
import { describe, expect, it } from 'vitest';
import pluginTailwind from '../src/index.js';

describe('@cobalt-ui/plugin-tailwind', () => {
  describe('options', () => {
    describe('format', () => {
      const baseConfig = {
        tailwind: {
          theme: {
            color: {
              blue: {
                50: 'color.blue.0',
                100: 'color.blue.1',
                200: 'color.blue.2',
                300: 'color.blue.3',
                400: 'color.blue.4',
                500: 'color.blue.5',
                600: 'color.blue.6',
                700: 'color.blue.7',
                800: 'color.blue.8',
                900: 'color.blue.9',
                950: 'color.blue.9',
              },
              gray: {
                50: 'color.blue.0',
                100: 'color.blue.1',
                200: 'color.blue.2',
                300: 'color.blue.3',
                400: 'color.blue.4',
                500: 'color.blue.5',
                600: 'color.blue.6',
                700: 'color.blue.7',
                800: 'color.blue.8',
                900: 'color.blue.9',
                950: 'color.blue.9',
              },
            },
            fontFamily: {
              sans: 'font.family.system',
            },
            spacing: {
              1: 'spacing.3xs',
              2: 'spacing.2xs',
              3: 'spacing.xs',
              4: 'spacing.md',
              5: 'spacing.lg',
              6: 'spacing.xl',
              7: 'spacing.2xl',
              8: 'spacing.3xl',
            },
          },
        },
      };

      it('cjs', async () => {
        const cwd = new URL('./cjs/', import.meta.url);
        const config = defineConfig(
          {
            outDir: './cjs/',
            plugins: [pluginTailwind({ ...baseConfig, filename: './actual.js', format: 'cjs' })],
          },
          { cwd },
        );
        const { tokens, sources } = await parse([{ src: fs.readFileSync(new URL('../tokens.yaml', cwd), 'utf8') }], {
          config,
        });
        await build(tokens, { sources, config });

        await expect(fs.readFileSync(new URL('./actual.js', cwd), 'utf8')).toMatchFileSnapshot(
          fileURLToPath(new URL('./want.js', cwd)),
        );
      });

      it('esm', async () => {
        const cwd = new URL('./esm/', import.meta.url);
        const config = defineConfig(
          {
            outDir: './cjs/',
            plugins: [pluginTailwind({ ...baseConfig, filename: './actual.js', format: 'esm' })],
          },
          { cwd },
        );
        const { tokens, sources } = await parse([{ src: fs.readFileSync(new URL('../tokens.yaml', cwd), 'utf8') }], {
          config,
        });
        await build(tokens, { sources, config });

        await expect(fs.readFileSync(new URL('./actual.js', cwd), 'utf8')).toMatchFileSnapshot(
          fileURLToPath(new URL('./want.js', cwd)),
        );
      });
    });
  });
});
