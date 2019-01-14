import tinyColor from 'tinycolor2'

export function toColor(color) {
  return tinyColor(color)
}

export function toPure(color) {
  const h = toColor(color).toHsl().h;

  return toColor({h, s: 100, l: 50, a: 1});
}

export function fromRatio(color) {
  return tinyColor.fromRatio(color);
}

export function toAlpha(color, alpha) {
  if (alpha > 1) {
    alpha = alpha / 100;
  }

  color = toColor(color).toRgb();
  color.a = alpha;

  return toColor(color);
}

export function toHsv(color) {
  return toColor(color).toHsv();
}
