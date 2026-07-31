import { getPublicDocumentMetadata } from '../app/documentTitles';
import { SeoMetadata } from '../shared/components/SeoMetadata';
import { getPublicSiteOrigin } from '../shared/config/runtime.server';

export function loader() {
  return { metadata: getPublicDocumentMetadata('/privacy', getPublicSiteOrigin()) };
}

export function PrivacyPage({ loaderData }: { loaderData: ReturnType<typeof loader> }) {
  return (
    <section className="content-layout privacy-page">
      <SeoMetadata metadata={loaderData.metadata} />
      <header className="page-intro">
        <p className="eyebrow">Privacy</p>
        <h1>Contact form privacy notice</h1>
        <p className="lead">
          This notice explains what happens to the information submitted through the contact form.
        </p>
      </header>

      <div className="content-layout__main prose">
        <h2>Information collected</h2>
        <p>The form stores your name, email address, message, and submission timestamps.</p>

        <h2>Purpose</h2>
        <p>
          The information is used only to review your enquiry, reply to you, and protect the form
          from abuse. It is not sold or used for advertising.
        </p>

        <h2>Retention</h2>
        <p>
          Read messages are archived after 30 days. Archived messages are deleted after 365 days,
          unless they are needed longer to continue a conversation or meet a legal obligation.
        </p>

        <h2>Access and deletion</h2>
        <p>
          You may request a copy or deletion of your contact message by writing to the email address
          published on this website. Include the email address used in the original message so the
          request can be identified.
        </p>

        <h2>Security</h2>
        <p>
          Contact messages are available only through the authenticated administration area and are
          protected by the website’s access controls and retention process.
        </p>
      </div>
    </section>
  );
}

export default PrivacyPage;
