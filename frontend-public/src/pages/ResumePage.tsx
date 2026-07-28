import { data } from 'react-router';
import type { Route } from './+types/ResumePage';
import { getPublicDocumentMetadata } from '../app/documentTitles';
import { loadProfile } from '../shared/api/publicApi.server';
import { PageState } from '../shared/components/PageState';
import { SeoMetadata } from '../shared/components/SeoMetadata';
import { getPublicSiteOrigin } from '../shared/config/runtime.server';
import { getProfileName } from '../shared/utils/formatters';

export async function loader({ request }: Route.LoaderArgs) {
  const metadata = getPublicDocumentMetadata('/resume', getPublicSiteOrigin());

  try {
    return { profile: await loadProfile(request.signal), metadata };
  } catch {
    return data({ profile: null, metadata }, { status: 503 });
  }
}

export function ResumePage({ loaderData }: { loaderData: Route.ComponentProps['loaderData'] }) {
  if (!loaderData.profile) {
    return (
      <>
        <SeoMetadata metadata={loaderData.metadata} />
        <PageState
          eyebrow="Resume"
          title="Resume is unavailable"
          message="The public profile could not be loaded right now."
        />
      </>
    );
  }

  const profile = loaderData.profile;

  if (!profile.resumeUrl) {
    return (
      <>
        <SeoMetadata metadata={loaderData.metadata} />
        <PageState
          eyebrow="Resume"
          title="Resume is not published yet"
          message="A downloadable resume will appear here when it is available."
        />
      </>
    );
  }

  return (
    <section className="resume-page">
      <SeoMetadata metadata={loaderData.metadata} />
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

export default ResumePage;
