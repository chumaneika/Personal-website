import type { ArticleResponse, ProjectResponse } from '../shared/types/api';

const SITE_NAME = 'Malik';
const MAX_DESCRIPTION_LENGTH = 160;
const DEFAULT_SOCIAL_IMAGE_PATH = '/og-default.png';
const DEFAULT_SOCIAL_IMAGE_ALT = 'Malik Alikberov — Java Backend Developer';

export type PublicDocumentMetadata = {
  title: string;
  description: string;
  canonicalUrl: string;
  openGraph: Record<string, string>;
  twitterCard: Record<string, string>;
};

function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, '') || '/';
}

function formatPathSegment(segment: string) {
  let decodedSegment = segment;

  try {
    decodedSegment = decodeURIComponent(segment);
  } catch {
    // Keep the original segment when the URL contains invalid encoding.
  }

  return decodedSegment
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\p{L}/gu, (character) => character.toUpperCase());
}

function toMetaDescription(value: string | null | undefined, fallback: string) {
  const normalizedValue = value
    ?.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[`*_#>|~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const description = normalizedValue || fallback;

  if (description.length <= MAX_DESCRIPTION_LENGTH) {
    return description;
  }

  const shortenedDescription = description
    .slice(0, MAX_DESCRIPTION_LENGTH - 1)
    .replace(/\s+\S*$/, '')
    .trimEnd();

  return `${shortenedDescription}…`;
}

function resolveAbsoluteUrl(url: string | null | undefined, origin: string) {
  if (!url?.trim()) {
    return null;
  }

  try {
    return new URL(url, `${origin.replace(/\/+$/, '')}/`).toString();
  } catch {
    return null;
  }
}

function createDocumentMetadata({
  title,
  description,
  canonicalUrl,
  type,
  imageUrl,
  imageAlt,
  articlePublishedTime,
  articleModifiedTime,
}: {
  title: string;
  description: string;
  canonicalUrl: string;
  type: 'website' | 'article';
  imageUrl?: string | null;
  imageAlt?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
}): PublicDocumentMetadata {
  const usesDefaultImage = !imageUrl;
  const socialImageUrl = imageUrl ?? new URL(DEFAULT_SOCIAL_IMAGE_PATH, canonicalUrl).toString();
  const socialImageAlt = imageUrl ? (imageAlt ?? title) : DEFAULT_SOCIAL_IMAGE_ALT;
  const openGraph: Record<string, string> = {
    'og:title': title,
    'og:description': description,
    'og:url': canonicalUrl,
    'og:type': type,
    'og:site_name': SITE_NAME,
    'og:locale': 'en_US',
    'og:image': socialImageUrl,
    'og:image:alt': socialImageAlt,
  };
  const twitterCard: Record<string, string> = {
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': socialImageUrl,
    'twitter:image:alt': socialImageAlt,
  };

  if (usesDefaultImage) {
    openGraph['og:image:type'] = 'image/png';
    openGraph['og:image:width'] = '1200';
    openGraph['og:image:height'] = '630';
  }

  if (type === 'article') {
    if (articlePublishedTime) {
      openGraph['article:published_time'] = articlePublishedTime;
    }
    if (articleModifiedTime) {
      openGraph['article:modified_time'] = articleModifiedTime;
    }
  }

  return {
    title,
    description,
    canonicalUrl,
    openGraph,
    twitterCard,
  };
}

export function getPublicDocumentTitle(pathname: string) {
  const normalizedPathname = normalizePathname(pathname);
  const staticTitles: Record<string, string> = {
    '/': `Java Backend Developer | ${SITE_NAME}`,
    '/about': `About | ${SITE_NAME}`,
    '/projects': `Projects | ${SITE_NAME}`,
    '/blog': `Blog | ${SITE_NAME}`,
    '/skills': `Skills | ${SITE_NAME}`,
    '/resume': `Resume | ${SITE_NAME}`,
    '/contacts': `Contact | ${SITE_NAME}`,
    '/contact': `Contact | ${SITE_NAME}`,
  };
  const staticTitle = staticTitles[normalizedPathname];

  if (staticTitle) {
    return staticTitle;
  }

  const projectMatch = normalizedPathname.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    return `${formatPathSegment(projectMatch[1])} | Projects | ${SITE_NAME}`;
  }

  const articleMatch = normalizedPathname.match(/^\/blog\/([^/]+)$/);
  if (articleMatch) {
    return `${formatPathSegment(articleMatch[1])} | Blog | ${SITE_NAME}`;
  }

  return `Page Not Found | ${SITE_NAME}`;
}

export function getPublicMetaDescription(pathname: string) {
  const normalizedPathname = normalizePathname(pathname);
  const staticDescriptions: Record<string, string> = {
    '/': 'Portfolio of Malik, a Java backend developer focused on Spring Boot, APIs, databases, and production-ready systems.',
    '/about':
      'Learn more about Malik, his backend engineering experience, professional focus, and approach to software development.',
    '/projects':
      'Explore backend systems, APIs, integrations, and production-oriented software projects built by Malik.',
    '/blog':
      'Read Malik’s engineering notes about Java, Spring Boot, backend architecture, APIs, and production development.',
    '/skills':
      'Review Malik’s backend, frontend, database, DevOps, tooling, and programming language skills.',
    '/resume':
      'View Malik’s professional resume, backend development experience, technical focus, and career information.',
    '/contacts':
      'Contact Malik to discuss backend development, APIs, integrations, software projects, or engineering opportunities.',
    '/contact':
      'Contact Malik to discuss backend development, APIs, integrations, software projects, or engineering opportunities.',
  };
  const staticDescription = staticDescriptions[normalizedPathname];

  if (staticDescription) {
    return staticDescription;
  }

  const projectMatch = normalizedPathname.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    const projectName = formatPathSegment(projectMatch[1]);
    return `Read about ${projectName}, a software project by Malik, including its goals, implementation, technologies, and results.`;
  }

  const articleMatch = normalizedPathname.match(/^\/blog\/([^/]+)$/);
  if (articleMatch) {
    const articleName = formatPathSegment(articleMatch[1]);
    return `Read “${articleName}”, an engineering article by Malik about backend development, architecture, and production software.`;
  }

  return 'The requested page could not be found on Malik’s software engineering portfolio.';
}

export function getPublicCanonicalUrl(pathname: string, origin: string) {
  const normalizedPathname = normalizePathname(pathname);
  const canonicalPathname = normalizedPathname === '/contact' ? '/contacts' : normalizedPathname;

  return new URL(canonicalPathname, `${origin.replace(/\/+$/, '')}/`).toString();
}

export function getPublicOpenGraphMetadata(pathname: string, origin: string) {
  return getPublicDocumentMetadata(pathname, origin).openGraph;
}

export function getPublicTwitterCardMetadata(pathname: string, origin: string) {
  return getPublicDocumentMetadata(pathname, origin).twitterCard;
}

export function getPublicDocumentMetadata(
  pathname: string,
  origin: string,
): PublicDocumentMetadata {
  const normalizedPathname = normalizePathname(pathname);

  return createDocumentMetadata({
    title: getPublicDocumentTitle(normalizedPathname),
    description: getPublicMetaDescription(normalizedPathname),
    canonicalUrl: getPublicCanonicalUrl(normalizedPathname, origin),
    type: /^\/blog\/[^/]+$/.test(normalizedPathname) ? 'article' : 'website',
  });
}

export function getProjectDocumentMetadata(
  project: ProjectResponse,
  origin: string,
): PublicDocumentMetadata {
  const title = `${project.title} | Projects | ${SITE_NAME}`;
  const fallbackDescription = `Read about ${project.title}, a software project by Malik, including its goals, implementation, technologies, and results.`;
  const description = toMetaDescription(
    project.shortDescription ?? project.fullDescription,
    fallbackDescription,
  );
  const canonicalUrl = getPublicCanonicalUrl(
    `/projects/${encodeURIComponent(project.slug)}`,
    origin,
  );

  return createDocumentMetadata({
    title,
    description,
    canonicalUrl,
    type: 'website',
    // TODO(social-preview): Keep project cover support, but only store direct
    // HTTPS image resources in coverImageUrl (not an HTML page URL).
    imageUrl: resolveAbsoluteUrl(project.coverImageUrl, origin),
    imageAlt: `${project.title} project preview`,
  });
}

export function getArticleDocumentMetadata(
  article: ArticleResponse,
  origin: string,
): PublicDocumentMetadata {
  const title = `${article.title} | Blog | ${SITE_NAME}`;
  const fallbackDescription = `Read “${article.title}”, an engineering article by Malik about backend development, architecture, and production software.`;
  const description = toMetaDescription(article.summary ?? article.content, fallbackDescription);
  const canonicalUrl = getPublicCanonicalUrl(`/blog/${encodeURIComponent(article.slug)}`, origin);

  return createDocumentMetadata({
    title,
    description,
    canonicalUrl,
    type: 'article',
    imageUrl: resolveAbsoluteUrl(article.coverImageUrl, origin),
    imageAlt: `${article.title} article preview`,
    articlePublishedTime: article.createdAt,
    articleModifiedTime: article.updatedAt,
  });
}
