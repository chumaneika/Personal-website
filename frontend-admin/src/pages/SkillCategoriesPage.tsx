import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { deleteSkillCategory, fetchSkillCategories } from '../shared/api/skillCategories';
import { queryClient } from '../shared/api/queryClient';
import { getApiErrorMessage } from '../shared/lib/errors';

export function SkillCategoriesPage() {
  const location = useLocation();
  const savedCategoryName = (location.state as { savedCategoryName?: string } | null)?.savedCategoryName;
  const categoriesQuery = useQuery({
    queryKey: ['skill-categories'],
    queryFn: fetchSkillCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSkillCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-categories'] });
      queryClient.invalidateQueries({ queryKey: ['meta-enums'] });
    },
  });

  function handleDelete(id: number, name: string) {
    if (window.confirm(`Delete the "${name}" category permanently? Categories used by skills cannot be deleted.`)) {
      deleteMutation.mutate(id);
    }
  }

  const categories = categoriesQuery.data ?? [];

  return (
    <section className="page-stack">
      <div className="page-heading page-heading--row">
        <div>
          <p className="eyebrow">Capabilities</p>
          <h1>Skill categories</h1>
        </div>
        <Link className="button-link" to="/skill-categories/new">
          Add category
        </Link>
      </div>

      {savedCategoryName && (
        <p className="surface-state surface-state--success">
          Category "{savedCategoryName}" saved. All categories are shown below.
        </p>
      )}

      {categoriesQuery.isPending && <p className="surface-state">Loading skill categories...</p>}

      {categoriesQuery.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(categoriesQuery.error, 'Could not load skill categories.')}
        </p>
      )}

      {categoriesQuery.isSuccess && categories.length === 0 && (
        <section className="empty-state compact-empty-state">
          <p className="eyebrow">No categories</p>
          <h2>Create a category before adding skills.</h2>
          <Link className="button-link" to="/skill-categories/new">
            Add category
          </Link>
        </section>
      )}

      {categories.length > 0 && (
        <div className="table-shell">
          <table className="compact-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <strong>{category.name}</strong>
                  </td>
                  <td>
                    <div className="action-row">
                      <Link to={`/skill-categories/${category.id}/edit`}>Edit</Link>
                      <button
                        type="button"
                        className="danger-link"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(category.id, category.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteMutation.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(deleteMutation.error, 'Could not delete skill category.')}
        </p>
      )}
    </section>
  );
}
