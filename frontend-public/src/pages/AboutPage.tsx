import { useQuery } from '@tanstack/react-query';
import { fetchProfile } from '../shared/api/profile';
import { LoadingState, PageState } from '../shared/components/PageState';
import { Prose } from '../shared/components/Prose';
import { SocialLinks } from '../shared/components/SocialLinks';
import { getProfileName } from '../shared/utils/formatters';

export function AboutPage() {
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  if (profileQuery.isLoading) {
    return <LoadingState label="Loading profile..." />;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <PageState
        eyebrow="About"
        title="Profile is unavailable"
        message="The public profile could not be loaded right now."
      />
    );
  }

  const profile = profileQuery.data;

  return (
    <section className="content-layout">
      <header className="page-intro">
        <p className="eyebrow">About</p>
        <h1>{getProfileName(profile)}</h1>
        <p className="headline">{profile.headline}</p>
      </header>

      <div className="content-layout__main">
        <Prose content={profile.fullBio} fallback="The full public biography is being updated." />
      </div>

      <aside className="info-panel" aria-label="Profile details">
        {profile.location && (
          <div>
            <span>Location</span>
            <strong>{profile.location}</strong>
          </div>
        )}
        {profile.email && (
          <div>
            <span>Email</span>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </div>
        )}
        {profile.resumeUrl && (
          <div>
            <span>Resume</span>
            <a href={profile.resumeUrl} target="_blank" rel="noreferrer">
              Open resume
            </a>
          </div>
        )}
        <SocialLinks profile={profile} />
      </aside>
    </section>
  );
}
