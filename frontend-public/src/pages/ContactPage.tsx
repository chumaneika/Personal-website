import { useQuery } from '@tanstack/react-query';
import { ContactForm } from '../features/contact/ContactForm';
import { fetchProfile } from '../shared/api/profile';
import { PageState } from '../shared/components/PageState';
import { SocialLinks } from '../shared/components/SocialLinks';
import { getProfileName } from '../shared/utils/formatters';

export function ContactPage() {
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  return (
    <section className="contact-page">
      <div className="page-intro">
        <p className="eyebrow">Contact</p>
        <h1>Tell me about the project</h1>
        <p>Share a few details about the work, timeline, or backend challenge you want to discuss.</p>

        {profileQuery.isLoading && (
          <PageState compact title="Loading contacts" message="Public contact links are loading." />
        )}

        {profileQuery.isError && (
          <PageState compact title="Contact links unavailable" message="The form is still available below." />
        )}

        {profileQuery.data && (
          <div className="contact-panel">
            <h2>{getProfileName(profileQuery.data)}</h2>
            {profileQuery.data.location && <p>{profileQuery.data.location}</p>}
            <SocialLinks profile={profileQuery.data} includeEmail />
          </div>
        )}
      </div>
      <ContactForm />
    </section>
  );
}
