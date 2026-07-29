package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.mapper.ArticleMapper;
import com.malik.personal_website.dto.response.ErrorResponse;
import com.malik.personal_website.dto.response.ArticleResponse;
import com.malik.personal_website.dto.response.ArticleSummaryResponse;
import com.malik.personal_website.services.ArticleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/articles")
@Tag(name = "Public articles", description = "Опубликованные статьи.")
public class PublicArticleController {

    private final ArticleService articleService;
    private final ArticleMapper articleMapper;

    @GetMapping
    @Operation(summary = "Получить опубликованные статьи")
    public List<ArticleSummaryResponse> getArticles() {
        return articleMapper.toSummaryResponses(articleService.getPublishedArticles());
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Получить опубликованную статью по slug")
    @ApiResponse(
            responseCode = "404",
            description = "Опубликованная статья не найдена",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
    )
    public ArticleResponse getArticleBySlug(@PathVariable String slug) {
        return articleMapper.toResponse(articleService.getPublishedArticleBySlug(slug));
    }
}
