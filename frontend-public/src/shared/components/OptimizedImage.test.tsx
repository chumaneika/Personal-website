import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { OptimizedImage } from './OptimizedImage';

describe('OptimizedImage', () => {
  it('offers AVIF and WebP before the fallback image', () => {
    const markup = renderToStaticMarkup(
      <OptimizedImage
        src="/cover.jpg"
        avifSrc="/cover.avif"
        webpSrc="/cover.webp"
        alt=""
        width={800}
        height={500}
        loading="lazy"
      />,
    );

    expect(markup).toContain('<picture>');
    expect(markup.indexOf('type="image/avif"')).toBeLessThan(markup.indexOf('type="image/webp"'));
    expect(markup.indexOf('type="image/webp"')).toBeLessThan(
      markup.indexOf('<img src="/cover.jpg"'),
    );
    expect(markup.match(/width="800"/g)).toHaveLength(3);
    expect(markup.match(/height="500"/g)).toHaveLength(3);
  });

  it('renders only the fallback image when modern sources are absent', () => {
    const markup = renderToStaticMarkup(
      <OptimizedImage src="/cover.jpg" alt="" width={800} height={500} loading="lazy" />,
    );

    expect(markup).not.toContain('<picture>');
    expect(markup).toContain('src="/cover.jpg"');
    expect(markup).toContain('width="800"');
    expect(markup).toContain('height="500"');
  });
});
