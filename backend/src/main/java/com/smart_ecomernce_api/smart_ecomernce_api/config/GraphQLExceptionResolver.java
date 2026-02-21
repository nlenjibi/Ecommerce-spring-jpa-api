package com.smart_ecomernce_api.smart_ecomernce_api.config;

import com.smart_ecomernce_api.smart_ecomernce_api.exception.*;
import graphql.ErrorType;
import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;
import org.springframework.stereotype.Component;

import javax.naming.AuthenticationException;

/**
 * GraphQL Exception Resolver
 * 
 * This class handles exceptions from GraphQL resolvers and converts them
 * to proper GraphQL errors that will be sent to the frontend.
 * 
 * This ensures backend errors are properly shown to the frontend in the
 * dual REST/GraphQL API strategy.
 */
@Slf4j
@Component
public class GraphQLExceptionResolver extends DataFetcherExceptionResolverAdapter {

    @Override
    protected GraphQLError resolveToSingleError(Throwable ex, DataFetchingEnvironment env) {
        log.error("GraphQL error in {}: {}", env.getExecutionStepInfo().getPath(), ex.getMessage());

        // Handle specific exception types and convert to GraphQL errors
        if (ex instanceof ResourceNotFoundException) {
            return GraphqlErrorBuilder.newError()
                    .errorType(ErrorType.DataFetchingException)
                    .message(ex.getMessage())
                    .path(env.getExecutionStepInfo().getPath())
                    .location(env.getField().getSourceLocation())
                    .build();
        }

        if (ex instanceof BadRequestException || ex instanceof ValidationException || ex instanceof InvalidDataException) {
            return GraphqlErrorBuilder.newError()
                    .errorType(ErrorType.ValidationError)
                    .message(ex.getMessage())
                    .path(env.getExecutionStepInfo().getPath())
                    .location(env.getField().getSourceLocation())
                    .build();
        }

        if (ex instanceof AuthenticationException || ex instanceof TokenNotFoundException || ex instanceof TokenExpiredException) {
            return GraphqlErrorBuilder.newError()
                    .errorType(ErrorType.ValidationError)
                    .message("Authentication required: " + ex.getMessage())
                    .path(env.getExecutionStepInfo().getPath())
                    .location(env.getField().getSourceLocation())
                    .build();
        }

        if (ex instanceof AuthorizationException) {
            return GraphqlErrorBuilder.newError()
                    .errorType(ErrorType.ValidationError)
                    .message("Access denied: " + ex.getMessage())
                    .path(env.getExecutionStepInfo().getPath())
                    .location(env.getField().getSourceLocation())
                    .build();
        }

        if (ex instanceof DuplicateResourceException) {
            return GraphqlErrorBuilder.newError()
                    .errorType(ErrorType.ExecutionAborted)
                    .message(ex.getMessage())
                    .path(env.getExecutionStepInfo().getPath())
                    .location(env.getField().getSourceLocation())
                    .build();
        }

        if (ex instanceof RateLimitExceededException) {
            return GraphqlErrorBuilder.newError()
                    .errorType(ErrorType.ExecutionAborted)
                    .message("Rate limit exceeded: " + ex.getMessage())
                    .path(env.getExecutionStepInfo().getPath())
                    .location(env.getField().getSourceLocation())
                    .build();
        }

        if (ex instanceof InsufficientStockException) {
            return GraphqlErrorBuilder.newError()
                    .errorType(ErrorType.ExecutionAborted)
                    .message("Insufficient stock: " + ex.getMessage())
                    .path(env.getExecutionStepInfo().getPath())
                    .location(env.getField().getSourceLocation())
                    .build();
        }

        if (ex instanceof BusinessRuleViolationException) {
            return GraphqlErrorBuilder.newError()
                    .errorType(ErrorType.ExecutionAborted)
                    .message("Business rule violation: " + ex.getMessage())
                    .path(env.getExecutionStepInfo().getPath())
                    .location(env.getField().getSourceLocation())
                    .build();
        }

        // Default: internal server error
        return GraphqlErrorBuilder.newError()
                .errorType(ErrorType.DataFetchingException)
                .message("Internal server error: " + ex.getMessage())
                .path(env.getExecutionStepInfo().getPath())
                .location(env.getField().getSourceLocation())
                .build();
    }
}
