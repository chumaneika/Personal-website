package com.malik.personal_website.repositories;

import com.malik.personal_website.entities.ContactMessageEntity;
import com.malik.personal_website.enums.ContactMessageStatus;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ContactMessageRepository extends JpaRepository<ContactMessageEntity, Long> {

    Page<ContactMessageEntity> findByStatus(ContactMessageStatus status, Pageable pageable);

    long countByStatus(ContactMessageStatus status);

    boolean existsBySenderEmailAndMessageAndCreatedAtAfter(
            String senderEmail,
            String message,
            Instant createdAfter
    );

    @Modifying(clearAutomatically = true)
    @Query("""
            update ContactMessageEntity message
               set message.status = :targetStatus,
                   message.updatedAt = :updatedAt
             where message.status = :sourceStatus
               and message.createdAt < :cutoff
            """)
    int updateStatusForMessagesOlderThan(
            @Param("sourceStatus") ContactMessageStatus sourceStatus,
            @Param("targetStatus") ContactMessageStatus targetStatus,
            @Param("cutoff") Instant cutoff,
            @Param("updatedAt") Instant updatedAt
    );

    long deleteByStatusAndCreatedAtBefore(ContactMessageStatus status, Instant cutoff);
}
