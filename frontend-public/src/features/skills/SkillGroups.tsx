import type { SkillCategory, SkillResponse } from '../../shared/types/api';
import { groupSkillsByCategory, skillCategoryLabels, skillLevelLabels } from '../../shared/utils/formatters';

type SkillGroupsProps = {
  skills: SkillResponse[];
  categories: SkillCategory[];
};

export function SkillGroups({ skills, categories }: SkillGroupsProps) {
  const groupedSkills = groupSkillsByCategory(skills);

  return (
    <div className="skill-groups">
      {categories.map((category) => {
        const categorySkills = groupedSkills[category] ?? [];

        if (!categorySkills.length) {
          return null;
        }

        return (
          <section className="skill-group" key={category}>
            <h2>{skillCategoryLabels[category]}</h2>
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
