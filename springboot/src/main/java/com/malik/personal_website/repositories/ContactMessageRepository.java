package com.malik.personal_website.repositories;

import com.malik.personal_website.entities.ContactMessageEntity;
import com.malik.personal_website.enums.ContactMessageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository extends JpaRepository<ContactMessageEntity, Long> {

    Page<ContactMessageEntity> findByStatus(ContactMessageStatus status, Pageable pageable);

    long countByStatus(ContactMessageStatus status);
}
