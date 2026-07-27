import { useSearchParams } from 'react-router-dom';
import { LoginForm } from '../features/auth/LoginForm';

export function LoginPage() {
  const [searchParams] = useSearchParams();

  return (
    <main className="auth-page">
      <section>
        <p className="eyebrow">Admin access</p>
        <h1>Sign in</h1>
      </section>
      {searchParams.get('passwordChanged') === '1' && (
        <p className="form-note">Password changed. Sign in with the new password.</p>
      )}
      <LoginForm />
    </main>
  );
}
