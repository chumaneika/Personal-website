import type { ReactNode } from 'react';

type PageStateProps = {
  title: string;
  message: string;
  eyebrow?: string;
  action?: ReactNode;
  compact?: boolean;
};

export function PageState({ title, message, eyebrow, action, compact = false }: PageStateProps) {
  const Heading = compact ? 'h2' : 'h1';

  return (
    <section className={compact ? 'page-state page-state--compact' : 'page-state'}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Heading>{title}</Heading>
      <p>{message}</p>
      {action && <div className="page-state__action">{action}</div>}
    </section>
  );
}

export function LoadingState({ label = 'Loading content...' }: { label?: string }) {
  return (
    <section className="page-state" aria-live="polite" aria-busy="true">
      <div className="loader" aria-hidden="true" />
      <p>{label}</p>
    </section>
  );
}
