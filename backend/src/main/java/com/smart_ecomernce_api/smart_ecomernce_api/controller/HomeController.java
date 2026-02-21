package com.smart_ecomernce_api.smart_ecomernce_api.controller;

import com.smart_ecomernce_api.smart_ecomernce_api.security.annotation.RequestValidation;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Serves the root index page and a public API-info endpoint.
 * Both endpoints are explicitly public – no token required.
 */
@Controller
public class HomeController {

    @GetMapping({"", "/"})
    @RequestValidation(requireAuth = false, description = "Root index page")
    public String home() {
        return "index";
    }

    @GetMapping("/api/info")
    @ResponseBody
    @RequestValidation(requireAuth = false, description = "Public API information")
    public Map<String, Object> apiInfo() {
        return Map.of(
                "app",       "Smart E-Commerce Platform API",
                "version",   "1.0.0",
                "status",    "running",
                "timestamp", LocalDateTime.now(),
                "apiBase",   "/api/v1",
                "docs", Map.of(
                        "swagger", "/swagger-ui.html",
                        "openapi", "/v3/api-docs"
                ),
                "importantEndpoints", List.of(
                        "/api/v1/products",
                        "/api/v1/categories",
                        "/api/v1/orders/my-orders",
                        "/api/v1/carts/{cartId}"
                )
        );
    }
}