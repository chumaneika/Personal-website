import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ProjectGrid } from '../features/project-list/ProjectGrid';
import { SkillGroups } from '../features/skills/SkillGroups';
import { fetchHome } from '../shared/api/home';
import { LoadingState, PageState } from '../shared/components/PageState';
import { SocialLinks } from '../shared/components/SocialLinks';
import { getInitials, getProfileName, normalizeSkillCategories } from '../shared/utils/formatters';

export function HomePage() {
  const homeQuery = useQuery({
    queryKey: ['home'],
    queryFn: fetchHome,
  });

  if (homeQuery.isLoading) {
    return <LoadingState label="Loading portfolio..." />;
  }

  if (homeQuery.isError) {
    return (
      <PageState
        eyebrow="Portfolio"
        title="The public site is temporarily unavailable"
        message="Please try again in a moment."
      />
    );
  }

  const profile = homeQuery.data?.profile ?? null;
  const projects = homeQuery.data?.projects ?? [];
  const featuredProjects = projects.slice(0, 3);
  const visibleSkills = homeQuery.data?.skills.filter((skill) => skill.visible !== false) ?? [];
  const skillCategories = normalizeSkillCategories(undefined, visibleSkills);

  return (
    <>
      <section className="hero-section">
        <div className="hero-section__copy">
          <p className="eyebrow">Java Backend Developer</p>
          <h1>{getProfileName(profile)}</h1>
          <p className="headline">{profile?.headline ?? 'Backend systems, APIs, and production-minded engineering.'}</p>
          <p className="lead">
            {profile?.shortBio ??
              'Portfolio profile is being prepared. Published projects and contact links will appear here as soon as they are available.'}
          </p>
          {profile?.location && <p className="profile-meta">{profile.location}</p>}
          <SocialLinks profile={profile} />
          <div className="button-row">
            <Link className="button" to="/projects">
              Projects
            </Link>
            <Link className="button button--secondary" to="/contacts">
              Contacts
            </Link>
          </div>
        </div>

        <div className="hero-section__media" aria-label="Profile">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt={`${getProfileName(profile)} avatar`} />
          ) : (
            <div className="avatar-fallback">{getInitials(profile)}</div>
          )}
        </div>
      </section>

      <section className="section-block" aria-labelledby="featured-projects">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Selected Work</p>
            <h2 id="featured-projects">Published projects</h2>
          </div>
          {projects.length > 3 && (
            <Link className="text-link" to="/projects">
              View all
            </Link>
          )}
        </div>

        {featuredProjects.length > 0 ? (
          <ProjectGrid projects={featuredProjects} />
        ) : (
          <PageState
            compact
            title="Projects are coming soon"
            message="Published portfolio projects will appear here after they are added."
          />
        )}
      </section>

      <section className="section-block" aria-labelledby="home-skills">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Stack</p>
            <h2 id="home-skills">Visible skills</h2>
          </div>
          <Link className="text-link" to="/skills">
            Skills
          </Link>
        </div>

        {visibleSkills.length > 0 ? (
          <SkillGroups skills={visibleSkills} categories={skillCategories} />
        ) : (
          <PageState compact title="Skills are being updated" message="The public skill list is not available yet." />
        )}
      </section>
    </>
  );
}
