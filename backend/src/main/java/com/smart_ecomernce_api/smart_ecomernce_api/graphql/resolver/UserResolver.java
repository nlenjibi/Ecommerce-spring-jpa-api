package com.smart_ecomernce_api.smart_ecomernce_api.graphql.resolver;

import com.smart_ecomernce_api.smart_ecomernce_api.common.predicate.UserPredicates;
import com.smart_ecomernce_api.smart_ecomernce_api.common.response.PaginatedResponse;
import com.smart_ecomernce_api.smart_ecomernce_api.graphql.dto.UserResponceDto;
import com.smart_ecomernce_api.smart_ecomernce_api.graphql.input.PageInput;
import com.smart_ecomernce_api.smart_ecomernce_api.graphql.input.SortDirection;
import com.smart_ecomernce_api.smart_ecomernce_api.graphql.input.UserFilterInput;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.dto.ProductResponse;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.dto.UserCreateRequest;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.dto.UserDto;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.dto.UserUpdateRequest;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.entity.AdminDashboardDto;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.entity.Role;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.service.AdminService;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.service.UserService;
import com.querydsl.core.types.Predicate;
import com.smart_ecomernce_api.smart_ecomernce_api.security.annotation.RequestValidation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.ContextValue;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
@Slf4j
public class UserResolver {

    private final UserService userService;
    private final AdminService adminService;

    @QueryMapping
    @RequestValidation
    public UserDto user(@Argument Long id) {
        log.info("GraphQL Query: user(id: {})", id);
        return userService.getUserById(id).orElse(null);
    }

    @QueryMapping
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    public UserResponceDto users(@Argument PageInput pagination, @Argument UserFilterInput filter) {
        log.info("GraphQL Query: users");
        Pageable pageable = createPageable(pagination);

        Page<UserDto> userPage;
        if (filter != null) {
            // Build predicate for advanced filtering
            Predicate predicate = buildPredicateFromFilter(filter);
            userPage = userService.findUsersWithPredicate(predicate, pageable);
        } else {
            userPage = userService.getAllUsers(pageable);
        }

        return UserResponceDto.builder()
                .content(userPage.getContent())
                .pageInfo(PaginatedResponse.from(userPage))
                .build();
    }

    @QueryMapping
    @RequestValidation
    public UserDto currentUser(@ContextValue Long userId) {
        log.info("GraphQL Query: currentUser for user {}", userId);
        return userService.getUserById(userId).orElse(null);
    }

    @QueryMapping
    @RequestValidation(roles = {"ADMIN"})
    public AdminDashboardDto adminDashboard() {
        log.info("GraphQL Query: adminDashboard");
        return adminService.getDashboardStats();
    }

    @MutationMapping
    @RequestValidation(roles = {"ADMIN"})
    public UserDto createUser(@Argument UserCreateRequest input) {
        log.info("GraphQL Mutation: createUser");
        return userService.createUser(input);
    }

    @MutationMapping
    @RequestValidation(roles = {"ADMIN"})
    public UserDto updateUser(@Argument Long id, @Argument UserUpdateRequest input) {
        log.info("GraphQL Mutation: updateUser(id: {})", id);
        return userService.updateUser(id, input);
    }

    @MutationMapping
    @RequestValidation(roles = {"ADMIN"})
    public Boolean deleteUser(@Argument Long id) {
        log.info("GraphQL Mutation: deleteUser(id: {})", id);
        userService.deleteUser(id);
        return true;
    }

    private Pageable createPageable(PageInput input) {
        if (input == null) {
            return PageRequest.of(0, 20, Sort.by("id"));
        }
        Sort sort = input.getDirection() == SortDirection.DESC
                ? Sort.by(input.getSortBy()).descending()
                : Sort.by(input.getSortBy()).ascending();
        return PageRequest.of(input.getPage(), input.getSize(), sort);
    }

    private Predicate buildPredicateFromFilter(UserFilterInput filter) {
        UserPredicates predicates = UserPredicates.builder()
                .withSearch(filter.getSearch())
                .withRole(filter.getRole())
                .withActive(filter.getActive())
                .withEmailVerified(filter.getEmailVerified())
                .withCreatedAfter(filter.getCreatedAfter())
                .withCreatedBefore(filter.getCreatedBefore())
                .withPhoneNumberContaining(filter.getPhoneNumber())
                .withNameContaining(filter.getName());

        return predicates.build();
    }
}