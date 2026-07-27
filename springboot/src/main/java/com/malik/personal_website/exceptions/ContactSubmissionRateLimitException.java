package com.malik.personal_website.exceptions;

public class ContactSubmissionRateLimitException extends RuntimeException {

    private final long retryAfterSeconds;

    public ContactSubmissionRateLimitException(long retryAfterSeconds) {
        super("Too many contact form submissions. Try again later.");
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
