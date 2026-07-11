import type { SkillCategoryResponse } from '../../shared/types/api';

type CategoryFilterProps = {
  categories: SkillCategoryResponse[];
  selectedCategoryId: number | null;
  onChange: (category: SkillCategoryResponse | null) => void;
};

export function CategoryFilter({ categories, selectedCategoryId, onChange }: CategoryFilterProps) {
  return (
    <div className="category-filter" aria-label="Skill category filter">
      <button
        type="button"
        aria-pressed={!selectedCategoryId}
        className={!selectedCategoryId ? 'is-selected' : undefined}
        onClick={() => onChange(null)}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          aria-pressed={selectedCategoryId === category.id}
          className={selectedCategoryId === category.id ? 'is-selected' : undefined}
          onClick={() => onChange(category)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
