import type { PublicDocumentMetadata } from '../../app/documentTitles';

type SeoMetadataProps = {
  metadata: PublicDocumentMetadata;
  noIndex?: boolean;
};

export function SeoMetadata({ metadata, noIndex = false }: SeoMetadataProps) {
  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <link rel="canonical" href={metadata.canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex" />}
      {Object.entries(metadata.openGraph).map(([property, content]) => (
        <meta key={property} property={property} content={content} />
      ))}
      {Object.entries(metadata.twitterCard).map(([name, content]) => (
        <meta key={name} name={name} content={content} />
      ))}
    </>
  );
}
