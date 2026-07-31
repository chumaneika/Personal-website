import { expect, test } from '@playwright/test';

const PUBLIC_BASE_URL = 'http://127.0.0.1:5173';
const ADMIN_BASE_URL = 'http://127.0.0.1:5174';

test('contact, administration, publishing, and logout smoke flow', async ({ browser, request }) => {
  const healthResponse = await request.get(`${PUBLIC_BASE_URL}/healthz`);
  expect(healthResponse.status()).toBe(204);

  const publicContext = await browser.newContext();
  const publicPage = await publicContext.newPage();

  await publicPage.goto(`${PUBLIC_BASE_URL}/contacts`);
  await expect(
    publicPage.getByRole('heading', { name: 'Tell me about the project' }),
  ).toBeVisible();
  await publicPage.getByLabel('Name').fill('Release smoke test');
  await publicPage.getByLabel('Email').fill('smoke@example.invalid');
  await publicPage
    .getByLabel('Message', { exact: true })
    .fill('This automated message verifies the production contact flow.');
  await publicPage.getByLabel(/I have read the privacy notice/).check();
  await publicPage.getByRole('button', { name: 'Send message' }).click();
  await expect(publicPage.getByRole('status')).toHaveText('Message sent. Thank you.');

  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();

  await adminPage.goto(`${ADMIN_BASE_URL}/login`);
  await adminPage.getByLabel('Email').fill('admin@example.invalid');
  await adminPage.getByLabel('Password').fill('e2e-admin-password-123');
  await adminPage.getByRole('button', { name: 'Sign in' }).click();
  await expect(adminPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  const uniqueSuffix = Date.now();
  const projectTitle = `Release smoke project ${uniqueSuffix}`;
  const projectSlug = `release-smoke-project-${uniqueSuffix}`;

  await adminPage.getByRole('link', { name: 'Projects' }).click();
  await adminPage.getByRole('link', { name: 'Create project' }).first().click();
  await adminPage.getByLabel('Title').fill(projectTitle);
  await adminPage.getByLabel('Slug').fill(projectSlug);
  await adminPage.getByLabel('Status').selectOption('PUBLISHED');
  await adminPage
    .getByLabel('Short description')
    .fill('A published project created by the release smoke test.');
  await adminPage
    .getByLabel('Full description')
    .fill('This project verifies the end-to-end admin and public publishing flow.');
  await adminPage.getByLabel('Technology stack').fill('Java, Spring Boot, React');
  await adminPage.getByRole('button', { name: 'Create project' }).click();
  await expect(adminPage.getByRole('status')).toHaveText('Project changes saved.');

  await publicPage.goto(`${PUBLIC_BASE_URL}/projects/${projectSlug}`);
  await expect(publicPage.getByRole('heading', { name: projectTitle })).toBeVisible();

  await adminPage.getByRole('button', { name: 'Logout' }).click();
  await expect(adminPage.getByRole('heading', { name: 'Sign in' })).toBeVisible();

  await publicContext.close();
  await adminContext.close();
});
