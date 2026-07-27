package com.malik.personal_website.services;

import com.malik.personal_website.exceptions.LoginRateLimitException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class LoginAttemptService {

    private final ConcurrentMap<String, AttemptState> attempts = new ConcurrentHashMap<>();
    private final int maxAttempts;
    private final Duration attemptWindow;
    private final Duration blockDuration;
    private final Clock clock;

    public LoginAttemptService(
            @Value("${app.security.login.max-attempts:5}") int maxAttempts,
            @Value("${app.security.login.attempt-window:15m}") Duration attemptWindow,
            @Value("${app.security.login.block-duration:15m}") Duration blockDuration
    ) {
        if (maxAttempts < 1 || attemptWindow.isNegative() || attemptWindow.isZero()
                || blockDuration.isNegative() || blockDuration.isZero()) {
            throw new IllegalArgumentException("Login rate-limit settings must be positive");
        }
        this.maxAttempts = maxAttempts;
        this.attemptWindow = attemptWindow;
        this.blockDuration = blockDuration;
        this.clock = Clock.systemUTC();
    }

    public void checkAllowed(String clientKey) {
        AttemptState state = attempts.get(clientKey);
        if (state == null || state.blockedUntil() == null) {
            return;
        }

        Instant now = clock.instant();
        if (now.isBefore(state.blockedUntil())) {
            long retryAfter = Math.max(1, Duration.between(now, state.blockedUntil()).toSeconds());
            throw new LoginRateLimitException(retryAfter);
        }

        attempts.remove(clientKey, state);
    }

    public void recordFailure(String clientKey) {
        Instant now = clock.instant();
        attempts.compute(clientKey, (key, previous) -> {
            if (previous == null || now.isAfter(previous.windowStarted().plus(attemptWindow))) {
                return new AttemptState(now, 1, null);
            }

            int failures = previous.failures() + 1;
            Instant blockedUntil = failures >= maxAttempts ? now.plus(blockDuration) : null;
            return new AttemptState(previous.windowStarted(), failures, blockedUntil);
        });

        if (attempts.size() > 10_000) {
            attempts.entrySet().removeIf(entry -> isExpired(entry.getValue(), now));
        }
    }

    public void recordSuccess(String clientKey) {
        attempts.remove(clientKey);
    }

    private boolean isExpired(AttemptState state, Instant now) {
        if (state.blockedUntil() != null) {
            return now.isAfter(state.blockedUntil());
        }
        return now.isAfter(state.windowStarted().plus(attemptWindow));
    }

    private record AttemptState(
            Instant windowStarted,
            int failures,
            Instant blockedUntil
    ) {
    }
}
