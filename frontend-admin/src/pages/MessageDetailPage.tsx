import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { fetchContactMessage, updateContactMessageStatus } from '../shared/api/messages';
import { queryClient } from '../shared/api/queryClient';
import { getApiErrorMessage } from '../shared/lib/errors';
import { formatDateTime, formatStatus } from '../shared/lib/format';
import { ContactMessageStatus } from '../shared/types/api';

export function MessageDetailPage() {
  const { id } = useParams();
  const messageId = id ? Number(id) : null;
  const hasInvalidId = messageId === null || !Number.isInteger(messageId);

  const messageQuery = useQuery({
    queryKey: ['contact-message', messageId],
    queryFn: () => fetchContactMessage(messageId as number),
    enabled: !hasInvalidId,
  });

  const statusMutation = useMutation({
    mutationFn: (status: ContactMessageStatus) => updateContactMessageStatus(messageId as number, status),
    onSuccess: (message) => {
      queryClient.setQueryData(['contact-message', message.id], message);
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  if (hasInvalidId) {
    return (
      <section className="empty-state">
        <p className="eyebrow">Invalid message</p>
        <h1>Message id is not valid.</h1>
        <Link to="/messages">Back to messages</Link>
      </section>
    );
  }

  const message = messageQuery.data;

  return (
    <section className="page-stack">
      <div className="page-heading page-heading--row">
        <div>
          <p className="eyebrow">Inbox</p>
          <h1>Message detail</h1>
        </div>
        <Link className="button-link button-link--secondary" to="/messages">
          Back to messages
        </Link>
      </div>

      {messageQuery.isPending && <p className="surface-state">Loading message...</p>}

      {messageQuery.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(messageQuery.error, 'Could not load message.')}
        </p>
      )}

      {message && (
        <article className="message-detail">
          <header>
            <div>
              <p className="eyebrow">From</p>
              <h2>{message.senderName}</h2>
              <a href={`mailto:${message.senderEmail}`}>{message.senderEmail}</a>
            </div>
            <span className={`status-chip status-chip--${message.status.toLowerCase()}`}>
              {formatStatus(message.status)}
            </span>
          </header>

          <div className="metadata-row">
            <span>Created {formatDateTime(message.createdAt)}</span>
            <span>Updated {formatDateTime(message.updatedAt)}</span>
          </div>

          <p className="message-body">{message.message}</p>

          <div className="quick-actions">
            {message.status !== 'READ' && (
              <button type="button" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate('READ')}>
                Mark as read
              </button>
            )}
            {message.status !== 'ARCHIVED' && (
              <button
                type="button"
                disabled={statusMutation.isPending}
                onClick={() => statusMutation.mutate('ARCHIVED')}
              >
                Archive
              </button>
            )}
          </div>

          {statusMutation.isError && (
            <p className="form-error">{getApiErrorMessage(statusMutation.error, 'Could not update message status.')}</p>
          )}
        </article>
      )}
    </section>
  );
}
