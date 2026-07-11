import type { ProjectSummaryResponse } from '../../shared/types/api';
import { ProjectCard } from './ProjectCard';

type ProjectGridProps = {
  projects: ProjectSummaryResponse[];
};

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className="project-grid">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
