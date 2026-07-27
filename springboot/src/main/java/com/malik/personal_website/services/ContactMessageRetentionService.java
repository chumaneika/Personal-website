package com.malik.personal_website.services;

import com.malik.personal_website.enums.ContactMessageStatus;
import com.malik.personal_website.repositories.ContactMessageRepository;
import java.time.Duration;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "app.contact.retention.enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class ContactMessageRetentionService {

    private final ContactMessageRepository contactMessageRepository;

    @Value("${app.contact.retention.archive-read-after:30d}")
    private Duration archiveReadAfter;

    @Value("${app.contact.retention.delete-archived-after:365d}")
    private Duration deleteArchivedAfter;

    @Scheduled(cron = "${app.contact.retention.cron:0 30 3 * * *}", zone = "UTC")
    @Transactional
    public void applyRetentionPolicy() {
        Instant now = Instant.now();
        int archived = contactMessageRepository.updateStatusForMessagesOlderThan(
                ContactMessageStatus.READ,
                ContactMessageStatus.ARCHIVED,
                now.minus(archiveReadAfter),
                now
        );
        long deleted = contactMessageRepository.deleteByStatusAndCreatedAtBefore(
                ContactMessageStatus.ARCHIVED,
                now.minus(deleteArchivedAfter)
        );

        if (archived > 0 || deleted > 0) {
            log.info(
                    "Contact message retention archived {} read messages and deleted {} old archived messages",
                    archived,
                    deleted
            );
        }
    }
}
