import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SkillCategoriesPage } from './SkillCategoriesPage';
import { SkillCategoryFormPage } from './SkillCategoryFormPage';
import { SkillFormPage } from './SkillFormPage';
import { SkillsPage } from './SkillsPage';
import { skillFixture } from '../test/fixtures';
import { renderAdminRoute } from '../test/render';

const skillMocks = vi.hoisted(() => ({
  createSkill: vi.fn(),
  deleteSkill: vi.fn(),
  fetchSkill: vi.fn(),
  fetchSkills: vi.fn(),
  updateSkill: vi.fn(),
  updateSkillVisibility: vi.fn(),
}));
const categoryMocks = vi.hoisted(() => ({
  createSkillCategory: vi.fn(),
  deleteSkillCategory: vi.fn(),
  fetchSkillCategories: vi.fn(),
  fetchSkillCategory: vi.fn(),
  updateSkillCategory: vi.fn(),
}));
const metaMocks = vi.hoisted(() => ({
  fetchMetaEnums: vi.fn(),
}));

vi.mock('../shared/api/skills', () => skillMocks);
vi.mock('../shared/api/skillCategories', () => categoryMocks);
vi.mock('../shared/api/meta', () => metaMocks);

const meta = {
  publicationStatuses: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
  skillCategories: [{ id: 7, name: 'Backend' }],
  skillLevels: ['BASIC', 'INTERMEDIATE', 'ADVANCED'],
  contactMessageStatuses: ['NEW', 'READ', 'ARCHIVED'],
};

describe('skill and category CRUD', () => {
  beforeEach(() => {
    Object.values(skillMocks).forEach((mock) => mock.mockReset());
    Object.values(categoryMocks).forEach((mock) => mock.mockReset());
    metaMocks.fetchMetaEnums.mockReset();
    metaMocks.fetchMetaEnums.mockResolvedValue(meta);
  });

  it('creates a skill with its category, level, order, and visibility', async () => {
    skillMocks.createSkill.mockResolvedValue(skillFixture({ id: 30, name: 'PostgreSQL' }));

    const { router, user } = renderAdminRoute(<SkillFormPage />, {
      route: '/skills/new',
      path: '/skills/new',
    });

    await user.type(screen.getByLabelText('Name'), 'PostgreSQL');
    await user.selectOptions(await screen.findByLabelText('Category'), '7');
    await user.selectOptions(screen.getByLabelText('Level'), 'ADVANCED');
    await user.clear(screen.getByLabelText('Sort order'));
    await user.type(screen.getByLabelText('Sort order'), '2');
    await user.click(screen.getByRole('button', { name: 'Add skill' }));

    await waitFor(() =>
      expect(skillMocks.createSkill).toHaveBeenCalledWith({
        name: 'PostgreSQL',
        categoryId: 7,
        level: 'ADVANCED',
        sortOrder: 2,
        visible: true,
      }),
    );
    expect(router.state.location.pathname).toBe('/skills/30/edit');
  });

  it('loads and updates an existing skill', async () => {
    const existingSkill = skillFixture();
    skillMocks.fetchSkill.mockResolvedValue(existingSkill);
    skillMocks.updateSkill.mockImplementation(async (_id, payload) => ({
      ...existingSkill,
      ...payload,
      category: existingSkill.category,
    }));

    const { user } = renderAdminRoute(<SkillFormPage />, {
      route: '/skills/3/edit',
      path: '/skills/:id/edit',
    });

    const nameInput = await screen.findByLabelText('Name');
    expect(nameInput).toHaveValue('Spring Boot');
    await user.clear(nameInput);
    await user.type(nameInput, 'Spring Framework');
    await user.click(screen.getByRole('button', { name: 'Save skill' }));

    await waitFor(() =>
      expect(skillMocks.updateSkill).toHaveBeenCalledWith(
        3,
        expect.objectContaining({ name: 'Spring Framework', categoryId: 7 }),
      ),
    );
    expect(await screen.findByText('Skill saved.')).toBeInTheDocument();
  });

  it('lists, hides, and deletes a skill', async () => {
    const skill = skillFixture();
    skillMocks.fetchSkills.mockResolvedValue([skill]);
    skillMocks.updateSkillVisibility.mockResolvedValue({ ...skill, visible: false });
    skillMocks.deleteSkill.mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const { user } = renderAdminRoute(<SkillsPage />, {
      route: '/skills',
      path: '/skills',
    });

    expect(await screen.findByText('Spring Boot')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Hide' }));
    await waitFor(() => expect(skillMocks.updateSkillVisibility).toHaveBeenCalledWith(3, false));
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(skillMocks.deleteSkill.mock.calls[0]?.[0]).toBe(3));
  });

  it('creates and updates a skill category with confirmation', async () => {
    categoryMocks.createSkillCategory.mockResolvedValue({ id: 8, name: 'Databases' });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const created = renderAdminRoute(<SkillCategoryFormPage />, {
      route: '/skill-categories/new',
      path: '/skill-categories/new',
    });
    await created.user.type(screen.getByLabelText('Name'), ' Databases ');
    await created.user.click(screen.getByRole('button', { name: 'Add category' }));

    await waitFor(() =>
      expect(categoryMocks.createSkillCategory).toHaveBeenCalledWith({ name: 'Databases' }),
    );
    expect(created.router.state.location.pathname).toBe('/skill-categories');

    created.unmount();
    categoryMocks.fetchSkillCategory.mockResolvedValue({ id: 8, name: 'Databases' });
    categoryMocks.updateSkillCategory.mockResolvedValue({ id: 8, name: 'Data stores' });

    const updated = renderAdminRoute(<SkillCategoryFormPage />, {
      route: '/skill-categories/8/edit',
      path: '/skill-categories/:id/edit',
    });
    const nameInput = await screen.findByLabelText('Name');
    await updated.user.clear(nameInput);
    await updated.user.type(nameInput, 'Data stores');
    await updated.user.click(screen.getByRole('button', { name: 'Save category' }));

    await waitFor(() =>
      expect(categoryMocks.updateSkillCategory).toHaveBeenCalledWith(8, { name: 'Data stores' }),
    );
  });

  it('lists and deletes a skill category', async () => {
    categoryMocks.fetchSkillCategories.mockResolvedValue([{ id: 7, name: 'Backend' }]);
    categoryMocks.deleteSkillCategory.mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const { user } = renderAdminRoute(<SkillCategoriesPage />, {
      route: '/skill-categories',
      path: '/skill-categories',
    });

    expect(await screen.findByText('Backend')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(categoryMocks.deleteSkillCategory.mock.calls[0]?.[0]).toBe(7));
  });
});
