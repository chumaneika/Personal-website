export const PUBLICATION_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export const SKILL_CATEGORIES = ['BACKEND', 'FRONTEND', 'DATABASE', 'DEVOPS', 'TOOLS', 'LANGUAGE'] as const;
export const SKILL_LEVELS = ['BASIC', 'INTERMEDIATE', 'ADVANCED'] as const;
export const CONTACT_MESSAGE_STATUSES = ['NEW', 'READ', 'ARCHIVED'] as const;

export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
export type SkillLevel = (typeof SKILL_LEVELS)[number];
export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];

export type AdminMeResponse = {
  email: string;
  role: string;
};

export type DashboardSummaryResponse = {
  totalProjects: number;
  draftProjects: number;
  publishedProjects: number;
  archivedProjects: number;
  totalSkills: number;
  visibleSkills: number;
  hiddenSkills: number;
  totalContactMessages: number;
  newContactMessages: number;
  readContactMessages: number;
  archivedContactMessages: number;
};

export type ProfileResponse = {
  id: number;
  firstName: string;
  lastName: string;
  headline: string;
  shortBio: string | null;
  fullBio: string | null;
  location: string | null;
  email: string | null;
  telegramUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  avatarUrl: string | null;
  resumeUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfileRequest = {
  firstName: string;
  lastName: string;
  headline: string;
  shortBio?: string | null;
  fullBio?: string | null;
  location?: string | null;
  email?: string | null;
  telegramUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  avatarUrl?: string | null;
  resumeUrl?: string | null;
};

export type ProjectResponse = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  problemDescription: string | null;
  solutionDescription: string | null;
  technologyStack: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  coverImageUrl: string | null;
  status: PublicationStatus;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectRequest = {
  title: string;
  slug: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  problemDescription?: string | null;
  solutionDescription?: string | null;
  technologyStack?: string | null;
  githubUrl?: string | null;
  demoUrl?: string | null;
  coverImageUrl?: string | null;
  status?: PublicationStatus;
  startedAt?: string | null;
  completedAt?: string | null;
};

export type SkillResponse = {
  id: number;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  sortOrder: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SkillRequest = {
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  sortOrder?: number;
  visible?: boolean;
};

export type ContactMessageResponse = {
  id: number;
  senderName: string;
  senderEmail: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
  updatedAt: string;
};

export type MetaEnumsResponse = {
  publicationStatuses: string[];
  skillCategories: string[];
  skillLevels: string[];
  contactMessageStatuses: string[];
};
