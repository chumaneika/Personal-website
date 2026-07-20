package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.mapper.ArticleMapper;
import com.malik.personal_website.dto.request.ArticleRequest;
import com.malik.personal_website.dto.request.ArticleStatusUpdateRequest;
import com.malik.personal_website.dto.response.ArticleResponse;
import com.malik.personal_website.enums.PublicationStatus;
import com.malik.personal_website.services.ArticleService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/articles")
public class AdminArticleController {

    private final ArticleService articleService;
    private final ArticleMapper articleMapper;

    @GetMapping
    public List<ArticleResponse> getArticles(@RequestParam(required = false) PublicationStatus status) {
        return articleMapper.toResponses(articleService.getAdminArticles(status));
    }

    @GetMapping("/{id}")
    public ArticleResponse getArticle(@PathVariable Long id) {
        return articleMapper.toResponse(articleService.getAdminArticle(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ArticleResponse createArticle(@Valid @RequestBody ArticleRequest request) {
        return articleMapper.toResponse(articleService.createArticle(request));
    }

    @PutMapping("/{id}")
    public ArticleResponse updateArticle(@PathVariable Long id, @Valid @RequestBody ArticleRequest request) {
        return articleMapper.toResponse(articleService.updateArticle(id, request));
    }

    @PatchMapping("/{id}/status")
    public ArticleResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ArticleStatusUpdateRequest request
    ) {
        return articleMapper.toResponse(articleService.updateStatus(id, request.status()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
    }
}
