import { useQuery } from '@tanstack/react-query';
import { fetchProfile } from '../shared/api/profile';
import { LoadingState, PageState } from '../shared/components/PageState';
import { getProfileName } from '../shared/utils/formatters';

export function ResumePage() {
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  if (profileQuery.isLoading) {
    return <LoadingState label="Loading resume..." />;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <PageState
        eyebrow="Resume"
        title="Resume is unavailable"
        message="The public profile could not be loaded right now."
      />
    );
  }

  const profile = profileQuery.data;

  if (!profile.resumeUrl) {
    return (
      <PageState
        eyebrow="Resume"
        title="Resume is not published yet"
        message="A downloadable resume will appear here when it is available."
      />
    );
  }

  return (
    <section className="resume-page">
      <div className="page-intro">
        <p className="eyebrow">Resume</p>
        <h1>{getProfileName(profile)}</h1>
        <p>{profile.headline}</p>
        <a className="button" href={profile.resumeUrl} target="_blank" rel="noreferrer">
          Open resume
        </a>
      </div>
    </section>
  );
}
