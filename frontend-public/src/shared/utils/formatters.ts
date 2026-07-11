import type { ProfileResponse, SkillCategoryResponse, SkillResponse } from '../types/api';

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
  return skills.reduce<Record<number, SkillResponse[]>>((groups, skill) => {
    if (skill.visible === false) {
      return groups;
    }

    const categoryId = skill.category.id;
    groups[categoryId] = [
      ...(groups[categoryId] ?? []),
      skill,
    ].sort((first, second) => first.sortOrder - second.sortOrder || first.name.localeCompare(second.name));

    return groups;
  }, {});
}

export function normalizeSkillCategories(
  categories: SkillCategoryResponse[] | undefined,
  skills: SkillResponse[] = [],
) {
  if (categories?.length) {
    return categories;
  }

  const uniqueCategories = Array.from(
    skills.reduce<Map<number, SkillCategoryResponse>>((uniqueCategories, skill) => {
      uniqueCategories.set(skill.category.id, skill.category);
      return uniqueCategories;
    }, new Map()).values(),
  );

  return uniqueCategories.sort((first, second) => first.name.localeCompare(second.name));
}
