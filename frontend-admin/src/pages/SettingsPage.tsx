import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  type PasswordChangeFormValues,
  passwordChangeSchema,
} from '../features/auth/passwordSchema';
import { changePassword, fetchCurrentAdmin, signOut } from '../shared/api/auth';
import { fetchHealth } from '../shared/api/health';
import { apiBaseUrl } from '../shared/api/httpClient';
import { queryClient } from '../shared/api/queryClient';
import { getApiErrorMessage } from '../shared/lib/errors';

function renderHealthPayload(payload: unknown) {
  if (typeof payload === 'string') {
    return payload;
  }

  return JSON.stringify(payload, null, 2);
}

export function SettingsPage() {
  const navigate = useNavigate();
  const passwordForm = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
  });
  const adminQuery = useQuery({
    queryKey: ['current-admin'],
    queryFn: fetchCurrentAdmin,
  });
  const logoutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
  const passwordMutation = useMutation({
    mutationFn: (values: PasswordChangeFormValues) =>
      changePassword(values.currentPassword, values.newPassword),
    onSuccess: () => {
      queryClient.clear();
      navigate('/login?passwordChanged=1', { replace: true });
    },
  });

  function handleLogout() {
    logoutMutation.mutate();
  }

  const handlePasswordChange = passwordForm.handleSubmit((values) => {
    passwordMutation.mutate(values);
  });

  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Technical</p>
        <h1>Settings</h1>
      </div>

      <div className="settings-grid">
        <section className="work-panel">
          <div className="section-heading">
            <h2>API</h2>
          </div>
          <dl className="detail-list">
            <div>
              <dt>Base URL</dt>
              <dd>{apiBaseUrl}</dd>
            </div>
          </dl>
        </section>

        <section className="work-panel">
          <div className="section-heading">
            <h2>Backend health</h2>
          </div>
          {healthQuery.isPending && <p className="muted-text">Checking backend...</p>}
          {healthQuery.isError && (
            <p className="form-error" role="alert" aria-live="assertive" aria-atomic="true">
              {getApiErrorMessage(healthQuery.error, 'Health check failed.')}
            </p>
          )}
          {healthQuery.isSuccess && (
            <pre className="code-block">{renderHealthPayload(healthQuery.data)}</pre>
          )}
        </section>

        <section className="work-panel">
          <div className="section-heading">
            <h2>Current admin</h2>
          </div>
          {adminQuery.isPending && <p className="muted-text">Loading admin session...</p>}
          {adminQuery.isError && (
            <p className="form-error" role="alert" aria-live="assertive" aria-atomic="true">
              {getApiErrorMessage(adminQuery.error, 'Could not load admin session.')}
            </p>
          )}
          {adminQuery.data && (
            <dl className="detail-list">
              <div>
                <dt>Email</dt>
                <dd>{adminQuery.data.email}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{adminQuery.data.role}</dd>
              </div>
            </dl>
          )}
        </section>

        <section className="work-panel">
          <div className="section-heading">
            <h2>Change password</h2>
          </div>
          <form className="stacked-form" onSubmit={handlePasswordChange}>
            <label>
              Current password
              <input
                type="password"
                autoComplete="current-password"
                {...passwordForm.register('currentPassword')}
              />
              {passwordForm.formState.errors.currentPassword && (
                <span>{passwordForm.formState.errors.currentPassword.message}</span>
              )}
            </label>
            <label>
              New password
              <input
                type="password"
                autoComplete="new-password"
                {...passwordForm.register('newPassword')}
              />
              {passwordForm.formState.errors.newPassword && (
                <span>{passwordForm.formState.errors.newPassword.message}</span>
              )}
            </label>
            <label>
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                {...passwordForm.register('confirmPassword')}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <span>{passwordForm.formState.errors.confirmPassword.message}</span>
              )}
            </label>
            <button type="submit" disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? 'Changing password...' : 'Change password'}
            </button>
            <p className="form-note">
              Use 12–128 characters with at least one letter and one number.
            </p>
            {passwordMutation.isError && (
              <p className="form-error" role="alert" aria-live="assertive" aria-atomic="true">
                {getApiErrorMessage(passwordMutation.error, 'Could not change the password.')}
              </p>
            )}
          </form>
        </section>

        <section className="work-panel">
          <div className="section-heading">
            <h2>Session</h2>
          </div>
          <button
            className="danger-button"
            type="button"
            disabled={logoutMutation.isPending}
            onClick={handleLogout}
          >
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </button>
          {logoutMutation.isError && (
            <p className="form-error" role="alert" aria-live="assertive" aria-atomic="true">
              {getApiErrorMessage(logoutMutation.error, 'Could not log out.')}
            </p>
          )}
        </section>
      </div>
    </section>
  );
}
