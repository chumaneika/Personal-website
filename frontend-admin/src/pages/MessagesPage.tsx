import { useMutation, useQuery } from '@tanstack/react-query';
import type { KeyboardEvent, MouseEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteContactMessage, fetchContactMessages, updateContactMessageStatus } from '../shared/api/messages';
import { queryClient } from '../shared/api/queryClient';
import { getApiErrorMessage } from '../shared/lib/errors';
import { formatDateTime, formatStatus, previewText } from '../shared/lib/format';
import { ContactMessageStatus, CONTACT_MESSAGE_STATUSES } from '../shared/types/api';

type MessageFilter = ContactMessageStatus | 'ALL';

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('a, button, input, select, textarea'));
}

export function MessagesPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<MessageFilter>('ALL');
  const [page, setPage] = useState(0);
  const messagesQuery = useQuery({
    queryKey: ['contact-messages', statusFilter, page],
    queryFn: () => fetchContactMessages(statusFilter === 'ALL' ? undefined : statusFilter, page),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ContactMessageStatus }) =>
      updateContactMessageStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContactMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const messages = messagesQuery.data?.content ?? [];

  function handleDelete(id: number, senderName: string) {
    if (window.confirm(`Delete the message from ${senderName} permanently?`)) {
      deleteMutation.mutate(id);
    }
  }

  function handleRowClick(event: MouseEvent<HTMLTableRowElement>, id: number) {
    if (!isInteractiveTarget(event.target)) {
      navigate(`/messages/${id}`);
    }
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, id: number) {
    if (isInteractiveTarget(event.target) || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    navigate(`/messages/${id}`);
  }

  return (
    <section className="page-stack">
      <div className="page-heading">
        <p className="eyebrow">Inbox</p>
        <h1>Messages</h1>
      </div>

      <div className="toolbar">
        <label>
          Status
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as MessageFilter);
              setPage(0);
            }}
          >
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
                <tr
                  key={message.id}
                  className={`clickable-row${message.status === 'NEW' ? ' highlight-row' : ''}`}
                  tabIndex={0}
                  aria-label={`Open message from ${message.senderName}`}
                  onClick={(event) => handleRowClick(event, message.id)}
                  onKeyDown={(event) => handleRowKeyDown(event, message.id)}
                >
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
                      <button
                        type="button"
                        className="danger-link"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(message.id, message.senderName)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {messagesQuery.data && messagesQuery.data.totalPages > 1 && (
        <div className="action-row">
          <button type="button" disabled={messagesQuery.data.first} onClick={() => setPage((value) => value - 1)}>
            Previous
          </button>
          <span>
            Page {messagesQuery.data.page + 1} of {messagesQuery.data.totalPages}
          </span>
          <button type="button" disabled={messagesQuery.data.last} onClick={() => setPage((value) => value + 1)}>
            Next
          </button>
        </div>
      )}

      {statusMutation.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(statusMutation.error, 'Could not update message status.')}
        </p>
      )}
      {deleteMutation.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(deleteMutation.error, 'Could not delete message.')}
        </p>
      )}
    </section>
  );
}
