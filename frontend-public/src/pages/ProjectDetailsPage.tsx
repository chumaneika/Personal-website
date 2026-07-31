import { Link, useParams } from 'react-router';
import { data } from 'react-router';
import type { Route } from './+types/ProjectDetailsPage';
import { getProjectDocumentMetadata, getPublicDocumentMetadata } from '../app/documentTitles';
import { ProjectDetails } from '../features/project-details/ProjectDetails';
import { loadProject, PublicApiError } from '../shared/api/publicApi.server';
import { PageState } from '../shared/components/PageState';
import { SeoMetadata } from '../shared/components/SeoMetadata';
import { getPublicSiteOrigin } from '../shared/config/runtime.server';

export async function loader({ params, request }: Route.LoaderArgs) {
  const slug = params.slug;
  const origin = getPublicSiteOrigin();
  const fallbackMetadata = getPublicDocumentMetadata(`/projects/${slug ?? ''}`, origin);

  if (!slug) {
    return data(
      { project: null, state: 'not-found' as const, metadata: fallbackMetadata },
      { status: 404 },
    );
  }

  try {
    const project = await loadProject(slug, request.signal);
    return {
      project,
      state: 'success' as const,
      metadata: getProjectDocumentMetadata(project, origin),
    };
  } catch (error) {
    const notFound = error instanceof PublicApiError && error.status === 404;
    return data(
      {
        project: null,
        state: notFound ? ('not-found' as const) : ('unavailable' as const),
        metadata: fallbackMetadata,
      },
      { status: notFound ? 404 : 503 },
    );
  }
}

export function ProjectDetailsPage({
  loaderData,
}: {
  loaderData: Route.ComponentProps['loaderData'];
}) {
  const { slug } = useParams();
  if (!slug) {
    return (
      <>
        <SeoMetadata metadata={loaderData.metadata} noIndex />
        <PageState
          eyebrow="Project"
          title="Project not found"
          message="The project URL is incomplete."
          action={
            <Link className="button button--secondary" to="/projects">
              Projects
            </Link>
          }
        />
      </>
    );
  }

  if (!loaderData.project) {
    const notFound = loaderData.state === 'not-found';
    return (
      <>
        <SeoMetadata metadata={loaderData.metadata} noIndex={notFound} />
        <PageState
          eyebrow={notFound ? '404' : 'Project'}
          title={notFound ? 'Project not found' : 'Project is unavailable'}
          message={
            notFound
              ? 'This project is not published or does not exist.'
              : 'The project could not be loaded right now.'
          }
          action={
            <Link className="button button--secondary" to="/projects">
              Projects
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <SeoMetadata metadata={loaderData.metadata} />
      <ProjectDetails project={loaderData.project} />
    </>
  );
}

export default ProjectDetailsPage;
