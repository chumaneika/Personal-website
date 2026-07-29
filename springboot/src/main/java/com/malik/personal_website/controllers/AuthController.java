package com.malik.personal_website.controllers;

import com.malik.personal_website.config.OpenApiConfig;
import com.malik.personal_website.dto.request.LoginRequest;
import com.malik.personal_website.dto.response.CsrfTokenResponse;
import com.malik.personal_website.dto.response.CurrentUserResponse;
import com.malik.personal_website.dto.response.ErrorResponse;
import com.malik.personal_website.exceptions.InvalidCredentialsException;
import com.malik.personal_website.services.LoginAttemptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.Comparator;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "CSRF, вход и завершение административной сессии.")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final LoginAttemptService loginAttemptService;

    @GetMapping("/csrf")
    @Operation(
            summary = "Получить CSRF-токен",
            description = "Создаёт или использует HTTP session и возвращает имя header и токен."
    )
    public CsrfTokenResponse getCsrfToken(CsrfToken csrfToken) {
        return new CsrfTokenResponse(csrfToken.getToken(), csrfToken.getHeaderName());
    }

    @PostMapping("/login")
    @Operation(
            summary = "Войти в административную панель",
            description = "При успехе создаёт server-side session и устанавливает HttpOnly JSESSIONID cookie."
    )
    @Parameter(
            name = OpenApiConfig.CSRF_HEADER,
            in = ParameterIn.HEADER,
            required = true,
            description = "Токен из GET /api/auth/csrf."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Аутентификация успешна"),
            @ApiResponse(
                    responseCode = "400",
                    description = "Некорректный email, пароль или JSON",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Неверный email или пароль",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "CSRF-токен отсутствует или недействителен",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "429",
                    description = "Превышен лимит попыток; ответ содержит Retry-After",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public CurrentUserResponse login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String clientKey = request.getRemoteAddr();
        loginAttemptService.checkAllowed(clientKey);

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(
                            loginRequest.email().trim().toLowerCase(Locale.ROOT),
                            loginRequest.password()
                    )
            );
        } catch (AuthenticationException exception) {
            loginAttemptService.recordFailure(clientKey);
            throw new InvalidCredentialsException();
        }

        loginAttemptService.recordSuccess(clientKey);
        request.getSession(true);
        request.changeSessionId();

        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);
        securityContextRepository.saveContext(securityContext, request, response);

        return currentUser(authentication);
    }

    private CurrentUserResponse currentUser(Authentication authentication) {
        String role = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .map(authority -> authority.replaceFirst("^ROLE_", ""))
                .min(Comparator.naturalOrder())
                .orElse("UNKNOWN");

        return new CurrentUserResponse(authentication.getName(), role);
    }
}
