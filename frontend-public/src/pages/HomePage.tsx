import { Link } from 'react-router';
import { data } from 'react-router';
import type { Route } from './+types/HomePage';
import { getPublicDocumentMetadata } from '../app/documentTitles';
import { getPersonStructuredData } from '../app/structuredData';
import { ArticleGrid } from '../features/article-list/ArticleGrid';
import { ProjectGrid } from '../features/project-list/ProjectGrid';
import { SkillGroups } from '../features/skills/SkillGroups';
import { loadArticles, loadHome } from '../shared/api/publicApi.server';
import { PageState } from '../shared/components/PageState';
import { OptimizedImage } from '../shared/components/OptimizedImage';
import { SeoMetadata } from '../shared/components/SeoMetadata';
import { SocialLinks } from '../shared/components/SocialLinks';
import { StructuredData } from '../shared/components/StructuredData';
import { getPublicSiteOrigin } from '../shared/config/runtime.server';
import { getInitials, getProfileName, normalizeSkillCategories } from '../shared/utils/formatters';

export async function loader({ request }: Route.LoaderArgs) {
  const metadata = getPublicDocumentMetadata('/', getPublicSiteOrigin());
  const [homeResult, articlesResult] = await Promise.allSettled([
    loadHome(request.signal),
    loadArticles(request.signal),
  ]);

  if (homeResult.status === 'rejected') {
    return data(
      {
        home: null,
        articles: [],
        articlesUnavailable: articlesResult.status === 'rejected',
        metadata,
      },
      { status: 503 },
    );
  }

  return {
    home: homeResult.value,
    articles: articlesResult.status === 'fulfilled' ? articlesResult.value : [],
    articlesUnavailable: articlesResult.status === 'rejected',
    metadata,
  };
}

export function HomePage({ loaderData }: { loaderData: Route.ComponentProps['loaderData'] }) {
  if (!loaderData.home) {
    return (
      <>
        <SeoMetadata metadata={loaderData.metadata} />
        <PageState
          eyebrow="Portfolio"
          title="The public site is temporarily unavailable"
          message="Please try again in a moment."
        />
      </>
    );
  }

  const profile = loaderData.home.profile ?? null;
  const projects = loaderData.home.projects ?? [];
  const featuredProjects = projects.slice(0, 3);
  const visibleSkills = loaderData.home.skills.filter((skill) => skill.visible !== false);
  const skillCategories = normalizeSkillCategories(undefined, visibleSkills);

  return (
    <>
      <SeoMetadata metadata={loaderData.metadata} />
      {profile && (
        <StructuredData
          data={getPersonStructuredData(profile, loaderData.metadata.canonicalUrl, visibleSkills)}
        />
      )}
      <section className="hero-section">
        <div className="hero-section__copy">
          <p className="eyebrow">Java Backend Developer</p>
          <h1>{getProfileName(profile)}</h1>
          <p className="headline">
            {profile?.headline ?? 'Backend systems, APIs, and production-minded engineering.'}
          </p>
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
            <OptimizedImage
              src={profile.avatarUrl}
              avifSrc={profile.avatarAvifUrl}
              webpSrc={profile.avatarWebpUrl}
              pictureClassName="hero-section__picture"
              alt={`${getProfileName(profile)} avatar`}
              width={800}
              height={800}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
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
          <PageState
            compact
            title="Skills are being updated"
            message="The public skill list is not available yet."
          />
        )}
      </section>

      <section className="section-block" aria-labelledby="latest-articles">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Writing</p>
            <h2 id="latest-articles">Latest articles</h2>
          </div>
          <Link className="text-link" to="/blog">
            Blog
          </Link>
        </div>

        {loaderData.articlesUnavailable && (
          <PageState
            compact
            title="Articles are unavailable"
            message="Published articles could not be loaded right now."
          />
        )}
        {!loaderData.articlesUnavailable && loaderData.articles.length > 0 && (
          <ArticleGrid articles={loaderData.articles.slice(0, 3)} />
        )}
        {!loaderData.articlesUnavailable && loaderData.articles.length === 0 && (
          <PageState
            compact
            title="Articles are coming soon"
            message="Published articles will appear here."
          />
        )}
      </section>
    </>
  );
}

export default HomePage;
