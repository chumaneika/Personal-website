package com.malik.personal_website.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import java.util.List;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Personal Website API",
                version = "1.0.0",
                description = """
                        REST API публичного сайта и административной панели.
                        Текущие маршруты под /api относятся к первой major-версии.
                        """
        )
)
@SecurityScheme(
        name = OpenApiConfig.SESSION_COOKIE_SCHEME,
        type = SecuritySchemeType.APIKEY,
        in = SecuritySchemeIn.COOKIE,
        paramName = "JSESSIONID",
        description = "HttpOnly cookie серверной сессии, получаемая после POST /api/auth/login."
)
public class OpenApiConfig {

    public static final String SESSION_COOKIE_SCHEME = "sessionCookie";
    public static final String CSRF_HEADER = "X-CSRF-TOKEN";
    private static final String ERROR_SCHEMA = "#/components/schemas/ErrorResponse";

    @Bean
    OpenApiCustomizer apiContractCustomizer() {
        return openApi -> {
            openApi.path(
                    "/api/auth/logout",
                    new PathItem().post(new Operation()
                        .tags(List.of("Authentication"))
                        .summary("Завершить административную сессию")
                        .description("""
                                Инвалидирует текущую HTTP session и удаляет JSESSIONID.
                                Требует CSRF-токен.
                                """
                        )
                        .security(List.of(new SecurityRequirement().addList(SESSION_COOKIE_SCHEME)))
                        .addParametersItem(new HeaderParameter()
                                .name(CSRF_HEADER)
                                .required(true)
                                .description("Токен из GET /api/auth/csrf.")
                                .schema(new StringSchema()))
                        .responses(new ApiResponses()
                                .addApiResponse("204", new ApiResponse()
                                        .description("Сессия завершена или уже отсутствовала"))
                                .addApiResponse(
                                        "403",
                                        errorResponse("CSRF-токен отсутствует или недействителен")
                                )))
            );

            openApi.getPaths().forEach((path, pathItem) -> {
                if (!path.startsWith("/api/admin/")) {
                    return;
                }

                pathItem.readOperations().forEach(operation -> {
                    operation.getResponses().putIfAbsent(
                            "401",
                            errorResponse("Сессия отсутствует или истекла")
                    );
                    operation.getResponses().putIfAbsent(
                            "403",
                            errorResponse("Недостаточная роль или недействительный CSRF-токен")
                    );
                });
            });
        };
    }

    private ApiResponse errorResponse(String description) {
        return new ApiResponse()
                .description(description)
                .content(new Content().addMediaType(
                        org.springframework.http.MediaType.APPLICATION_JSON_VALUE,
                        new MediaType().schema(new Schema<>().$ref(ERROR_SCHEMA))
                ));
    }
}
