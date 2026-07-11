package com.malik.personal_website.entities;

import com.malik.personal_website.enums.ContactMessageStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "contact_messages")
public class ContactMessageEntity extends BaseEntity {

    @Column(name = "sender_name", nullable = false, length = 120)
    private String senderName;

    @Column(name = "sender_email", nullable = false, length = 254)
    private String senderEmail;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private ContactMessageStatus status = ContactMessageStatus.NEW;

    public void setSenderName(String senderName) {
        this.senderName = requireText(senderName, "senderName", 120);
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = requireEmail(senderEmail, "senderEmail");
    }

    public void setMessage(String message) {
        this.message = requireText(message, "message");
    }

    public void setStatus(ContactMessageStatus status) {
        this.status = requireValue(status, "status");
    }
}
