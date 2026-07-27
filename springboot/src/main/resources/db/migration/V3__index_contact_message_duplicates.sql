CREATE INDEX idx_contact_messages_sender_email_created_at
    ON contact_messages (sender_email, created_at DESC);
