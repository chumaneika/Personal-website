import type { ProfileResponse, SkillCategory, SkillResponse } from '../types/api';

export const skillCategoryOrder: SkillCategory[] = [
  'BACKEND',
  'FRONTEND',
  'DATABASE',
  'DEVOPS',
  'TOOLS',
  'LANGUAGE',
];

export const skillCategoryLabels: Record<SkillCategory, string> = {
  BACKEND: 'Backend',
  FRONTEND: 'Frontend',
  DATABASE: 'Database',
  DEVOPS: 'DevOps',
  TOOLS: 'Tools',
  LANGUAGE: 'Languages',
};

export const skillLevelLabels = {
  BASIC: 'Basic',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
} as const;

export function getProfileName(profile: Pick<ProfileResponse, 'firstName' | 'lastName'> | null | undefined) {
  if (!profile) {
    return 'Malik Alikberov';
  }

  return [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Malik Alikberov';
}

export function getInitials(profile: Pick<ProfileResponse, 'firstName' | 'lastName'> | null | undefined) {
  const name = getProfileName(profile);
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function splitTechnologyStack(technologyStack: string | null | undefined) {
  if (!technologyStack) {
    return [];
  }

  if (!technologyStack.includes(',') && !technologyStack.includes(';') && !technologyStack.includes('\n')) {
    return [technologyStack.trim()];
  }

  return technologyStack
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatMonthYear(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function groupSkillsByCategory(skills: SkillResponse[]) {
  return skillCategoryOrder.reduce<Record<SkillCategory, SkillResponse[]>>((groups, category) => {
    groups[category] = skills
      .filter((skill) => skill.visible !== false && skill.category === category)
      .sort((first, second) => first.sortOrder - second.sortOrder || first.name.localeCompare(second.name));

    return groups;
  }, {} as Record<SkillCategory, SkillResponse[]>);
}

export function normalizeSkillCategories(categories: SkillCategory[] | undefined) {
  if (!categories?.length) {
    return skillCategoryOrder;
  }

  return skillCategoryOrder.filter((category) => categories.includes(category));
}
