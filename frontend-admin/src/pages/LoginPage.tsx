import { LoginForm } from '../features/auth/LoginForm';

export function LoginPage() {
  return (
    <main className="auth-page">
      <section>
        <p className="eyebrow">Admin access</p>
        <h1>Sign in</h1>
      </section>
      <LoginForm />
    </main>
  );
}
