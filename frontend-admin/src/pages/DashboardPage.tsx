import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '../shared/api/dashboard';
import { getApiErrorMessage } from '../shared/lib/errors';

export function DashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchDashboard,
  });

  const dashboard = dashboardQuery.data;
  const metricGroups = dashboard
    ? [
        {
          title: 'Projects',
          metrics: [
            ['Total', dashboard.totalProjects],
            ['Draft', dashboard.draftProjects],
            ['Published', dashboard.publishedProjects],
            ['Archived', dashboard.archivedProjects],
          ],
        },
        {
          title: 'Articles',
          metrics: [
            ['Total', dashboard.totalArticles],
            ['Draft', dashboard.draftArticles],
            ['Published', dashboard.publishedArticles],
            ['Archived', dashboard.archivedArticles],
          ],
        },
        {
          title: 'Skills',
          metrics: [
            ['Total', dashboard.totalSkills],
            ['Visible', dashboard.visibleSkills],
            ['Hidden', dashboard.hiddenSkills],
          ],
        },
        {
          title: 'Messages',
          metrics: [
            ['Total', dashboard.totalContactMessages],
            ['New', dashboard.newContactMessages],
            ['Read', dashboard.readContactMessages],
            ['Archived', dashboard.archivedContactMessages],
          ],
        },
      ]
    : [];

  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Admin frontend</p>
        <h1>Dashboard</h1>
      </div>

      {dashboardQuery.isPending && <p className="surface-state">Loading dashboard...</p>}

      {dashboardQuery.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(dashboardQuery.error, 'Could not load dashboard summary.')}
        </p>
      )}

      {dashboard && (
        <>
          <div className="metric-grid">
            {metricGroups.map((group) => (
              <article key={group.title}>
                <span>{group.title}</span>
                <strong>{group.metrics[0][1]}</strong>
                <dl>
                  {group.metrics.slice(1).map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>

          <section className="work-panel">
            <div className="section-heading">
              <h2>Quick actions</h2>
            </div>
            <div className="quick-actions">
              <Link className="button-link" to="/projects/new">
                Create project
              </Link>
              <Link className="button-link" to="/articles/new">
                Create article
              </Link>
              <Link className="button-link button-link--secondary" to="/profile">
                Edit profile
              </Link>
              <Link className="button-link button-link--secondary" to="/messages">
                View messages
              </Link>
              <Link className="button-link button-link--secondary" to="/skills">
                Manage skills
              </Link>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
