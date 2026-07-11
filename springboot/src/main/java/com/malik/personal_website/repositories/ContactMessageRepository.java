package com.malik.personal_website.repositories;

import com.malik.personal_website.entities.ContactMessageEntity;
import com.malik.personal_website.enums.ContactMessageStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository extends JpaRepository<ContactMessageEntity, Long> {

    List<ContactMessageEntity> findAllByOrderByCreatedAtDesc();

    List<ContactMessageEntity> findByStatusOrderByCreatedAtDesc(ContactMessageStatus status);

    long countByStatus(ContactMessageStatus status);
}
