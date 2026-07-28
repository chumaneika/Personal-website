/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_SENTRY_DSN?: string;
  readonly VITE_SENTRY_ENVIRONMENT?: string;
  readonly VITE_RELEASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
