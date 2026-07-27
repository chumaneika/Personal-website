import {
  type ArticleResponse,
  type ContactMessageResponse,
  type ProjectResponse,
  type SkillResponse,
} from '../shared/types/api';

const timestamp = '2026-07-27T12:00:00Z';

export function projectFixture(overrides: Partial<ProjectResponse> = {}): ProjectResponse {
  return {
    id: 1,
    title: 'Payments API',
    slug: 'payments-api',
    shortDescription: 'Reliable payment processing.',
    fullDescription: 'A production-ready payment platform.',
    problemDescription: null,
    solutionDescription: null,
    technologyStack: 'Java, Spring Boot',
    githubUrl: 'https://github.com/example/payments',
    demoUrl: null,
    coverImageUrl: null,
    status: 'DRAFT',
    startedAt: null,
    completedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

export function articleFixture(overrides: Partial<ArticleResponse> = {}): ArticleResponse {
  return {
    id: 2,
    title: 'Reliable APIs',
    slug: 'reliable-apis',
    summary: 'Patterns for resilient HTTP APIs.',
    content: 'Use explicit contracts and observable failure modes.',
    coverImageUrl: null,
    status: 'DRAFT',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

export function skillFixture(overrides: Partial<SkillResponse> = {}): SkillResponse {
  return {
    id: 3,
    name: 'Spring Boot',
    category: { id: 7, name: 'Backend' },
    level: 'ADVANCED',
    sortOrder: 1,
    visible: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

export function messageFixture(
  overrides: Partial<ContactMessageResponse> = {},
): ContactMessageResponse {
  return {
    id: 4,
    senderName: 'Ada Lovelace',
    senderEmail: 'ada@example.com',
    message: 'I would like to discuss a backend project.',
    status: 'NEW',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}
