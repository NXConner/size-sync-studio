export function setOrAppendParam(url: string, key: string, value: string | number): string {
  const hasQuery = url.includes('?');
  const pattern = new RegExp(`([?&])${key}=[^&]*`);
  if (pattern.test(url)) {
    return url.replace(pattern, `$1${key}=${value}`);
  }
  return url + (hasQuery ? `&${key}=${value}` : `?${key}=${value}`);
}

export function buildSrcSet(baseUrl: string, widths: number[], format?: 'webp' | 'avif'): string {
  const entries = widths.map((w) => {
    let u = setOrAppendParam(baseUrl, 'w', w);
    if (format) {
      u = setOrAppendParam(u, 'fm', format);
    }
    return `${u} ${w}w`;
  });
  return entries.join(', ');
}

export const responsiveSizes = "(min-width: 1536px) 16.66vw, (min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw";

