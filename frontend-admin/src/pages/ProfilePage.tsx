import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { fetchProfile, saveProfile } from '../shared/api/profile';
import { queryClient } from '../shared/api/queryClient';
import { getApiErrorMessage } from '../shared/lib/errors';
import { nullableText } from '../shared/lib/form';
import { formatDateTime } from '../shared/lib/format';
import { ProfileRequest, ProfileResponse } from '../shared/types/api';

const optionalUrl = z
  .string()
  .max(512, 'Use 512 characters or fewer.')
  .refine((value) => value.length === 0 || z.string().url().safeParse(value).success, 'Enter a valid URL.');

const profileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required.').max(100, 'Use 100 characters or fewer.'),
  lastName: z.string().trim().min(1, 'Last name is required.').max(100, 'Use 100 characters or fewer.'),
  headline: z.string().trim().min(1, 'Headline is required.').max(160, 'Use 160 characters or fewer.'),
  shortBio: z.string().max(1000, 'Use 1000 characters or fewer.'),
  fullBio: z.string().max(8000, 'Use 8000 characters or fewer.'),
  location: z.string().max(160, 'Use 160 characters or fewer.'),
  email: z
    .string()
    .max(254, 'Use 254 characters or fewer.')
    .refine((value) => value.length === 0 || z.string().email().safeParse(value).success, 'Enter a valid email.'),
  telegramUrl: optionalUrl,
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  avatarUrl: optionalUrl,
  resumeUrl: optionalUrl,
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const emptyProfileValues: ProfileFormValues = {
  firstName: '',
  lastName: '',
  headline: '',
  shortBio: '',
  fullBio: '',
  location: '',
  email: '',
  telegramUrl: '',
  githubUrl: '',
  linkedinUrl: '',
  avatarUrl: '',
  resumeUrl: '',
};

function getProfileValues(profile: ProfileResponse | null): ProfileFormValues {
  if (!profile) {
    return emptyProfileValues;
  }

  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    headline: profile.headline,
    shortBio: profile.shortBio ?? '',
    fullBio: profile.fullBio ?? '',
    location: profile.location ?? '',
    email: profile.email ?? '',
    telegramUrl: profile.telegramUrl ?? '',
    githubUrl: profile.githubUrl ?? '',
    linkedinUrl: profile.linkedinUrl ?? '',
    avatarUrl: profile.avatarUrl ?? '',
    resumeUrl: profile.resumeUrl ?? '',
  };
}

function toProfileRequest(values: ProfileFormValues): ProfileRequest {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    headline: values.headline.trim(),
    shortBio: nullableText(values.shortBio),
    fullBio: nullableText(values.fullBio),
    location: nullableText(values.location),
    email: nullableText(values.email),
    telegramUrl: nullableText(values.telegramUrl),
    githubUrl: nullableText(values.githubUrl),
    linkedinUrl: nullableText(values.linkedinUrl),
    avatarUrl: nullableText(values.avatarUrl),
    resumeUrl: nullableText(values.resumeUrl),
  };
}

export function ProfilePage() {
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: emptyProfileValues,
  });

  useEffect(() => {
    if (profileQuery.isSuccess) {
      form.reset(getProfileValues(profileQuery.data));
    }
  }, [form, profileQuery.data, profileQuery.isSuccess]);

  const saveMutation = useMutation({
    mutationFn: (values: ProfileFormValues) => saveProfile(toProfileRequest(values)),
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile'], profile);
      form.reset(getProfileValues(profile));
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    saveMutation.mutate(values);
  });

  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Public identity</p>
        <h1>Profile</h1>
      </div>

      {profileQuery.isPending && <p className="surface-state">Loading profile...</p>}

      {profileQuery.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(profileQuery.error, 'Could not load profile.')}
        </p>
      )}

      {profileQuery.isSuccess && profileQuery.data === null && (
        <p className="surface-state">No profile exists yet. Fill the form and save it with the profile API.</p>
      )}

      {profileQuery.isSuccess && (
        <form className="stacked-form wide-form" onSubmit={onSubmit}>
          <div className="form-grid">
            <label>
              First name
              <input type="text" {...form.register('firstName')} />
              {form.formState.errors.firstName && <span>{form.formState.errors.firstName.message}</span>}
            </label>
            <label>
              Last name
              <input type="text" {...form.register('lastName')} />
              {form.formState.errors.lastName && <span>{form.formState.errors.lastName.message}</span>}
            </label>
          </div>

          <label>
            Headline
            <input type="text" {...form.register('headline')} />
            {form.formState.errors.headline && <span>{form.formState.errors.headline.message}</span>}
          </label>

          <label>
            Short bio
            <textarea rows={3} {...form.register('shortBio')} />
            {form.formState.errors.shortBio && <span>{form.formState.errors.shortBio.message}</span>}
          </label>

          <label>
            Full bio
            <textarea rows={8} {...form.register('fullBio')} />
            {form.formState.errors.fullBio && <span>{form.formState.errors.fullBio.message}</span>}
          </label>

          <div className="form-grid">
            <label>
              Location
              <input type="text" {...form.register('location')} />
              {form.formState.errors.location && <span>{form.formState.errors.location.message}</span>}
            </label>
            <label>
              Email
              <input type="email" {...form.register('email')} />
              {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}
            </label>
          </div>

          <div className="form-grid">
            <label>
              Telegram URL
              <input type="url" {...form.register('telegramUrl')} />
              {form.formState.errors.telegramUrl && <span>{form.formState.errors.telegramUrl.message}</span>}
            </label>
            <label>
              GitHub URL
              <input type="url" {...form.register('githubUrl')} />
              {form.formState.errors.githubUrl && <span>{form.formState.errors.githubUrl.message}</span>}
            </label>
            <label>
              LinkedIn URL
              <input type="url" {...form.register('linkedinUrl')} />
              {form.formState.errors.linkedinUrl && <span>{form.formState.errors.linkedinUrl.message}</span>}
            </label>
            <label>
              Avatar URL
              <input type="url" {...form.register('avatarUrl')} />
              {form.formState.errors.avatarUrl && <span>{form.formState.errors.avatarUrl.message}</span>}
            </label>
            <label>
              Resume URL
              <input type="url" {...form.register('resumeUrl')} />
              {form.formState.errors.resumeUrl && <span>{form.formState.errors.resumeUrl.message}</span>}
            </label>
          </div>

          {profileQuery.data && (
            <p className="muted-text">
              Updated {formatDateTime(profileQuery.data.updatedAt)}. Created {formatDateTime(profileQuery.data.createdAt)}.
            </p>
          )}

          <div className="form-actions">
            <button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save profile'}
            </button>
          </div>

          {saveMutation.isSuccess && <p className="form-note">Profile saved.</p>}
          {saveMutation.isError && (
            <p className="form-error">{getApiErrorMessage(saveMutation.error, 'Could not save profile.')}</p>
          )}
        </form>
      )}
    </section>
  );
}
