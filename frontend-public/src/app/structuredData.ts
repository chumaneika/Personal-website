import type { ArticleResponse, ProfileResponse, SkillResponse } from '../shared/types/api';

const DEFAULT_AUTHOR_NAME = 'Malik Alikberov';

export type JsonLdValue = Record<string, unknown>;

export function serializeStructuredData(data: JsonLdValue) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function getSiteUrl(origin: string) {
  return new URL('/', `${origin.replace(/\/+$/, '')}/`).toString();
}

function getPersonId(origin: string) {
  return new URL('/#person', `${origin.replace(/\/+$/, '')}/`).toString();
}

function resolveAbsoluteUrl(value: string | null | undefined, origin: string) {
  if (!value?.trim()) {
    return null;
  }

  try {
    const url = new URL(value, getSiteUrl(origin));
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function toPlainText(value: string | null | undefined) {
  return (
    value
      ?.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[`*_#>|~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || null
  );
}

function getProfileName(profile: ProfileResponse) {
  return (
    [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() || DEFAULT_AUTHOR_NAME
  );
}

export function getPersonStructuredData(
  profile: ProfileResponse,
  origin: string,
  skills: SkillResponse[] = [],
): JsonLdValue {
  const description = toPlainText(profile.shortBio ?? profile.fullBio);
  const sameAs = [profile.githubUrl, profile.linkedinUrl, profile.telegramUrl]
    .map((url) => resolveAbsoluteUrl(url, origin))
    .filter((url): url is string => Boolean(url));
  const image = resolveAbsoluteUrl(profile.avatarUrl, origin);
  const resumeUrl = resolveAbsoluteUrl(profile.resumeUrl, origin);
  const knowsAbout = [
    ...new Set(skills.filter((skill) => skill.visible).map((skill) => skill.name)),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': getPersonId(origin),
    name: getProfileName(profile),
    url: getSiteUrl(origin),
    ...(profile.headline && { jobTitle: profile.headline }),
    ...(description && { description }),
    ...(profile.email && { email: profile.email }),
    ...(image && { image }),
    ...(sameAs.length > 0 && { sameAs }),
    ...(profile.location && {
      homeLocation: {
        '@type': 'Place',
        name: profile.location,
      },
    }),
    ...(resumeUrl && {
      subjectOf: {
        '@type': 'CreativeWork',
        url: resumeUrl,
        name: `${getProfileName(profile)} resume`,
      },
    }),
    ...(knowsAbout.length > 0 && { knowsAbout }),
  };
}

export function getArticleStructuredData(
  article: ArticleResponse,
  origin: string,
  description: string,
): JsonLdValue {
  const siteUrl = getSiteUrl(origin);
  const canonicalUrl = new URL(`/blog/${encodeURIComponent(article.slug)}`, siteUrl).toString();
  const image = resolveAbsoluteUrl(article.coverImageUrl, origin);
  const author = {
    '@type': 'Person',
    '@id': getPersonId(origin),
    name: DEFAULT_AUTHOR_NAME,
    url: siteUrl,
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${canonicalUrl}#article`,
    headline: article.title,
    description,
    url: canonicalUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    author,
    publisher: author,
    ...(image && { image }),
  };
}
