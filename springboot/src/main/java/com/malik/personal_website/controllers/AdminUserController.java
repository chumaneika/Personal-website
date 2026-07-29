package com.malik.personal_website.controllers;

import com.malik.personal_website.config.OpenApiConfig;
import com.malik.personal_website.dto.request.PasswordChangeRequest;
import com.malik.personal_website.dto.response.CurrentUserResponse;
import com.malik.personal_website.services.AdminAccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Comparator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
@Tag(name = "Admin account", description = "Текущий администратор и смена пароля.")
@SecurityRequirement(name = OpenApiConfig.SESSION_COOKIE_SCHEME)
public class AdminUserController {

    private final AdminAccountService adminAccountService;

    @GetMapping("/me")
    @Operation(summary = "Получить текущего администратора")
    public CurrentUserResponse getCurrentUser(Authentication authentication) {
        String role = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .map(authority -> authority.replaceFirst("^ROLE_", ""))
                .min(Comparator.naturalOrder())
                .orElse("UNKNOWN");

        return new CurrentUserResponse(authentication.getName(), role);
    }

    @PostMapping("/account/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            summary = "Изменить пароль",
            description = "После успешной смены пароля текущая сессия инвалидируется."
    )
    @Parameter(
            name = OpenApiConfig.CSRF_HEADER,
            in = ParameterIn.HEADER,
            required = true,
            description = "Токен из GET /api/auth/csrf."
    )
    public void changePassword(
            @Valid @RequestBody PasswordChangeRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest
    ) {
        adminAccountService.changePassword(authentication.getName(), request);
        if (servletRequest.getSession(false) != null) {
            servletRequest.getSession(false).invalidate();
        }
        SecurityContextHolder.clearContext();
    }
}
