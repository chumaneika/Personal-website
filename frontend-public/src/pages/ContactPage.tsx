import type { Route } from './+types/ContactPage';
import { getPublicDocumentMetadata } from '../app/documentTitles';
import { ContactForm } from '../features/contact/ContactForm';
import { loadProfile } from '../shared/api/publicApi.server';
import { PageState } from '../shared/components/PageState';
import { SeoMetadata } from '../shared/components/SeoMetadata';
import { SocialLinks } from '../shared/components/SocialLinks';
import { getPublicSiteOrigin } from '../shared/config/runtime.server';
import { getProfileName } from '../shared/utils/formatters';

export async function loader({ request }: Route.LoaderArgs) {
  const metadata = getPublicDocumentMetadata('/contacts', getPublicSiteOrigin());

  try {
    return { profile: await loadProfile(request.signal), profileUnavailable: false, metadata };
  } catch {
    return { profile: null, profileUnavailable: true, metadata };
  }
}

export function ContactPage({ loaderData }: { loaderData: Route.ComponentProps['loaderData'] }) {
  return (
    <section className="contact-page">
      <SeoMetadata metadata={loaderData.metadata} />
      <div className="page-intro">
        <p className="eyebrow">Contact</p>
        <h1>Tell me about the project</h1>
        <p>
          Share a few details about the work, timeline, or backend challenge you want to discuss.
        </p>

        {loaderData.profileUnavailable && (
          <PageState
            compact
            title="Contact links unavailable"
            message="The form is still available below."
          />
        )}

        {loaderData.profile && (
          <div className="contact-panel">
            <h2>{getProfileName(loaderData.profile)}</h2>
            {loaderData.profile.location && <p>{loaderData.profile.location}</p>}
            <SocialLinks profile={loaderData.profile} includeEmail />
          </div>
        )}
      </div>
      <ContactForm />
    </section>
  );
}

export default ContactPage;
