type ProseProps = {
  content: string | null | undefined;
  fallback: string;
};

export function Prose({ content, fallback }: ProseProps) {
  const paragraphs = (content?.trim() ? content : fallback)
    .split(/\n{2,}|\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="prose">
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}
