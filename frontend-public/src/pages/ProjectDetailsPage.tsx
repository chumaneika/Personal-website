import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ProjectDetails } from '../features/project-details/ProjectDetails';
import { fetchProjectBySlug } from '../shared/api/projects';
import { LoadingState, PageState } from '../shared/components/PageState';
import { isNotFoundError } from '../shared/utils/errors';

export function ProjectDetailsPage() {
  const { slug } = useParams();
  const projectQuery = useQuery({
    queryKey: ['project', slug],
    queryFn: () => fetchProjectBySlug(slug ?? ''),
    enabled: Boolean(slug),
  });

  if (!slug) {
    return (
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
    );
  }

  if (projectQuery.isLoading) {
    return <LoadingState label="Loading project..." />;
  }

  if (projectQuery.isError) {
    const notFound = isNotFoundError(projectQuery.error);

    return (
      <PageState
        eyebrow={notFound ? '404' : 'Project'}
        title={notFound ? 'Project not found' : 'Project is unavailable'}
        message={notFound ? 'This project is not published or does not exist.' : 'The project could not be loaded right now.'}
        action={
          <Link className="button button--secondary" to="/projects">
            Projects
          </Link>
        }
      />
    );
  }

  if (!projectQuery.data) {
    return (
      <PageState
        eyebrow="Project"
        title="Project not found"
        message="This project is not available."
        action={
          <Link className="button button--secondary" to="/projects">
            Projects
          </Link>
        }
      />
    );
  }

  return <ProjectDetails project={projectQuery.data} />;
}
