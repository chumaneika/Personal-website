import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { ArticleResponse, ProfileResponse, SkillResponse } from '../shared/types/api';
import {
  getArticleStructuredData,
  getPersonStructuredData,
  serializeStructuredData,
} from './structuredData';
import { StructuredData } from '../shared/components/StructuredData';

const profile: ProfileResponse = {
  id: 1,
  firstName: 'Malik',
  lastName: 'Alikberov',
  headline: 'Java Backend Developer',
  shortBio: 'Backend engineer',
  fullBio: null,
  location: 'Moscow',
  email: 'malik@example.com',
  telegramUrl: 'https://t.me/example',
  githubUrl: 'https://github.com/example',
  linkedinUrl: null,
  avatarUrl: '/avatar.jpg',
  avatarAvifUrl: '/avatar.avif',
  avatarWebpUrl: '/avatar.webp',
  resumeUrl: '/resume.pdf',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
};

const skill: SkillResponse = {
  id: 1,
  name: 'Spring Boot',
  category: { id: 1, name: 'Backend' },
  level: 'ADVANCED',
  sortOrder: 10,
  visible: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
};

const article: ArticleResponse = {
  id: 1,
  title: 'Safe SSR',
  slug: 'safe-ssr',
  summary: 'Rendering React safely on the server.',
  content: 'Article content',
  coverImageUrl: '/article.jpg',
  coverImageAvifUrl: '/article.avif',
  coverImageWebpUrl: '/article.webp',
  status: 'PUBLISHED',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
};

describe('structured data', () => {
  it('creates a Person entity from the public profile', () => {
    expect(getPersonStructuredData(profile, 'https://example.com', [skill])).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': 'https://example.com/#person',
      name: 'Malik Alikberov',
      image: 'https://example.com/avatar.jpg',
      sameAs: ['https://github.com/example', 'https://t.me/example'],
      knowsAbout: ['Spring Boot'],
    });
  });

  it('creates a BlogPosting linked to the Person entity', () => {
    expect(
      getArticleStructuredData(article, 'https://example.com', article.summary ?? ''),
    ).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': 'https://example.com/blog/safe-ssr#article',
      headline: 'Safe SSR',
      image: 'https://example.com/article.jpg',
      author: {
        '@id': 'https://example.com/#person',
      },
    });
  });

  it('escapes HTML-significant characters inside the JSON-LD script', () => {
    const data = { name: '</script><script>alert("xss")</script>' };
    const serialized = serializeStructuredData(data);
    const markup = renderToStaticMarkup(<StructuredData data={data} />);

    expect(serialized).toContain('\\u003c/script\\u003e');
    expect(markup).not.toContain('</script><script>');
  });
});
