import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      './frontend-public/vitest.config.ts',
      './frontend-admin/vitest.config.ts',
    ],
  },
});
