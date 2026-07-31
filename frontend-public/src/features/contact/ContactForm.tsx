import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { sendContactMessage } from '../../shared/api/contact';
import { type ContactFormValues, contactSchema } from './contactSchema';

type SubmissionStatus = 'idle' | 'pending' | 'success' | 'error';

export function ContactForm() {
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      senderName: '',
      senderEmail: '',
      message: '',
      website: '',
      privacyConsent: false,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmissionStatus('pending');

    try {
      await sendContactMessage({
        senderName: values.senderName,
        senderEmail: values.senderEmail,
        message: values.message,
        website: values.website,
      });
      form.reset();
      setSubmissionStatus('success');
    } catch {
      setSubmissionStatus('error');
    }
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

      <label className="consent-field">
        <input type="checkbox" {...form.register('privacyConsent')} />
        <span>
          I have read the <Link to="/privacy">privacy notice</Link> and agree to the processing of
          my contact message.
        </span>
      </label>
      {form.formState.errors.privacyConsent && (
        <span>{form.formState.errors.privacyConsent.message}</span>
      )}

      <button type="submit" disabled={submissionStatus === 'pending'}>
        {submissionStatus === 'pending' ? 'Sending...' : 'Send message'}
      </button>

      {submissionStatus === 'success' && (
        <p className="form-note" role="status" aria-live="polite" aria-atomic="true">
          Message sent. Thank you.
        </p>
      )}
      {submissionStatus === 'error' && (
        <p className="form-error" role="alert" aria-live="assertive" aria-atomic="true">
          Could not send the message. Please try again.
        </p>
      )}
    </form>
  );
}
