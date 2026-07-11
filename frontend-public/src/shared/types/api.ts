export type PublicationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type SkillLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';

export type ContactMessageStatus = 'NEW' | 'READ' | 'ARCHIVED';

export type HealthResponse = {
  status: string;
  application: string;
  timestamp: string;
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

export type ProjectSummaryResponse = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  technologyStack: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  coverImageUrl: string | null;
  startedAt: string | null;
  completedAt: string | null;
};

export type ProjectResponse = ProjectSummaryResponse & {
  fullDescription: string | null;
  problemDescription: string | null;
  solutionDescription: string | null;
  status: PublicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type SkillCategoryResponse = {
  id: number;
  name: string;
};

export type SkillResponse = {
  id: number;
  name: string;
  category: SkillCategoryResponse;
  level: SkillLevel;
  sortOrder: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EnumValuesResponse = {
  publicationStatuses: PublicationStatus[];
  skillCategories: SkillCategoryResponse[];
  skillLevels: SkillLevel[];
  contactMessageStatuses: ContactMessageStatus[];
};

export type HomeResponse = {
  profile: ProfileResponse | null;
  projects: ProjectSummaryResponse[];
  skills: SkillResponse[];
};

export type ContactMessageRequest = {
  senderName: string;
  senderEmail: string;
  message: string;
};

export type ContactMessageResponse = ContactMessageRequest & {
  id: number;
  status: ContactMessageStatus;
  createdAt: string;
  updatedAt: string;
};
