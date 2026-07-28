import type { ImgHTMLAttributes } from 'react';

type OptimizedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height'> & {
  src: string;
  width: number;
  height: number;
  avifSrc?: string | null;
  webpSrc?: string | null;
  pictureClassName?: string;
};

function normalizeSource(source?: string | null) {
  return source?.trim() || null;
}

export function OptimizedImage({
  src,
  avifSrc,
  webpSrc,
  pictureClassName,
  width,
  height,
  ...imageProps
}: OptimizedImageProps) {
  const normalizedAvifSrc = normalizeSource(avifSrc);
  const normalizedWebpSrc = normalizeSource(webpSrc);
  const image = <img src={src} width={width} height={height} {...imageProps} />;

  if (!normalizedAvifSrc && !normalizedWebpSrc) {
    return image;
  }

  return (
    <picture className={pictureClassName}>
      {normalizedAvifSrc && (
        <source srcSet={normalizedAvifSrc} type="image/avif" width={width} height={height} />
      )}
      {normalizedWebpSrc && (
        <source srcSet={normalizedWebpSrc} type="image/webp" width={width} height={height} />
      )}
      {image}
    </picture>
  );
}
