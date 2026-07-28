import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactForm } from './ContactForm';
import { renderPublicRoute } from '../../test/render';

const contactMocks = vi.hoisted(() => ({
  sendContactMessage: vi.fn(),
}));

vi.mock('../../shared/api/contact', () => contactMocks);

describe('contact form submission', () => {
  beforeEach(() => {
    contactMocks.sendContactMessage.mockReset();
  });

  it('validates fields, submits a message, and clears the form', async () => {
    contactMocks.sendContactMessage.mockResolvedValue(null);
    const { user } = renderPublicRoute(<ContactForm />);

    await user.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText('Name is required.')).toBeInTheDocument();
    expect(contactMocks.sendContactMessage).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText(/^Name/), 'Grace Hopper');
    await user.type(screen.getByLabelText(/^Email/), 'grace@example.com');
    await user.type(screen.getByLabelText(/^Message/), 'Let us build a reliable service.');
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() =>
      expect(contactMocks.sendContactMessage.mock.calls[0]?.[0]).toEqual({
        senderName: 'Grace Hopper',
        senderEmail: 'grace@example.com',
        message: 'Let us build a reliable service.',
        website: '',
      }),
    );
    const successStatus = await screen.findByRole('status');
    expect(successStatus).toHaveAttribute('aria-live', 'polite');
    expect(successStatus).toHaveTextContent('Message sent. Thank you.');
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('keeps the entered message and shows an error when submission fails', async () => {
    contactMocks.sendContactMessage.mockRejectedValue(new Error('Network unavailable'));
    const { user } = renderPublicRoute(<ContactForm />);

    await user.type(screen.getByLabelText('Name'), 'Grace Hopper');
    await user.type(screen.getByLabelText('Email'), 'grace@example.com');
    await user.type(screen.getByLabelText('Message'), 'Please call me back.');
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    const errorStatus = await screen.findByRole('alert');
    expect(errorStatus).toHaveAttribute('aria-live', 'assertive');
    expect(errorStatus).toHaveTextContent('Could not send the message. Please try again.');
    expect(screen.getByLabelText('Message')).toHaveValue('Please call me back.');
  });
});
