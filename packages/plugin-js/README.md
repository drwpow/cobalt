# @cobalt-ui/plugin-js

Generate JSON and JS (with TypeScript types) from your design tokens using [Cobalt](https://cobalt-ui.pages.dev).

**Features**

- ✅ Universal JSON format makes it easy to consume tokens in any platform (including native/compiled code)
- ✅ Access all your design tokens safely and programatically in any frontend or backend setup
- ✅ Full support for token modes (e.g. light/dark mode)
- ✅ Automatic TypeScript types for strong typechecking (never have a broken style)

## Setup

Install the plugin from npm:

```bash
npm i -D @cobalt-ui/plugin-js
```

Then add to your `tokens.config.mjs` file:

```js
// tokens.config.mjs
import pluginJS from '@cobalt-ui/plugin-js';

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    pluginJS({
      /** output JS (with TS types)? boolean or filename (default: true) */
      js: true,
      /** output JSON? boolean or filename (default: false) */
      json: false,
    }),
  ],
};
```

_Note: the default plugin exports a `.d.ts` file alongside the `.js`, which means the same file can either be used in JS or TS._

## Usage

### JS

To use a token, import the `token()` function and reference it by its full ID:

```ts
import {token} from './tokens/index.js';

// get default token
const red = token('color.red.10');

// get token for mode: dark
const redDark = token('color.red.10', 'dark');

// cubicBezier + bezier-easing library
import BezierEasing from 'bezier-easing';
const easing = BezierEasing(...token('ease.cubic-in-out'));
```

You’ll also be able to see any `$description`s specified in your IDE in the form of JSDoc. If using TypeScript, `token()` is statically typed as it‘s only a thin wrapper around the `tokens` and `modes` exports.

In addition, you’ll also find the following named exports:

| Name     | Type     | Description                                                                                         |
| :------- | :------- | :-------------------------------------------------------------------------------------------------- |
| `tokens` | `object` | Object of token ID → value (all aliases resolved & all transformations applied)                     |
| `meta`   | `object` | Object of token ID → metadata (`$type`, `$description`, etc.)                                       |
| `modes`  | `object` | Object of token ID → mode → values (note: tokens without any modes will be missing from the object) |

### JSON

This plugin’s JSON output has the same shape as the JS output. This format is preferable if you’re preparing tokens for an API, or for native apps (iOS or Android).

Note that even if your tokens started off as a `tokens.json` file, this output JSON differs in the following ways:

- It flattens deeply-nested structures into a single depth (e.g. `color.core.blue.500` becomes `tokens["color.core.blue.500"]`)
- It resolves all aliases (so you don’t have to)
- It normalizes token values (especially helpful when the original spec is loose in what’s accepted)

## Options

### All Options

Here are all plugin options, along with their default values:

```js
// tokens.config.mjs
import pluginJS from '@cobalt-ui/plugin-js';

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    pluginJS({
      /** output JS? boolean or filename */
      js: './index.js',
      /** output JSON? boolean or filename */
      json: false,
      /** (optional) transform specific token values */
      transform: () => null,
    }),
  ],
};
```

### Transform

Inside plugin options, you can specify an optional `transform()` function.

```js
/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    pluginJS({
      transform(token, mode) {
        const oldFont = 'sans-serif';
        const newFont = 'Custom Sans';
        if (token.$type === 'fontFamily') {
          return token.$value.map((value) => (value === oldFont ? newFont : value));
        }
      },
    }),
  ],
};
```

Your transform will only take place if you return a truthy value, otherwise the default transformer will take place.
