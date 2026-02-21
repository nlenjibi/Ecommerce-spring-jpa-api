package com.smart_ecomernce_api.smart_ecomernce_api.config;

import com.smart_ecomernce_api.smart_ecomernce_api.security.UserContext;
import com.smart_ecomernce_api.smart_ecomernce_api.security.TokenStore;
import com.smart_ecomernce_api.smart_ecomernce_api.security.filter.AuthenticationFilter;
import graphql.execution.instrumentation.SimpleInstrumentation;
import graphql.execution.instrumentation.parameters.InstrumentationFieldParameters;
import graphql.schema.DataFetchingEnvironment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.GraphQlSource;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

/**
 * GraphQL Security Configuration for custom authentication system
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class GraphQLSecurityConfig {

    private final TokenStore tokenStore;

    // Public GraphQL queries that don't require authentication
    private static final List<String> PUBLIC_QUERIES = List.of(
            "products",
            "categories",
            "product",
            "category",
            "searchProducts",
            "searchCategories",
            "activeCategories",
            "featuredProducts"
    );

    // Protected queries that require authentication
    private static final List<String> PROTECTED_QUERIES = List.of(
            "userProfile",
            "myOrders",
            "myCart",
            "myWishlist",
            "orderHistory"
    );

    // Admin-only queries and mutations
    private static final List<String> ADMIN_OPERATIONS = List.of(
            "users",
            "allOrders",
            "adminDashboard",
            "performanceMetrics",
            "createUser",
            "updateUser",
            "deleteUser",
            "updateProduct",
            "deleteProduct",
            "updateCategory",
            "deleteCategory"
    );



    /**
     * Custom DataFetcherExceptionHandler for GraphQL security
     */
    @Bean
    public graphql.execution.DataFetcherExceptionHandler dataFetcherExceptionHandler() {
        return new graphql.execution.DataFetcherExceptionHandler() {
            @Override
            public java.util.concurrent.CompletableFuture<graphql.execution.DataFetcherExceptionHandlerResult> handleException(
                    graphql.execution.DataFetcherExceptionHandlerParameters handlerParameters) {

                Throwable exception = handlerParameters.getException();
                DataFetchingEnvironment environment = handlerParameters.getDataFetchingEnvironment();

                // Extract HttpServletRequest from GraphQL context
                HttpServletRequest request = environment.getGraphQlContext().get("httpServletRequest");

                if (request != null) {
                    UserContext userContext = AuthenticationFilter.getUserContext(request);
                    String fieldName = environment.getField().getName();

                    // Check if operation requires authentication
                    if (isProtectedOperation(fieldName) &&
                            (userContext == null || !userContext.isAuthenticated())) {

                        log.warn("Unauthorized GraphQL access attempt for field: {}", fieldName);
                        return java.util.concurrent.CompletableFuture.completedFuture(
                                graphql.execution.DataFetcherExceptionHandlerResult.newResult()
                                        .error(graphql.GraphqlErrorBuilder.newError()
                                                .message("Authentication required for this operation")
                                                .location(environment.getField().getSourceLocation())
                                                .build())
                                        .build());
                    }

                    // Check if operation requires admin role
                    if (isAdminOperation(fieldName) &&
                            (userContext == null || !userContext.hasRole("ADMIN"))) {

                        log.warn("Admin role required for GraphQL field: {}", fieldName);
                        return java.util.concurrent.CompletableFuture.completedFuture(
                                graphql.execution.DataFetcherExceptionHandlerResult.newResult()
                                        .error(graphql.GraphqlErrorBuilder.newError()
                                                .message("Admin role required for this operation")
                                                .location(environment.getField().getSourceLocation())
                                                .build())
                                        .build());
                    }
                }

                // For other exceptions, return the original error
                return java.util.concurrent.CompletableFuture.completedFuture(
                        graphql.execution.DataFetcherExceptionHandlerResult.newResult()
                                .error(graphql.GraphqlErrorBuilder.newError()
                                        .message(exception.getMessage())
                                        .build())
                                .build());
            }
        };
    }

    /**
     * Check if a GraphQL operation requires authentication
     */
    private boolean isProtectedOperation(String fieldName) {
        return PROTECTED_QUERIES.contains(fieldName) ||
                ADMIN_OPERATIONS.contains(fieldName);
    }

    /**
     * Check if a GraphQL operation requires admin role
     */
    private boolean isAdminOperation(String fieldName) {
        return ADMIN_OPERATIONS.contains(fieldName);
    }

    /**
     * Check if a GraphQL operation is public
     */
    private boolean isPublicOperation(String fieldName) {
        return PUBLIC_QUERIES.contains(fieldName);
    }
}
