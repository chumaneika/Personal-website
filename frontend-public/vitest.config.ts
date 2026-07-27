import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: 'frontend-public',
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    clearMocks: true,
    restoreMocks: true,
  },
});
