import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { sendContactMessage } from '../../shared/api/contact';
import { type ContactFormValues, contactSchema } from './contactSchema';

export function ContactForm() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      senderName: '',
      senderEmail: '',
      message: '',
      website: '',
    },
  });

  const contactMutation = useMutation({
    mutationFn: sendContactMessage,
    onSuccess: () => {
      form.reset();
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    contactMutation.mutate(values);
  });

  return (
    <form className="stacked-form" onSubmit={onSubmit}>
      <label className="honeypot-field" aria-hidden="true">
        Website
        <input type="text" autoComplete="off" tabIndex={-1} {...form.register('website')} />
      </label>

      <label>
        Name
        <input type="text" autoComplete="name" {...form.register('senderName')} />
        {form.formState.errors.senderName && (
          <span>{form.formState.errors.senderName.message}</span>
        )}
      </label>

      <label>
        Email
        <input type="email" autoComplete="email" {...form.register('senderEmail')} />
        {form.formState.errors.senderEmail && (
          <span>{form.formState.errors.senderEmail.message}</span>
        )}
      </label>

      <label>
        Message
        <textarea rows={5} {...form.register('message')} />
        {form.formState.errors.message && <span>{form.formState.errors.message.message}</span>}
      </label>

      <button type="submit" disabled={contactMutation.isPending}>
        {contactMutation.isPending ? 'Sending...' : 'Send message'}
      </button>

      {contactMutation.isSuccess && <p className="form-note">Message sent. Thank you.</p>}
      {contactMutation.isError && (
        <p className="form-error">Could not send the message. Please try again.</p>
      )}
    </form>
  );
}
