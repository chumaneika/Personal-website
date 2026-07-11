import type { SkillCategory } from '../../shared/types/api';
import { skillCategoryLabels } from '../../shared/utils/formatters';

type CategoryFilterProps = {
  categories: SkillCategory[];
  selectedCategory: SkillCategory | null;
  onChange: (category: SkillCategory | null) => void;
};

export function CategoryFilter({ categories, selectedCategory, onChange }: CategoryFilterProps) {
  return (
    <div className="category-filter" aria-label="Skill category filter">
      <button
        type="button"
        aria-pressed={!selectedCategory}
        className={!selectedCategory ? 'is-selected' : undefined}
        onClick={() => onChange(null)}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          aria-pressed={selectedCategory === category}
          className={selectedCategory === category ? 'is-selected' : undefined}
          onClick={() => onChange(category)}
        >
          {skillCategoryLabels[category]}
        </button>
      ))}
    </div>
  );
}
