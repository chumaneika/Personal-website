package com.malik.personal_website.controllers;

import com.malik.personal_website.services.SitemapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequiredArgsConstructor
public class SitemapController {

    private final SitemapService sitemapService;

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String getSitemap() {
        return sitemapService.generate(currentBaseUrl());
    }

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public String getRobots() {
        String sitemapUrl = UriComponentsBuilder.fromUriString(currentBaseUrl())
                .path("/sitemap.xml")
                .build()
                .encode()
                .toUriString();
        return """
                User-agent: *
                Allow: /
                Disallow: /api/
                Sitemap: %s
                """.formatted(sitemapUrl);
    }

    private String currentBaseUrl() {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .build()
                .toUriString();
    }
}
