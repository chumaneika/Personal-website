import { data } from 'react-router';
import { Link } from 'react-router-dom';
import type { Route } from './+types/NotFoundPage';
import { getPublicDocumentMetadata } from '../app/documentTitles';
import { PageState } from '../shared/components/PageState';
import { SeoMetadata } from '../shared/components/SeoMetadata';
import { getPublicSiteOrigin } from '../shared/config/runtime.server';

export function loader({ request }: Route.LoaderArgs) {
  const pathname = new URL(request.url).pathname;

  return data(
    {
      metadata: getPublicDocumentMetadata(pathname, getPublicSiteOrigin()),
    },
    { status: 404 },
  );
}

export function NotFoundPage({ loaderData }: { loaderData: Route.ComponentProps['loaderData'] }) {
  return (
    <>
      <SeoMetadata metadata={loaderData.metadata} noIndex />
      <PageState
        eyebrow="404"
        title="Page not found"
        message="The page you are looking for does not exist."
        action={
          <Link className="button button--secondary" to="/">
            Home
          </Link>
        }
      />
    </>
  );
}

export default NotFoundPage;
