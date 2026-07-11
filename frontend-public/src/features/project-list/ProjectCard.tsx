import { Link } from 'react-router-dom';
import type { ProjectSummaryResponse } from '../../shared/types/api';
import { formatMonthYear, splitTechnologyStack } from '../../shared/utils/formatters';

type ProjectCardProps = {
  project: ProjectSummaryResponse;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const technologies = splitTechnologyStack(project.technologyStack);
  const startedAt = formatMonthYear(project.startedAt);
  const completedAt = formatMonthYear(project.completedAt);

  return (
    <article className="project-card">
      {project.coverImageUrl ? (
        <img className="project-card__image" src={project.coverImageUrl} alt="" loading="lazy" />
      ) : (
        <div className="project-card__placeholder" aria-hidden="true">
          {project.title.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className="project-card__body">
        <div>
          <h2>{project.title}</h2>
          {project.shortDescription && <p>{project.shortDescription}</p>}
        </div>

        {technologies.length > 0 && (
          <ul className="tag-list" aria-label="Technology stack">
            {technologies.map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
        )}

        {(startedAt || completedAt) && (
          <p className="project-card__dates">
            {[startedAt, completedAt].filter(Boolean).join(' - ')}
          </p>
        )}

        <div className="project-card__actions">
          <Link className="text-link" to={`/projects/${project.slug}`}>
            Details
          </Link>
          {project.githubUrl && (
            <a className="text-link" href={project.githubUrl} target="_blank" rel="noreferrer">
              GitHub
            </a>
          )}
          {project.demoUrl && (
            <a className="text-link" href={project.demoUrl} target="_blank" rel="noreferrer">
              Demo
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
