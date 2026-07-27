import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageDetailPage } from './MessageDetailPage';
import { MessagesPage } from './MessagesPage';
import { messageFixture } from '../test/fixtures';
import { renderAdminRoute } from '../test/render';

const messageMocks = vi.hoisted(() => ({
  deleteContactMessage: vi.fn(),
  fetchContactMessage: vi.fn(),
  fetchContactMessages: vi.fn(),
  updateContactMessageStatus: vi.fn(),
}));

vi.mock('../shared/api/messages', () => messageMocks);

describe('contact message management', () => {
  beforeEach(() => {
    Object.values(messageMocks).forEach((mock) => mock.mockReset());
  });

  it('lists, filters, updates, deletes, and opens inbox messages', async () => {
    const message = messageFixture();
    messageMocks.fetchContactMessages.mockResolvedValue({
      content: [message],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    });
    messageMocks.updateContactMessageStatus.mockImplementation(async (_id, status) => ({
      ...message,
      status,
    }));
    messageMocks.deleteContactMessage.mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const { router, user } = renderAdminRoute(<MessagesPage />, {
      route: '/messages',
      path: '/messages',
    });

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Status'), 'NEW');
    await waitFor(() =>
      expect(messageMocks.fetchContactMessages).toHaveBeenLastCalledWith('NEW', 0),
    );

    await user.click(screen.getByRole('button', { name: 'Mark read' }));
    await waitFor(() =>
      expect(messageMocks.updateContactMessageStatus).toHaveBeenCalledWith(4, 'READ'),
    );
    await user.click(screen.getByRole('button', { name: 'Archive' }));
    await waitFor(() =>
      expect(messageMocks.updateContactMessageStatus).toHaveBeenCalledWith(4, 'ARCHIVED'),
    );
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(messageMocks.deleteContactMessage.mock.calls[0]?.[0]).toBe(4));

    await user.click(screen.getByRole('row', { name: 'Open message from Ada Lovelace' }));
    expect(router.state.location.pathname).toBe('/messages/4');
  });

  it('loads message details and changes the status', async () => {
    const message = messageFixture();
    messageMocks.fetchContactMessage.mockResolvedValue(message);
    messageMocks.updateContactMessageStatus.mockResolvedValue({ ...message, status: 'READ' });

    const { user } = renderAdminRoute(<MessageDetailPage />, {
      route: '/messages/4',
      path: '/messages/:id',
    });

    expect(await screen.findByText(message.message)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mark as read' }));

    await waitFor(() =>
      expect(messageMocks.updateContactMessageStatus).toHaveBeenCalledWith(4, 'READ'),
    );
    expect(await screen.findByText('Read')).toBeInTheDocument();
  });
});
