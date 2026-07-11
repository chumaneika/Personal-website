import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ProjectGrid } from '../features/project-list/ProjectGrid';
import { fetchProjects } from '../shared/api/projects';
import { LoadingState, PageState } from '../shared/components/PageState';

export function ProjectsPage() {
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  if (projectsQuery.isLoading) {
    return <LoadingState label="Loading projects..." />;
  }

  if (projectsQuery.isError) {
    return (
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
    );
  }

  const projects = projectsQuery.data ?? [];

  return (
    <section className="stack-page">
      <header className="page-intro">
        <p className="eyebrow">Projects</p>
        <h1>Published backend and product work</h1>
        <p>Production-oriented projects, APIs, integrations, and tools.</p>
      </header>

      {projects.length > 0 ? (
        <ProjectGrid projects={projects} />
      ) : (
        <PageState compact title="No published projects yet" message="Published projects will appear here." />
      )}
    </section>
  );
}
