package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.mapper.ArticleMapper;
import com.malik.personal_website.dto.response.ArticleResponse;
import com.malik.personal_website.dto.response.ArticleSummaryResponse;
import com.malik.personal_website.services.ArticleService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/articles")
public class PublicArticleController {

    private final ArticleService articleService;
    private final ArticleMapper articleMapper;

    @GetMapping
    public List<ArticleSummaryResponse> getArticles() {
        return articleMapper.toSummaryResponses(articleService.getPublishedArticles());
    }

    @GetMapping("/{slug}")
    public ArticleResponse getArticleBySlug(@PathVariable String slug) {
        return articleMapper.toResponse(articleService.getPublishedArticleBySlug(slug));
    }
}
