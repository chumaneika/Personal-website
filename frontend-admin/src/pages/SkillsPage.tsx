import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteSkill, fetchSkills, updateSkillVisibility } from '../shared/api/skills';
import { queryClient } from '../shared/api/queryClient';
import { getApiErrorMessage } from '../shared/lib/errors';
import { formatDateTime, formatStatus } from '../shared/lib/format';
import { SkillCategory, SKILL_CATEGORIES } from '../shared/types/api';

type CategoryFilter = SkillCategory | 'ALL';
type VisibilityFilter = 'ALL' | 'VISIBLE' | 'HIDDEN';

export function SkillsPage() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('ALL');
  const skillsQuery = useQuery({
    queryKey: ['skills'],
    queryFn: fetchSkills,
  });

  const visibilityMutation = useMutation({
    mutationFn: ({ id, visible }: { id: number; visible: boolean }) => updateSkillVisibility(id, visible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const filteredSkills = useMemo(() => {
    return (skillsQuery.data ?? []).filter((skill) => {
      const matchesCategory = categoryFilter === 'ALL' || skill.category === categoryFilter;
      const matchesVisibility =
        visibilityFilter === 'ALL' ||
        (visibilityFilter === 'VISIBLE' && skill.visible) ||
        (visibilityFilter === 'HIDDEN' && !skill.visible);

      return matchesCategory && matchesVisibility;
    });
  }, [categoryFilter, skillsQuery.data, visibilityFilter]);

  function handleDelete(id: number, name: string) {
    if (window.confirm(`Delete "${name}" permanently?`)) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <section className="page-stack">
      <div className="page-heading page-heading--row">
        <div>
          <p className="eyebrow">Capabilities</p>
          <h1>Skills</h1>
        </div>
        <Link className="button-link" to="/skills/new">
          Add skill
        </Link>
      </div>

      <div className="toolbar">
        <label>
          Category
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}>
            <option value="ALL">All categories</option>
            {SKILL_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {formatStatus(category)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Visibility
          <select
            value={visibilityFilter}
            onChange={(event) => setVisibilityFilter(event.target.value as VisibilityFilter)}
          >
            <option value="ALL">All</option>
            <option value="VISIBLE">Visible</option>
            <option value="HIDDEN">Hidden</option>
          </select>
        </label>
      </div>

      {skillsQuery.isPending && <p className="surface-state">Loading skills...</p>}

      {skillsQuery.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(skillsQuery.error, 'Could not load skills.')}
        </p>
      )}

      {skillsQuery.isSuccess && filteredSkills.length === 0 && (
        <section className="empty-state compact-empty-state">
          <p className="eyebrow">No skills</p>
          <h2>Nothing matches this filter.</h2>
          <Link className="button-link" to="/skills/new">
            Add skill
          </Link>
        </section>
      )}

      {filteredSkills.length > 0 && (
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Level</th>
                <th>Order</th>
                <th>Visible</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkills.map((skill) => (
                <tr key={skill.id}>
                  <td>
                    <strong>{skill.name}</strong>
                  </td>
                  <td>{formatStatus(skill.category)}</td>
                  <td>{formatStatus(skill.level)}</td>
                  <td>{skill.sortOrder}</td>
                  <td>
                    <span className={skill.visible ? 'status-chip status-chip--published' : 'status-chip'}>
                      {skill.visible ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td>{formatDateTime(skill.updatedAt)}</td>
                  <td>
                    <div className="action-row">
                      <Link to={`/skills/${skill.id}/edit`}>Edit</Link>
                      <button
                        type="button"
                        disabled={visibilityMutation.isPending}
                        onClick={() => visibilityMutation.mutate({ id: skill.id, visible: !skill.visible })}
                      >
                        {skill.visible ? 'Hide' : 'Show'}
                      </button>
                      <button
                        type="button"
                        className="danger-link"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(skill.id, skill.name)}
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

      {visibilityMutation.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(visibilityMutation.error, 'Could not update skill visibility.')}
        </p>
      )}
      {deleteMutation.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(deleteMutation.error, 'Could not delete skill.')}
        </p>
      )}
    </section>
  );
}
