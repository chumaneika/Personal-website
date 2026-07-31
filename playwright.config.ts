import { defineConfig, devices } from '@playwright/test';

const PUBLIC_BASE_URL = 'http://127.0.0.1:5173';
const ADMIN_BASE_URL = 'http://127.0.0.1:5174';
const BACKEND_BASE_URL = 'http://127.0.0.1:8080';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: PUBLIC_BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'cd springboot && ./mvnw --batch-mode --no-transfer-progress spring-boot:run',
      url: `${BACKEND_BASE_URL}/actuator/health/readiness`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        SPRING_DATASOURCE_URL:
          process.env.SPRING_DATASOURCE_URL ??
          'jdbc:postgresql://127.0.0.1:5432/personal_website_e2e',
        SPRING_DATASOURCE_USERNAME:
          process.env.SPRING_DATASOURCE_USERNAME ?? 'personal_website_e2e',
        SPRING_DATASOURCE_PASSWORD:
          process.env.SPRING_DATASOURCE_PASSWORD ?? 'e2e-database-password',
        APP_ADMIN_INITIALIZER_ENABLED: 'true',
        APP_ADMIN_EMAIL: process.env.APP_ADMIN_EMAIL ?? 'admin@example.invalid',
        APP_ADMIN_PASSWORD: process.env.APP_ADMIN_PASSWORD ?? 'e2e-admin-password-123',
        APP_CORS_ALLOWED_ORIGINS: `${PUBLIC_BASE_URL},${ADMIN_BASE_URL}`,
        APP_SESSION_COOKIE_SECURE: 'false',
        APP_SESSION_COOKIE_SAME_SITE: 'lax',
        APP_SECURITY_REQUIRE_HTTPS: 'false',
        APP_CONTACT_EMAIL_NOTIFICATIONS_ENABLED: 'false',
        SENTRY_ENABLED: 'false',
      },
    },
    {
      command: 'npm run dev:public -- --force',
      url: `${PUBLIC_BASE_URL}/healthz`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        PUBLIC_BACKEND_INTERNAL_URL: `${BACKEND_BASE_URL}/api`,
        PUBLIC_SITE_ORIGIN: PUBLIC_BASE_URL,
      },
    },
    {
      command: 'npm run dev:admin -- --force',
      url: `${ADMIN_BASE_URL}/login`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
