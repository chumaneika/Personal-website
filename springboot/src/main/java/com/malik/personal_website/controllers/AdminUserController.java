package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.CurrentUserResponse;
import java.util.Comparator;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminUserController {

    @GetMapping("/me")
    public CurrentUserResponse getCurrentUser(Authentication authentication) {
        String role = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .map(authority -> authority.replaceFirst("^ROLE_", ""))
                .min(Comparator.naturalOrder())
                .orElse("UNKNOWN");

        return new CurrentUserResponse(authentication.getName(), role);
    }
}
