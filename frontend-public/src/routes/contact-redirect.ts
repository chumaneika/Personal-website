import { redirect } from 'react-router';

export function loader() {
  return redirect('/contacts', 308);
}
