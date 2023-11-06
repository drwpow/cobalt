---
title: Cubic Bézier
---

# Cubic Bézier

An easing curve as defined in [8.6](https://design-tokens.github.io/community-group/format/#cubic-bezier).

::: code-group

```json [JSON]
{
  "linear": {
    "$type": "cubicBezier",
    "$value": [0, 0, 1, 1]
  },
  "easeOutCubic": {
    "$type": "cubicBezier",
    "$value": [0.33, 1, 0.68, 1]
  },
  "easeInCubic": {
    "$type": "cubicBezier",
    "$value": [0.32, 0, 0.67, 0]
  },
  "easeInOutCubic": {
    "$type": "cubicBezier",
    "$value": [0.65, 0, 0.35, 1]
  }
}
```

```yaml [YAML]
linear:
  $type: cubicBezier
  $value:
    - 0
    - 0
    - 1
    - 1
easeOutCubic:
  $type: cubicBezier
  $value:
    - 0.33
    - 1
    - 0.68
    - 1
easeInCubic:
  $type: cubicBezier
  $value:
    - 0.32
    - 0
    - 0.67
    - 0
easeInOutCubic:
  $type: cubicBezier
  $value:
    - 0.65
    - 0
    - 0.35
    - 1
```

:::

| Property       |                Type                | Description                                                                                                                                                                 |
| :------------- | :--------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$type`        |              `string`              | **Required.** `"cubicBezier"`                                                                                                                                               |
| `$value`       | `[number, number, number, number]` | **Required.** An array of four numbers [𝑥1, 𝑦1, 𝑥2, 𝑦2] that behaves the same as a [CSS easing function](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function). |
| `$description` |              `string`              | (Optional) A description of this token and its intended usage.                                                                                                              |

## See also

- A Cubic Bézier can be used within a [transition token](/tokens/transition).
