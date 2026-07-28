import { data } from 'react-router';
import type { Route } from './+types/AboutPage';
import { getPublicDocumentMetadata } from '../app/documentTitles';
import { getPersonStructuredData } from '../app/structuredData';
import { loadProfile } from '../shared/api/publicApi.server';
import { PageState } from '../shared/components/PageState';
import { Prose } from '../shared/components/Prose';
import { SeoMetadata } from '../shared/components/SeoMetadata';
import { SocialLinks } from '../shared/components/SocialLinks';
import { StructuredData } from '../shared/components/StructuredData';
import { getPublicSiteOrigin } from '../shared/config/runtime.server';
import { getProfileName } from '../shared/utils/formatters';

export async function loader({ request }: Route.LoaderArgs) {
  const metadata = getPublicDocumentMetadata('/about', getPublicSiteOrigin());

  try {
    return { profile: await loadProfile(request.signal), metadata };
  } catch {
    return data({ profile: null, metadata }, { status: 503 });
  }
}

export function AboutPage({ loaderData }: { loaderData: Route.ComponentProps['loaderData'] }) {
  if (!loaderData.profile) {
    return (
      <>
        <SeoMetadata metadata={loaderData.metadata} />
        <PageState
          eyebrow="About"
          title="Profile is unavailable"
          message="The public profile could not be loaded right now."
        />
      </>
    );
  }

  const profile = loaderData.profile;

  return (
    <section className="content-layout">
      <SeoMetadata metadata={loaderData.metadata} />
      <StructuredData data={getPersonStructuredData(profile, loaderData.metadata.canonicalUrl)} />
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

export default AboutPage;
