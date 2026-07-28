import { useState } from 'react';
import { data } from 'react-router';
import type { Route } from './+types/SkillsPage';
import { getPublicDocumentMetadata } from '../app/documentTitles';
import { CategoryFilter } from '../features/skills/CategoryFilter';
import { SkillGroups } from '../features/skills/SkillGroups';
import { loadSkillCategories, loadSkills } from '../shared/api/publicApi.server';
import { PageState } from '../shared/components/PageState';
import { SeoMetadata } from '../shared/components/SeoMetadata';
import { getPublicSiteOrigin } from '../shared/config/runtime.server';
import type { SkillCategoryResponse } from '../shared/types/api';
import { normalizeSkillCategories } from '../shared/utils/formatters';

export async function loader({ request }: Route.LoaderArgs) {
  const metadata = getPublicDocumentMetadata('/skills', getPublicSiteOrigin());
  const [skillsResult, categoriesResult] = await Promise.allSettled([
    loadSkills(undefined, request.signal),
    loadSkillCategories(request.signal),
  ]);

  if (skillsResult.status === 'rejected') {
    return data(
      {
        skills: [],
        categories: [],
        categoriesUnavailable: categoriesResult.status === 'rejected',
        unavailable: true,
        metadata,
      },
      { status: 503 },
    );
  }

  return {
    skills: skillsResult.value,
    categories: categoriesResult.status === 'fulfilled' ? categoriesResult.value : [],
    categoriesUnavailable: categoriesResult.status === 'rejected',
    unavailable: false,
    metadata,
  };
}

export function SkillsPage({ loaderData }: { loaderData: Route.ComponentProps['loaderData'] }) {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategoryResponse | null>(null);

  if (loaderData.unavailable) {
    return (
      <>
        <SeoMetadata metadata={loaderData.metadata} />
        <PageState
          eyebrow="Skills"
          title="Skills are unavailable"
          message="The public skill list could not be loaded right now."
        />
      </>
    );
  }

  const allVisibleSkills = loaderData.skills.filter((skill) => skill.visible !== false);
  const visibleSkills = selectedCategory
    ? allVisibleSkills.filter((skill) => skill.category.id === selectedCategory.id)
    : allVisibleSkills;
  const categories = normalizeSkillCategories(loaderData.categories, allVisibleSkills);

  return (
    <section className="stack-page">
      <SeoMetadata metadata={loaderData.metadata} />
      <header className="page-intro">
        <p className="eyebrow">Skills</p>
        <h1>Backend-first engineering stack</h1>
        <p>Core backend, frontend, database, DevOps, tooling, and language skills.</p>
      </header>

      <CategoryFilter
        categories={categories}
        selectedCategoryId={selectedCategory?.id ?? null}
        onChange={setSelectedCategory}
      />
      {loaderData.categoriesUnavailable && (
        <p className="inline-status inline-status--error">
          Skill categories are temporarily unavailable.
        </p>
      )}

      {visibleSkills.length > 0 ? (
        <SkillGroups skills={visibleSkills} categories={categories} />
      ) : (
        <PageState
          compact
          title="No visible skills yet"
          message="Visible skills will appear here after they are added."
        />
      )}
    </section>
  );
}

export default SkillsPage;
