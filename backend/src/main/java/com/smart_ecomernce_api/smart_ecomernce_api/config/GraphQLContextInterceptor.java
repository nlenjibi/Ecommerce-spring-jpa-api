package com.smart_ecomernce_api.smart_ecomernce_api.config;

import com.smart_ecomernce_api.smart_ecomernce_api.security.TokenStore;
import com.smart_ecomernce_api.smart_ecomernce_api.security.UserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.server.WebGraphQlInterceptor;
import org.springframework.graphql.server.WebGraphQlRequest;
import org.springframework.graphql.server.WebGraphQlResponse;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * GraphQL Context Interceptor
 * 
 * This interceptor extracts the authenticated user's ID from the JWT token
 * and adds it to the GraphQL context so it can be accessed via @ContextValue
 * in GraphQL resolvers.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class GraphQLContextInterceptor implements WebGraphQlInterceptor {

    private final TokenStore tokenStore;

    @Override
    public Mono<WebGraphQlResponse> intercept(WebGraphQlRequest request, Chain chain) {
        
        log.debug("GraphQL interceptor called");
        
        // Get the Authorization header from the request
        List<String> authHeaders = request.getHeaders().get("Authorization");
        String authHeader = authHeaders != null && !authHeaders.isEmpty() ? authHeaders.get(0) : null;
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            UserContext userContext = tokenStore.getUser(token);
            if (userContext != null && userContext.isAuthenticated()) {
                Long userId = userContext.getUserId();
                log.debug("GraphQL request authenticated for userId: {}", userId);
                
                // Add userId to GraphQL context
                request.configureExecutionInput((executionInput, builder) -> {
                    return builder.graphQLContext(contextBuilder -> {
                        contextBuilder.put("userId", userId);
                        // Also put the userContext for security checks
                        contextBuilder.put("userContext", userContext);
                    }).build();
                });
            }
        }

        return chain.next(request);
    }
}
