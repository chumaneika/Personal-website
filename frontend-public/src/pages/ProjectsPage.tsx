import { Link } from 'react-router';
import { data } from 'react-router';
import type { Route } from './+types/ProjectsPage';
import { getPublicDocumentMetadata } from '../app/documentTitles';
import { ProjectGrid } from '../features/project-list/ProjectGrid';
import { loadProjects } from '../shared/api/publicApi.server';
import { PageState } from '../shared/components/PageState';
import { SeoMetadata } from '../shared/components/SeoMetadata';
import { getPublicSiteOrigin } from '../shared/config/runtime.server';

export async function loader({ request }: Route.LoaderArgs) {
  const metadata = getPublicDocumentMetadata('/projects', getPublicSiteOrigin());

  try {
    return { projects: await loadProjects(request.signal), unavailable: false, metadata };
  } catch {
    return data({ projects: [], unavailable: true, metadata }, { status: 503 });
  }
}

export function ProjectsPage({ loaderData }: { loaderData: Route.ComponentProps['loaderData'] }) {
  if (loaderData.unavailable) {
    return (
      <>
        <SeoMetadata metadata={loaderData.metadata} />
        <PageState
          eyebrow="Projects"
          title="Projects are unavailable"
          message="Published projects could not be loaded right now."
          action={
            <Link className="button button--secondary" to="/">
              Home
            </Link>
          }
        />
      </>
    );
  }

  const projects = loaderData.projects;

  return (
    <section className="stack-page">
      <SeoMetadata metadata={loaderData.metadata} />
      <header className="page-intro">
        <p className="eyebrow">Projects</p>
        <h1>Published backend and product work</h1>
        <p>Production-oriented projects, APIs, integrations, and tools.</p>
      </header>

      {projects.length > 0 ? (
        <ProjectGrid projects={projects} />
      ) : (
        <PageState
          compact
          title="No published projects yet"
          message="Published projects will appear here."
        />
      )}
    </section>
  );
}

export default ProjectsPage;
