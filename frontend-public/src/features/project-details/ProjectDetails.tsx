import type { ProjectResponse } from '../../shared/types/api';
import { Prose } from '../../shared/components/Prose';
import { formatMonthYear, splitTechnologyStack } from '../../shared/utils/formatters';

type ProjectDetailsProps = {
  project: ProjectResponse;
};

export function ProjectDetails({ project }: ProjectDetailsProps) {
  const technologies = splitTechnologyStack(project.technologyStack);
  const startedAt = formatMonthYear(project.startedAt);
  const completedAt = formatMonthYear(project.completedAt);

  return (
    <article className="project-detail">
      <header className="project-detail__header">
        <p className="eyebrow">Project</p>
        <h1>{project.title}</h1>
        {project.shortDescription && <p className="lead">{project.shortDescription}</p>}

        <div className="button-row">
          {project.githubUrl && (
            <a className="button button--secondary" href={project.githubUrl} target="_blank" rel="noreferrer">
              GitHub
            </a>
          )}
          {project.demoUrl && (
            <a className="button" href={project.demoUrl} target="_blank" rel="noreferrer">
              Demo
            </a>
          )}
        </div>
      </header>

      {project.coverImageUrl && <img className="project-detail__cover" src={project.coverImageUrl} alt="" />}

      <div className="project-detail__meta">
        {technologies.length > 0 && (
          <section>
            <h2>Technology Stack</h2>
            <ul className="tag-list">
              {technologies.map((technology) => (
                <li key={technology}>{technology}</li>
              ))}
            </ul>
          </section>
        )}

        {(startedAt || completedAt) && (
          <section>
            <h2>Timeline</h2>
            <p>{[startedAt, completedAt].filter(Boolean).join(' - ')}</p>
          </section>
        )}
      </div>

      <section className="content-section">
        <h2>Overview</h2>
        <Prose content={project.fullDescription} fallback="Project details are being updated." />
      </section>

      {project.problemDescription && (
        <section className="content-section">
          <h2>Problem</h2>
          <Prose content={project.problemDescription} fallback="" />
        </section>
      )}

      {project.solutionDescription && (
        <section className="content-section">
          <h2>Solution</h2>
          <Prose content={project.solutionDescription} fallback="" />
        </section>
      )}
    </article>
  );
}
