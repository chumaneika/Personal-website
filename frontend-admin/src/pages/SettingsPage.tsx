import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession, fetchCurrentAdmin } from '../shared/api/auth';
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
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
  });
  const adminQuery = useQuery({
    queryKey: ['current-admin'],
    queryFn: fetchCurrentAdmin,
  });

  function handleLogout() {
    clearAuthSession();
    queryClient.clear();
    navigate('/login', { replace: true });
  }

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
            <p className="form-error">{getApiErrorMessage(healthQuery.error, 'Health check failed.')}</p>
          )}
          {healthQuery.isSuccess && <pre className="code-block">{renderHealthPayload(healthQuery.data)}</pre>}
        </section>

        <section className="work-panel">
          <div className="section-heading">
            <h2>Current admin</h2>
          </div>
          {adminQuery.isPending && <p className="muted-text">Loading admin session...</p>}
          {adminQuery.isError && (
            <p className="form-error">{getApiErrorMessage(adminQuery.error, 'Could not load admin session.')}</p>
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
            <h2>Session</h2>
          </div>
          <button className="danger-button" type="button" onClick={handleLogout}>
            Logout
          </button>
        </section>
      </div>
    </section>
  );
}
