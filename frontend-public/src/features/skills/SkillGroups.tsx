import type { SkillCategoryResponse, SkillResponse } from '../../shared/types/api';
import { groupSkillsByCategory, skillLevelLabels } from '../../shared/utils/formatters';

type SkillGroupsProps = {
  skills: SkillResponse[];
  categories: SkillCategoryResponse[];
};

export function SkillGroups({ skills, categories }: SkillGroupsProps) {
  const groupedSkills = groupSkillsByCategory(skills);

  return (
    <div className="skill-groups">
      {categories.map((category) => {
        const categorySkills = groupedSkills[category.id] ?? [];

        if (!categorySkills.length) {
          return null;
        }

        return (
          <section className="skill-group" key={category.id}>
            <h2>{category.name}</h2>
            <div className="skill-list">
              {categorySkills.map((skill) => (
                <article className="skill-item" key={skill.id}>
                  <span>{skill.name}</span>
                  <strong>{skillLevelLabels[skill.level]}</strong>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
