import { describe, expect, it } from 'vitest';
import {
  getAdminCanonicalUrl,
  getAdminDocumentTitle,
  getAdminMetaDescription,
  getAdminOpenGraphMetadata,
  getAdminTwitterCardMetadata,
} from './documentTitles';

describe('admin document titles', () => {
  it('provides a unique title for every static page', () => {
    const titles = [
      '/',
      '/login',
      '/profile',
      '/projects',
      '/projects/new',
      '/articles',
      '/articles/new',
      '/skills',
      '/skills/new',
      '/skill-categories',
      '/skill-categories/new',
      '/messages',
      '/settings',
      '/missing',
    ].map(getAdminDocumentTitle);

    expect(new Set(titles).size).toBe(titles.length);
  });

  it('uses entity ids to distinguish detail and edit pages', () => {
    expect(getAdminDocumentTitle('/projects/12/settings')).toBe(
      'Project Settings #12 | Malik Admin',
    );
    expect(getAdminDocumentTitle('/articles/7/edit')).toBe('Edit Article #7 | Malik Admin');
    expect(getAdminDocumentTitle('/messages/42')).toBe('Message #42 | Malik Admin');
  });

  it('provides unique descriptions for static and dynamic pages', () => {
    const staticDescriptions = [
      '/',
      '/login',
      '/profile',
      '/projects',
      '/projects/new',
      '/articles',
      '/articles/new',
      '/skills',
      '/skills/new',
      '/skill-categories',
      '/skill-categories/new',
      '/messages',
      '/settings',
      '/missing',
    ].map(getAdminMetaDescription);

    expect(new Set(staticDescriptions).size).toBe(staticDescriptions.length);
    expect(getAdminMetaDescription('/projects/12/settings')).toContain('project #12');
    expect(getAdminMetaDescription('/articles/7/edit')).toContain('article #7');
    expect(getAdminMetaDescription('/messages/42')).toContain('message #42');
  });

  it('builds normalized canonical URLs for admin pages', () => {
    expect(getAdminCanonicalUrl('/projects/', 'https://admin.malik.example/')).toBe(
      'https://admin.malik.example/projects',
    );
    expect(getAdminCanonicalUrl('/articles/7/edit', 'https://admin.malik.example')).toBe(
      'https://admin.malik.example/articles/7/edit',
    );
  });

  it('builds Open Graph metadata from the admin page metadata', () => {
    const metadata = getAdminOpenGraphMetadata(
      '/projects/12/settings',
      'https://admin.malik.example',
    );

    expect(metadata).toMatchObject({
      'og:title': 'Project Settings #12 | Malik Admin',
      'og:url': 'https://admin.malik.example/projects/12/settings',
      'og:type': 'website',
      'og:site_name': 'Malik Admin',
      'og:locale': 'en_US',
    });
    expect(metadata['og:description']).toContain('project #12');
  });

  it('builds Twitter Card metadata from the admin page metadata', () => {
    const metadata = getAdminTwitterCardMetadata('/projects/12/settings');

    expect(metadata).toEqual({
      'twitter:card': 'summary',
      'twitter:title': 'Project Settings #12 | Malik Admin',
      'twitter:description':
        'Configure portfolio project #12, including its content, links, dates, and publication status.',
    });
  });
});
