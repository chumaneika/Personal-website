import { describe, expect, it } from 'vitest';
import {
  getArticleDocumentMetadata,
  getProjectDocumentMetadata,
  getPublicCanonicalUrl,
  getPublicDocumentTitle,
  getPublicMetaDescription,
  getPublicOpenGraphMetadata,
  getPublicTwitterCardMetadata,
} from './documentTitles';

describe('public document titles', () => {
  it('provides a unique title for every static page', () => {
    const titles = [
      '/',
      '/about',
      '/projects',
      '/blog',
      '/skills',
      '/resume',
      '/contacts',
      '/missing',
    ].map(getPublicDocumentTitle);

    expect(new Set(titles).size).toBe(titles.length);
  });

  it('uses the slug to distinguish project and article detail pages', () => {
    expect(getPublicDocumentTitle('/projects/payment-service')).toBe(
      'Payment Service | Projects | Malik',
    );
    expect(getPublicDocumentTitle('/blog/spring-security')).toBe('Spring Security | Blog | Malik');
  });

  it('provides unique descriptions for static and dynamic pages', () => {
    const staticDescriptions = [
      '/',
      '/about',
      '/projects',
      '/blog',
      '/skills',
      '/resume',
      '/contacts',
      '/missing',
    ].map(getPublicMetaDescription);

    expect(new Set(staticDescriptions).size).toBe(staticDescriptions.length);
    expect(getPublicMetaDescription('/projects/payment-service')).toContain('Payment Service');
    expect(getPublicMetaDescription('/blog/spring-security')).toContain('Spring Security');
  });

  it('builds normalized canonical URLs without query parameters or hashes', () => {
    expect(getPublicCanonicalUrl('/projects/', 'https://malik.example/')).toBe(
      'https://malik.example/projects',
    );
    expect(getPublicCanonicalUrl('/projects/payment-service', 'https://malik.example')).toBe(
      'https://malik.example/projects/payment-service',
    );
    expect(getPublicCanonicalUrl('/contact', 'https://malik.example')).toBe(
      'https://malik.example/contacts',
    );
  });

  it('builds Open Graph metadata from the page metadata', () => {
    const projectsMetadata = getPublicOpenGraphMetadata(
      '/projects/payment-service',
      'https://malik.example',
    );
    const articleMetadata = getPublicOpenGraphMetadata(
      '/blog/spring-security',
      'https://malik.example',
    );

    expect(projectsMetadata).toMatchObject({
      'og:title': 'Payment Service | Projects | Malik',
      'og:url': 'https://malik.example/projects/payment-service',
      'og:type': 'website',
      'og:site_name': 'Malik',
      'og:locale': 'en_US',
    });
    expect(projectsMetadata['og:description']).toContain('Payment Service');
    expect(articleMetadata['og:type']).toBe('article');
    expect(articleMetadata['og:description']).toContain('Spring Security');
  });

  it('builds Twitter Card metadata from the page metadata', () => {
    const metadata = getPublicTwitterCardMetadata('/blog/spring-security');

    expect(metadata).toEqual({
      'twitter:card': 'summary',
      'twitter:title': 'Spring Security | Blog | Malik',
      'twitter:description':
        'Read “Spring Security”, an engineering article by Malik about backend development, architecture, and production software.',
    });
  });

  it('builds project metadata from the server response', () => {
    const metadata = getProjectDocumentMetadata(
      {
        id: 1,
        title: 'Payment Platform',
        slug: 'payment-service',
        shortDescription: 'A reliable payment platform for subscription products.',
        fullDescription: null,
        problemDescription: null,
        solutionDescription: null,
        technologyStack: 'Java, Spring Boot',
        githubUrl: null,
        demoUrl: null,
        coverImageUrl: '/images/payment-platform.png',
        coverImageAvifUrl: '/images/payment-platform.avif',
        coverImageWebpUrl: '/images/payment-platform.webp',
        startedAt: null,
        completedAt: null,
        status: 'PUBLISHED',
        createdAt: '2026-07-01T10:00:00Z',
        updatedAt: '2026-07-20T12:00:00Z',
      },
      'https://malik.example',
    );

    expect(metadata).toMatchObject({
      title: 'Payment Platform | Projects | Malik',
      description: 'A reliable payment platform for subscription products.',
      canonicalUrl: 'https://malik.example/projects/payment-service',
      openGraph: {
        'og:title': 'Payment Platform | Projects | Malik',
        'og:image': 'https://malik.example/images/payment-platform.png',
        'og:type': 'website',
      },
      twitterCard: {
        'twitter:card': 'summary_large_image',
        'twitter:image': 'https://malik.example/images/payment-platform.png',
      },
    });
  });

  it('uses a text-only social card while content has no preview image', () => {
    const metadata = getProjectDocumentMetadata(
      {
        id: 1,
        title: 'Project Without Cover',
        slug: 'project-without-cover',
        shortDescription: 'A project whose preview image will be added later.',
        fullDescription: null,
        problemDescription: null,
        solutionDescription: null,
        technologyStack: 'Java, Spring Boot',
        githubUrl: null,
        demoUrl: null,
        coverImageUrl: null,
        coverImageAvifUrl: null,
        coverImageWebpUrl: null,
        startedAt: null,
        completedAt: null,
        status: 'PUBLISHED',
        createdAt: '2026-07-01T10:00:00Z',
        updatedAt: '2026-07-20T12:00:00Z',
      },
      'https://malik.example',
    );

    expect(metadata.openGraph).not.toHaveProperty('og:image');
    expect(metadata.twitterCard).toEqual({
      'twitter:card': 'summary',
      'twitter:title': 'Project Without Cover | Projects | Malik',
      'twitter:description': 'A project whose preview image will be added later.',
    });
  });

  it('builds article metadata with image and publication dates', () => {
    const metadata = getArticleDocumentMetadata(
      {
        id: 2,
        title: 'Reliable Spring APIs',
        slug: 'reliable-spring-apis',
        summary: 'Patterns for building reliable APIs with Spring Boot.',
        content: 'Long article body',
        coverImageUrl: 'https://cdn.example/article.png',
        coverImageAvifUrl: 'https://cdn.example/article.avif',
        coverImageWebpUrl: 'https://cdn.example/article.webp',
        status: 'PUBLISHED',
        createdAt: '2026-07-10T10:00:00Z',
        updatedAt: '2026-07-21T15:30:00Z',
      },
      'https://malik.example',
    );

    expect(metadata).toMatchObject({
      title: 'Reliable Spring APIs | Blog | Malik',
      description: 'Patterns for building reliable APIs with Spring Boot.',
      canonicalUrl: 'https://malik.example/blog/reliable-spring-apis',
      openGraph: {
        'og:type': 'article',
        'og:image': 'https://cdn.example/article.png',
        'article:published_time': '2026-07-10T10:00:00Z',
        'article:modified_time': '2026-07-21T15:30:00Z',
      },
      twitterCard: {
        'twitter:card': 'summary_large_image',
        'twitter:image': 'https://cdn.example/article.png',
      },
    });
  });
});
