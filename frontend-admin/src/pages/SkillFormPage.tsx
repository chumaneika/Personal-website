import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { fetchMetaEnums } from '../shared/api/meta';
import { queryClient } from '../shared/api/queryClient';
import { createSkill, fetchSkill, updateSkill } from '../shared/api/skills';
import { getApiErrorMessage } from '../shared/lib/errors';
import { optionalNumber } from '../shared/lib/form';
import { formatDateTime, formatStatus } from '../shared/lib/format';
import {
  SkillCategory,
  SkillLevel,
  SkillRequest,
  SkillResponse,
  SKILL_CATEGORIES,
  SKILL_LEVELS,
} from '../shared/types/api';

const skillSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120, 'Use 120 characters or fewer.'),
  category: z.enum(['BACKEND', 'FRONTEND', 'DATABASE', 'DEVOPS', 'TOOLS', 'LANGUAGE']),
  level: z.enum(['BASIC', 'INTERMEDIATE', 'ADVANCED']),
  sortOrder: z.coerce.number().int('Use a whole number.').min(0, 'Sort order must be 0 or greater.'),
  visible: z.boolean(),
});

type SkillFormValues = z.infer<typeof skillSchema>;

const emptySkillValues: SkillFormValues = {
  name: '',
  category: 'FRONTEND',
  level: 'INTERMEDIATE',
  sortOrder: 0,
  visible: true,
};

function knownOptions<T extends string>(values: string[] | undefined, fallback: readonly T[]) {
  const knownValues =
    values?.filter((value): value is T => (fallback as readonly string[]).includes(value)) ?? [];

  return knownValues.length > 0 ? knownValues : [...fallback];
}

function getSkillValues(skill: SkillResponse): SkillFormValues {
  return {
    name: skill.name,
    category: skill.category,
    level: skill.level,
    sortOrder: skill.sortOrder,
    visible: skill.visible,
  };
}

function toSkillRequest(values: SkillFormValues): SkillRequest {
  return {
    name: values.name.trim(),
    category: values.category,
    level: values.level,
    sortOrder: optionalNumber(values.sortOrder),
    visible: values.visible,
  };
}

export function SkillFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const skillId = id ? Number(id) : null;
  const isEditing = skillId !== null && Number.isInteger(skillId);
  const hasInvalidId = Boolean(id) && !isEditing;

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: emptySkillValues,
  });

  const metaQuery = useQuery({
    queryKey: ['meta-enums'],
    queryFn: fetchMetaEnums,
    staleTime: Infinity,
  });

  const skillQuery = useQuery({
    queryKey: ['skill', skillId],
    queryFn: () => fetchSkill(skillId as number),
    enabled: isEditing,
  });

  useEffect(() => {
    if (skillQuery.isSuccess && skillQuery.data && !form.formState.isDirty) {
      form.reset(getSkillValues(skillQuery.data));
    }
  }, [form, form.formState.isDirty, skillQuery.data, skillQuery.isSuccess]);

  const saveMutation = useMutation({
    mutationFn: (values: SkillFormValues) => {
      const payload = toSkillRequest(values);
      return isEditing ? updateSkill(skillId as number, payload) : createSkill(payload);
    },
    onSuccess: (skill) => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.setQueryData(['skill', skill.id], skill);
      form.reset(getSkillValues(skill));

      if (!isEditing) {
        navigate(`/skills/${skill.id}/edit`, { replace: true });
      }
    },
  });

  const categoryOptions = knownOptions<SkillCategory>(metaQuery.data?.skillCategories, SKILL_CATEGORIES);
  const levelOptions = knownOptions<SkillLevel>(metaQuery.data?.skillLevels, SKILL_LEVELS);

  if (hasInvalidId) {
    return (
      <section className="empty-state">
        <p className="eyebrow">Invalid skill</p>
        <h1>Skill id is not valid.</h1>
        <Link to="/skills">Back to skills</Link>
      </section>
    );
  }

  const skill = skillQuery.data;
  const canRenderForm = !isEditing || skillQuery.isSuccess;

  return (
    <section className="page-stack">
      <div className="page-heading page-heading--row">
        <div>
          <p className="eyebrow">Capabilities</p>
          <h1>{isEditing ? 'Edit skill' : 'Add skill'}</h1>
        </div>
        <Link className="button-link button-link--secondary" to="/skills">
          Back to skills
        </Link>
      </div>

      {isEditing && skillQuery.isPending && <p className="surface-state">Loading skill...</p>}

      {skillQuery.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(skillQuery.error, 'Could not load skill.')}
        </p>
      )}

      {skill && (
        <div className="metadata-row">
          <span>Created {formatDateTime(skill.createdAt)}</span>
          <span>Updated {formatDateTime(skill.updatedAt)}</span>
        </div>
      )}

      {canRenderForm && (
        <form
          className="stacked-form wide-form"
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
        >
          <div className="form-grid">
            <label>
              Name
              <input type="text" {...form.register('name')} />
              {form.formState.errors.name && <span>{form.formState.errors.name.message}</span>}
            </label>
            <label>
              Category
              <select {...form.register('category')}>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {formatStatus(category)}
                  </option>
                ))}
              </select>
              {form.formState.errors.category && <span>{form.formState.errors.category.message}</span>}
            </label>
            <label>
              Level
              <select {...form.register('level')}>
                {levelOptions.map((level) => (
                  <option key={level} value={level}>
                    {formatStatus(level)}
                  </option>
                ))}
              </select>
              {form.formState.errors.level && <span>{form.formState.errors.level.message}</span>}
            </label>
            <label>
              Sort order
              <input type="number" min="0" step="1" {...form.register('sortOrder', { valueAsNumber: true })} />
              {form.formState.errors.sortOrder && <span>{form.formState.errors.sortOrder.message}</span>}
            </label>
          </div>

          <label className="checkbox-field">
            <input type="checkbox" {...form.register('visible')} />
            Visible on the public site
          </label>

          {metaQuery.isError && (
            <p className="muted-text">Metadata options are using frontend defaults because /meta/enums failed.</p>
          )}

          <div className="form-actions">
            <button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : isEditing ? 'Save skill' : 'Add skill'}
            </button>
          </div>

          {saveMutation.isSuccess && <p className="form-note">Skill saved.</p>}
          {saveMutation.isError && (
            <p className="form-error">{getApiErrorMessage(saveMutation.error, 'Could not save skill.')}</p>
          )}
        </form>
      )}
    </section>
  );
}
