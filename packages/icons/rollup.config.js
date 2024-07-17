import swc from '@rollup/plugin-swc';
import ts from '@rollup/plugin-typescript';
import { cleandir } from 'rollup-plugin-cleandir';

/** @type {import("rollup").InputOptions} */
export default {
  plugins: [
    cleandir(),
    ts(),
    swc({
      swc: {
        jsc: {
          parser: {
            dynamicImport: true,
            syntax: 'typescript',
            jsx: true,
            tsx: true,
            topLevelAwait: true,
          },
          target: 'esnext',
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    }),
  ],
  input: 'src/index.tsx',
  external: ['*'],
  output: {
    dir: './dist/',
    sourcemap: true,
    globals: {
      'react/jsx-runtime': 'jsxRuntime',
      'react-dom/client': 'ReactDOM',
      react: 'React',
    },
  },
};
