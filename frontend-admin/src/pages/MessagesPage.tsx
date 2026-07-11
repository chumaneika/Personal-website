import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchContactMessages, updateContactMessageStatus } from '../shared/api/messages';
import { queryClient } from '../shared/api/queryClient';
import { getApiErrorMessage } from '../shared/lib/errors';
import { formatDateTime, formatStatus, previewText } from '../shared/lib/format';
import { ContactMessageStatus, CONTACT_MESSAGE_STATUSES } from '../shared/types/api';

type MessageFilter = ContactMessageStatus | 'ALL';

export function MessagesPage() {
  const [statusFilter, setStatusFilter] = useState<MessageFilter>('ALL');
  const messagesQuery = useQuery({
    queryKey: ['contact-messages', statusFilter],
    queryFn: () => fetchContactMessages(statusFilter === 'ALL' ? undefined : statusFilter),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ContactMessageStatus }) =>
      updateContactMessageStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const messages = messagesQuery.data ?? [];

  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Inbox</p>
        <h1>Messages</h1>
      </div>

      <div className="toolbar">
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as MessageFilter)}>
            <option value="ALL">All statuses</option>
            {CONTACT_MESSAGE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {messagesQuery.isPending && <p className="surface-state">Loading messages...</p>}

      {messagesQuery.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(messagesQuery.error, 'Could not load messages.')}
        </p>
      )}

      {messagesQuery.isSuccess && messages.length === 0 && (
        <section className="empty-state compact-empty-state">
          <p className="eyebrow">No messages</p>
          <h2>Nothing matches this filter.</h2>
        </section>
      )}

      {messages.length > 0 && (
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Sender</th>
                <th>Email</th>
                <th>Created</th>
                <th>Status</th>
                <th>Preview</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id} className={message.status === 'NEW' ? 'highlight-row' : undefined}>
                  <td>
                    <strong>{message.senderName}</strong>
                  </td>
                  <td>
                    <a href={`mailto:${message.senderEmail}`}>{message.senderEmail}</a>
                  </td>
                  <td>{formatDateTime(message.createdAt)}</td>
                  <td>
                    <span className={`status-chip status-chip--${message.status.toLowerCase()}`}>
                      {formatStatus(message.status)}
                    </span>
                  </td>
                  <td>{previewText(message.message)}</td>
                  <td>
                    <div className="action-row">
                      <Link to={`/messages/${message.id}`}>Open</Link>
                      {message.status !== 'READ' && (
                        <button
                          type="button"
                          disabled={statusMutation.isPending}
                          onClick={() => statusMutation.mutate({ id: message.id, status: 'READ' })}
                        >
                          Mark read
                        </button>
                      )}
                      {message.status !== 'ARCHIVED' && (
                        <button
                          type="button"
                          disabled={statusMutation.isPending}
                          onClick={() => statusMutation.mutate({ id: message.id, status: 'ARCHIVED' })}
                        >
                          Archive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {statusMutation.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(statusMutation.error, 'Could not update message status.')}
        </p>
      )}
    </section>
  );
}
