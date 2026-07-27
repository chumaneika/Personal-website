package com.malik.personal_website.services;

import com.malik.personal_website.events.ContactMessageCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "app.contact.notifications.email.enabled",
        havingValue = "true"
)
public class ContactMessageEmailNotifier {

    private final JavaMailSender mailSender;

    @Value("${app.contact.notifications.email.from}")
    private String from;

    @Value("${app.contact.notifications.email.to}")
    private String to;

    @Value("${app.contact.notifications.email.subject:New contact form message}")
    private String subject;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void notifyAboutNewMessage(ContactMessageCreatedEvent event) {
        try {
            SimpleMailMessage notification = new SimpleMailMessage();
            notification.setFrom(from);
            notification.setTo(to);
            notification.setReplyTo(event.senderEmail());
            notification.setSubject(subject + " #" + event.id());
            notification.setText("""
                    A new message was submitted through the contact form.

                    Name: %s
                    Email: %s
                    Received: %s

                    Message:
                    %s
                    """.formatted(
                    event.senderName(),
                    event.senderEmail(),
                    event.createdAt(),
                    event.message()
            ));
            mailSender.send(notification);
        } catch (RuntimeException exception) {
            log.error(
                    "Could not send email notification for contact message {}",
                    event.id(),
                    exception
            );
        }
    }
}
