import ts from '@rollup/plugin-typescript';
import css from 'rollup-plugin-import-css';
import { cleandir } from 'rollup-plugin-cleandir';

/** @type {import("rollup").InputOptions} */
export default {
  plugins: [
    cleandir(),
    css({
      output: 'all-components.css',
    }),
    ts({
      tsconfig: './tsconfig.build.json',
    }),
  ],
  input: 'src/index.ts',
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
