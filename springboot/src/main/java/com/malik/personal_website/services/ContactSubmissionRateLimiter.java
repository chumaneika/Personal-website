package com.malik.personal_website.services;

import com.malik.personal_website.exceptions.ContactSubmissionRateLimitException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ContactSubmissionRateLimiter {

    private static final int CLEANUP_THRESHOLD = 10_000;

    private final Map<String, AttemptWindow> attemptsByAddress = new ConcurrentHashMap<>();
    private final int maxSubmissions;
    private final Duration window;

    public ContactSubmissionRateLimiter(
            @Value("${app.contact.rate-limit.max-submissions:5}") int maxSubmissions,
            @Value("${app.contact.rate-limit.window:10m}") Duration window
    ) {
        if (maxSubmissions < 1) {
            throw new IllegalArgumentException("Contact rate limit must allow at least one submission");
        }
        if (window.isZero() || window.isNegative()) {
            throw new IllegalArgumentException("Contact rate limit window must be positive");
        }
        this.maxSubmissions = maxSubmissions;
        this.window = window;
    }

    public void checkAndRecord(String clientAddress) {
        Instant now = Instant.now();
        String key = normalizeAddress(clientAddress);

        attemptsByAddress.compute(key, (ignored, currentWindow) -> {
            AttemptWindow activeWindow = currentWindow;
            if (activeWindow == null || !now.isBefore(activeWindow.startedAt.plus(window))) {
                return new AttemptWindow(now, 1);
            }
            if (activeWindow.count >= maxSubmissions) {
                long retryAfter = Math.max(
                        1,
                        Duration.between(now, activeWindow.startedAt.plus(window)).toSeconds()
                );
                throw new ContactSubmissionRateLimitException(retryAfter);
            }
            return new AttemptWindow(activeWindow.startedAt, activeWindow.count + 1);
        });

        if (attemptsByAddress.size() > CLEANUP_THRESHOLD) {
            attemptsByAddress.entrySet().removeIf(entry ->
                    !now.isBefore(entry.getValue().startedAt.plus(window)));
        }
    }

    private String normalizeAddress(String clientAddress) {
        if (clientAddress == null || clientAddress.isBlank()) {
            return "unknown";
        }
        return clientAddress.trim();
    }

    private record AttemptWindow(Instant startedAt, int count) {
    }
}
