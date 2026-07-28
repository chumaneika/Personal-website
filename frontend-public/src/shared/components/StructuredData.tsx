import { serializeStructuredData, type JsonLdValue } from '../../app/structuredData';

type StructuredDataProps = {
  data: JsonLdValue;
};

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeStructuredData(data) }}
    />
  );
}
