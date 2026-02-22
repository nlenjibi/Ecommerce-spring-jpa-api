package com.smart_ecomernce_api.smart_ecomernce_api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SpringDocConfig {

    @Value("${server.port:9190}")
    private int serverPort;

    @Value("${server.servlet.context-path:/api}")
    private String contextPath;

    @Bean
    public OpenAPI customOpenAPI() {
        // Define the security scheme for your UUID token authentication
        SecurityScheme securityScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("UUID")
                .description("Enter your UUID token. Obtain it from the /api/auth/login endpoint.");

        // Security requirement that can be applied to operations
        SecurityRequirement securityRequirement = new SecurityRequirement()
                .addList("UUID-Token");

        return new OpenAPI()
                .info(new Info()
                        .title("Smart E-Commerce System API")
                        .version("v0.0.1")
                        .description("""
                                Complete REST API for Smart E-Commerce System
                                
                                ## Authentication
                                This API uses UUID token-based authentication.
                                
                                1. **Login**: POST to `/api/auth/login` to get a token
                                2. **Use Token**: Include in Authorization header: `Bearer {token}`
                                3. **Role-based access**: Some endpoints require specific roles (ADMIN, USER, etc.)
                                
                                ## Public Endpoints
                                - `/api/auth/login` - User authentication
                                - `/api/auth/register` - User registration  
                                - `/api/v1/products` - Public product listings
                                - `/api/v1/categories` - Public category listings
                                - Swagger UI (`/api/swagger-ui.html`) - This documentation
                                """)
                .contact(new Contact()
                        .name("Development Team")
                        .email("dev@ecommerce.com"))
                .license(new License()
                        .name("Apache 2.0")
                        .url("https://www.apache.org/licenses/LICENSE-2.0.html")))
                .servers(List.of(
                new Server()
                        .url("http://localhost:" + serverPort + contextPath)
                        .description("Development Server"),
                new Server()
                        .url("https://your-production-domain.com" + contextPath)
                        .description("Production Server")
        ))
                .components(new Components()
                        .addSecuritySchemes("UUID-Token", securityScheme))
                .addSecurityItem(securityRequirement);
    }

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("public")
                .pathsToMatch(
                        "/auth/**",
                        "/v1/products/**",
                        "/v1/categories/**",
                        "/public/**",
                        "/info",
                        "/help-support/**",
                        "/social-links",
                        "/app-download-links"
                )
                .build();
    }

    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
                .group("user")
                .pathsToMatch(
                        "/user/**",
                        "/order/**",
                        "/cart/**",
                        "/wishlist/**",
                        "/review/**"
                )
                .addOpenApiMethodFilter(method ->
                        method.isAnnotationPresent(org.springframework.web.bind.annotation.RequestMapping.class))
                .build();
    }

    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
                .group("admin")
                .pathsToMatch(
                        "/admin/**",
                        "/performance/**",
                        "/management/**"
                )
                .addOpenApiMethodFilter(method ->
                        method.isAnnotationPresent(org.springframework.web.bind.annotation.RequestMapping.class))
                .build();
    }

    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
                .group("all")
                .pathsToMatch("/**")
                .build();
    }
}
