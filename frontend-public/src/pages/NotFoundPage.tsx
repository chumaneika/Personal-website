import { Link } from 'react-router-dom';
import { PageState } from '../shared/components/PageState';

export function NotFoundPage() {
  return (
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
  );
}
