import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../../shared/api/auth';
import { LoginFormValues, loginSchema } from './loginSchema';

export function LoginForm() {
  const navigate = useNavigate();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      navigate('/', { replace: true });
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    loginMutation.mutate(values);
  });

  return (
    <form className="stacked-form" onSubmit={onSubmit}>
      <label>
        Email
        <input type="email" autoComplete="email" {...form.register('email')} />
        {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}
      </label>

      <label>
        Password
        <input type="password" autoComplete="current-password" {...form.register('password')} />
        {form.formState.errors.password && <span>{form.formState.errors.password.message}</span>}
      </label>

      <button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
      </button>

      {loginMutation.isError && (
        <p className="form-error">Could not sign in. Check the admin email and password.</p>
      )}
    </form>
  );
}
