import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import {
  createSkillCategory,
  fetchSkillCategory,
  updateSkillCategory,
} from '../shared/api/skillCategories';
import { queryClient } from '../shared/api/queryClient';
import { getApiErrorMessage } from '../shared/lib/errors';
import { SkillCategoryRequest } from '../shared/types/api';

const skillCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(120, 'Use 120 characters or fewer.'),
});

type SkillCategoryFormValues = z.infer<typeof skillCategorySchema>;

export function SkillCategoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const categoryId = id ? Number(id) : null;
  const isEditing = categoryId !== null && Number.isInteger(categoryId);
  const hasInvalidId = Boolean(id) && !isEditing;

  const form = useForm<SkillCategoryFormValues>({
    resolver: zodResolver(skillCategorySchema),
    defaultValues: { name: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const categoryQuery = useQuery({
    queryKey: ['skill-category', categoryId],
    queryFn: () => fetchSkillCategory(categoryId as number),
    enabled: isEditing,
  });

  useEffect(() => {
    if (categoryQuery.isSuccess && categoryQuery.data && !form.formState.isDirty) {
      form.reset({ name: categoryQuery.data.name });
    }
  }, [categoryQuery.data, categoryQuery.isSuccess, form, form.formState.isDirty]);

  const saveMutation = useMutation({
    mutationFn: (values: SkillCategoryFormValues) => {
      const payload: SkillCategoryRequest = { name: values.name.trim() };
      return isEditing ? updateSkillCategory(categoryId as number, payload) : createSkillCategory(payload);
    },
    onSuccess: (category) => {
      queryClient.invalidateQueries({ queryKey: ['skill-categories'] });
      queryClient.invalidateQueries({ queryKey: ['meta-enums'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.setQueryData(['skill-category', category.id], category);
      navigate('/skill-categories', {
        replace: true,
        state: { savedCategoryName: category.name },
      });
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const categoryName = values.name.trim();
    const confirmationMessage = isEditing
      ? `Save changes to the "${categoryName}" category?`
      : `Create the "${categoryName}" category?`;

    if (window.confirm(confirmationMessage)) {
      saveMutation.mutate({ ...values, name: categoryName });
    }
  });

  if (hasInvalidId) {
    return (
      <section className="empty-state">
        <p className="eyebrow">Invalid category</p>
        <h1>Skill category id is not valid.</h1>
        <Link to="/skill-categories">Back to categories</Link>
      </section>
    );
  }

  const canRenderForm = !isEditing || categoryQuery.isSuccess;

  return (
    <section className="page-stack">
      <div className="page-heading page-heading--row">
        <div>
          <p className="eyebrow">Capabilities</p>
          <h1>{isEditing ? 'Edit skill category' : 'Add skill category'}</h1>
        </div>
        <Link className="button-link button-link--secondary" to="/skill-categories">
          Back to categories
        </Link>
      </div>

      {isEditing && categoryQuery.isPending && <p className="surface-state">Loading skill category...</p>}

      {categoryQuery.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(categoryQuery.error, 'Could not load skill category.')}
        </p>
      )}

      {canRenderForm && (
        <form
          className="stacked-form"
          noValidate
          onSubmit={onSubmit}
        >
          <label>
            Name
            <input
              type="text"
              aria-invalid={Boolean(form.formState.errors.name)}
              aria-describedby={form.formState.errors.name ? 'skill-category-name-error' : undefined}
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <span id="skill-category-name-error" role="alert">
                {form.formState.errors.name.message}
              </span>
            )}
          </label>

          <div className="form-actions">
            <button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : isEditing ? 'Save category' : 'Add category'}
            </button>
          </div>

          {saveMutation.isError && (
            <p className="form-error">{getApiErrorMessage(saveMutation.error, 'Could not save skill category.')}</p>
          )}
        </form>
      )}
    </section>
  );
}
