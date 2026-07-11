import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CategoryFilter } from '../features/skills/CategoryFilter';
import { SkillGroups } from '../features/skills/SkillGroups';
import { fetchMetaEnums } from '../shared/api/meta';
import { fetchSkills } from '../shared/api/skills';
import { LoadingState, PageState } from '../shared/components/PageState';
import type { SkillCategory } from '../shared/types/api';
import { normalizeSkillCategories } from '../shared/utils/formatters';

export function SkillsPage() {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const metaQuery = useQuery({
    queryKey: ['meta', 'enums'],
    queryFn: fetchMetaEnums,
  });
  const skillsQuery = useQuery({
    queryKey: ['skills', selectedCategory ?? 'all'],
    queryFn: () => fetchSkills(selectedCategory ?? undefined),
  });

  const categories = normalizeSkillCategories(metaQuery.data?.skillCategories);

  if (skillsQuery.isLoading) {
    return <LoadingState label="Loading skills..." />;
  }

  if (skillsQuery.isError) {
    return (
      <PageState
        eyebrow="Skills"
        title="Skills are unavailable"
        message="The public skill list could not be loaded right now."
      />
    );
  }

  const visibleSkills = skillsQuery.data?.filter((skill) => skill.visible !== false) ?? [];

  return (
    <section className="stack-page">
      <header className="page-intro">
        <p className="eyebrow">Skills</p>
        <h1>Backend-first engineering stack</h1>
        <p>Core backend, frontend, database, DevOps, tooling, and language skills.</p>
      </header>

      <CategoryFilter categories={categories} selectedCategory={selectedCategory} onChange={setSelectedCategory} />
      {metaQuery.isLoading && <p className="inline-status">Loading skill categories...</p>}
      {metaQuery.isError && <p className="inline-status inline-status--error">Skill categories are temporarily unavailable.</p>}

      {visibleSkills.length > 0 ? (
        <SkillGroups skills={visibleSkills} categories={categories} />
      ) : (
        <PageState compact title="No visible skills yet" message="Visible skills will appear here after they are added." />
      )}
    </section>
  );
}
