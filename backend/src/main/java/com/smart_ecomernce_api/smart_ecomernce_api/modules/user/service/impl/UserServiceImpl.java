package com.smart_ecomernce_api.smart_ecomernce_api.modules.user.service.impl;


import com.smart_ecomernce_api.smart_ecomernce_api.common.utils.SecurityUtils;
import com.smart_ecomernce_api.smart_ecomernce_api.exception.DuplicateResourceException;
import com.smart_ecomernce_api.smart_ecomernce_api.exception.ResourceNotFoundException;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.dto.*;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.entity.Role;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.entity.User;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.mapper.UserMapper;

import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.repository.UserRepository;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.service.UserService;
import com.smart_ecomernce_api.smart_ecomernce_api.security.AuthenticationService;
import com.smart_ecomernce_api.smart_ecomernce_api.security.UserContext;
import com.smart_ecomernce_api.smart_ecomernce_api.security.filter.AuthenticationFilter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Optional;
import java.util.UUID;
@Slf4j
@AllArgsConstructor
@Service
public class UserServiceImpl implements UserService {
    private final UserMapper userMapper;

    private final UserRepository userRepository;
    private final AuthenticationService authenticationService;

    private boolean isAdmin(UserContext userContext) {
        return userContext != null && userContext.isAuthenticated() && userContext.hasRole("ADMIN");
    }

    // Helper method to check if user is self or admin
    private void checkSelfOrAdmin(UserContext userContext, Long targetUserId) {
        if (!isAdmin(userContext) && (userContext == null || !userContext.isAuthenticated() || !userContext.getUserId().equals(targetUserId))) {
            throw new SecurityException("Not authorized");
        }
    }

    // Read per-request auth context attached by AuthenticationFilter.
    private UserContext getCurrentUserContext() {
        try {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) {
                return UserContext.unauthenticated();
            }
            HttpServletRequest request = attributes.getRequest();
            UserContext context = AuthenticationFilter.getUserContext(request);
            return context != null ? context : UserContext.unauthenticated();
        } catch (Exception ex) {
            log.debug("Could not resolve request user context", ex);
            return UserContext.unauthenticated();
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = {
            "users",
            "users-page",
            "users-search",
            "users-role",
            "users-active",
            "users-predicate",
            "admin-dashboard"
    }, allEntries = true)
    public UserDto createUser(UserCreateRequest request) {
        return createUser(request, getCurrentUserContext());
    }

    // Internal method with context
    public UserDto createUser(UserCreateRequest request, UserContext userContext) {
        // Only admins can create users with roles other than USER
        if (request.getRole() != null && !request.getRole().isBlank() && !request.getRole().equalsIgnoreCase("USER")) {
            if (!isAdmin(userContext)) {
                throw new SecurityException("Only admins can assign roles");
            }
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already exists: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }


        var user = userMapper.toEntity(request);
        var hashPassword= SecurityUtils.hashPassword(user.getPassword());
        user.setPassword(hashPassword);
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                Role newRole = Role.valueOf(request.getRole().toUpperCase());
                user.setRole(newRole);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid role: " + request.getRole());
            }
        } else {
            user.setRole(Role.USER);
        }
        userRepository.save(user);

        log.info("User created with id: {}", user.getId());

        return userMapper.toDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "users", key = "#id")
    public Optional<UserDto> getUserById(Long id) {

        var user= userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return Optional.of(userMapper.toDto(user));
    }

    @Transactional(readOnly = true)
    @Override
    @Cacheable(value = "users", key = "#username")
    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUsernameAndIsActiveTrue(username)
                .orElseThrow(() -> ResourceNotFoundException.forResource("User", "username: " + username));
        return userMapper.toDto(user);
    }

    @Transactional(readOnly = true)
    @Override
    @Cacheable(value = "users", key = "#email")
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> ResourceNotFoundException.forResource("User", "email: " + email));
        return userMapper.toDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "users-page", key = "T(org.springframework.util.DigestUtils).md5DigestAsHex(('#page=' + #pageable.pageNumber + '&size=' + #pageable.pageSize + '&sort=' + #pageable.sort).getBytes())")
    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(userMapper::toDto);
    }

    @Override
    @Caching(
            evict = {
                    @CacheEvict(value = "users", allEntries = true),
                    @CacheEvict(value = "users-page", allEntries = true),
                    @CacheEvict(value = "users-search", allEntries = true),
                    @CacheEvict(value = "users-role", allEntries = true),
                    @CacheEvict(value = "users-active", allEntries = true),
                    @CacheEvict(value = "users-predicate", allEntries = true),
                    @CacheEvict(value = "admin-dashboard", allEntries = true)
            }
    )
    public UserDto updateUser(Long userId, UserUpdateRequest request) {
        return updateUser(userId, request, getCurrentUserContext());
    }
    public UserDto updateUser(Long userId, UserUpdateRequest request, UserContext userContext) {
        checkSelfOrAdmin(userContext, userId);
        var user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        userMapper.updateEntity(user, request);

        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                Role newRole = Role.valueOf(request.getRole().toUpperCase());
                user.setRole(newRole);
            } catch (IllegalArgumentException e) {
                // Handle invalid role string
                log.warn("Invalid role provided for user update: {}", request.getRole());
            }
        }

        userRepository.save(user);
        log.info("User updated with id: {}", userId);

        return userMapper.toDto(user);

    }

    @Override
    @Transactional
    @Caching(
            evict = {
                    @CacheEvict(value = "users", allEntries = true),
                    @CacheEvict(value = "users-page", allEntries = true),
                    @CacheEvict(value = "users-search", allEntries = true),
                    @CacheEvict(value = "users-role", allEntries = true),
                    @CacheEvict(value = "users-active", allEntries = true),
                    @CacheEvict(value = "users-predicate", allEntries = true),
                    @CacheEvict(value = "admin-dashboard", allEntries = true)
            }
    )
    public void deleteUser(Long id) {
        deleteUser(id, getCurrentUserContext());
    }
    public void deleteUser(Long id, UserContext userContext) {
        checkSelfOrAdmin(userContext, id);
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
        authenticationService.logoutAllSessions(id);
        log.info("User deleted with id: {}", id);
    }

    @Caching(
            evict = {
                    @CacheEvict(value = "users", key = "#userId"),
                    @CacheEvict(value = "admin-dashboard", allEntries = true)
            }
    )
    public void changePassword(Long userId, ChangePasswordRequest request) {
        changePassword(userId, request, getCurrentUserContext());
    }
    public void changePassword(Long userId, ChangePasswordRequest request, UserContext userContext) {
        checkSelfOrAdmin(userContext, userId);
        var user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        if (!SecurityUtils.verifyPassword(request.getOldPassword(), user.getPassword())) {
            throw new ResourceNotFoundException("Password does not match");
        }
        var hashPassword = SecurityUtils.hashPassword(request.getNewPassword());
        user.setPassword(hashPassword);
        userRepository.save(user);
        authenticationService.logoutAllSessions(userId);
        log.info("Password changed for user with id: {}", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(UserLoginRequest request) {
        User user;
        if (request.getUsernameOrEmail() != null && request.getUsernameOrEmail().contains("@")) {
            user = userRepository.findByEmailAndIsActiveTrue(request.getUsernameOrEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Invalid credentials"));
        } else {
            user = userRepository.findByUsernameAndIsActiveTrue(request.getUsernameOrEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Invalid credentials"));
        }

        if (user.getIsActive() != null && !user.getIsActive()) {
            throw new ResourceNotFoundException("User account is inactive");
        }

        if (!SecurityUtils.verifyPassword(request.getPassword(), user.getPassword())) {
            throw new ResourceNotFoundException("Invalid credentials");
        }

        String sessionToken = authenticationService.generateToken(user.getId(), user.getRole().name());
        UserDto userDto = userMapper.toDto(user);
        return LoginResponse.builder()
                .id(userDto.getId())
                .username(userDto.getUsername())
                .email(userDto.getEmail())
                .firstName(userDto.getFirstName())
                .lastName(userDto.getLastName())
                .phoneNumber(userDto.getPhoneNumber())
                .role(userDto.getRole())
                .isActive(userDto.getIsActive())
                .createdAt(userDto.getCreatedAt())
                .updatedAt(userDto.getUpdatedAt())
                .sessionToken(sessionToken)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "users", key = "#username")
    public Optional<User> findByUsername(String username) {
        return Optional.ofNullable(userRepository.findByUsername(username)
                .orElseThrow(() -> ResourceNotFoundException.forResource("User", "username: " + username)));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "users", key = "#email")
    public Optional<User> findByEmail(String email) {

        return Optional.ofNullable(userRepository.findByEmail(email)
                .orElseThrow(() -> ResourceNotFoundException.forResource("User", "email: " + email)));

    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {

        return userRepository.existsByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String username) {
        return userRepository.existsByEmail(username);
    }

    @Override
    @Transactional
    @Caching(
            evict = {
                    @CacheEvict(value = "users", allEntries = true),
                    @CacheEvict(value = "users-page", allEntries = true),
                    @CacheEvict(value = "users-search", allEntries = true),
                    @CacheEvict(value = "users-role", allEntries = true),
                    @CacheEvict(value = "users-active", allEntries = true),
                    @CacheEvict(value = "users-predicate", allEntries = true),
                    @CacheEvict(value = "admin-dashboard", allEntries = true)
            }
    )
    public UserDto updateUserRole(Long userId, UpdateUserRoleRequest request) {
        // Fetch user with addresses eagerly loaded to avoid LazyInitializationException
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                Role newRole = Role.valueOf(request.getRole().toUpperCase());
                user.setRole(newRole);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid role provided for user update: {}", request.getRole());
            }
        }

        userRepository.save(user);
        log.info("User role updated for user with id: {}", userId);

        return userMapper.toDto(user);
    }

    @Override
    @Transactional
    @Caching(
            evict = {
                    @CacheEvict(value = "users", allEntries = true),
                    @CacheEvict(value = "users-page", allEntries = true),
                    @CacheEvict(value = "users-search", allEntries = true),
                    @CacheEvict(value = "users-role", allEntries = true),
                    @CacheEvict(value = "users-active", allEntries = true),
                    @CacheEvict(value = "users-predicate", allEntries = true),
                    @CacheEvict(value = "admin-dashboard", allEntries = true)
            }
    )
    public UserDto updateUserStatus(Long userId, UserStatusRequest request) {
        return updateUserStatus(userId, request, getCurrentUserContext());
    }

    public UserDto updateUserStatus(Long userId, UserStatusRequest request, UserContext userContext) {
        checkSelfOrAdmin(userContext, userId);
        if (request.getIsActive() == null) {
            throw new IllegalArgumentException("isActive is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setIsActive(request.getIsActive());
        userRepository.save(user);

        if (Boolean.FALSE.equals(request.getIsActive())) {
            authenticationService.logoutAllSessions(userId);
        }

        log.info("User status updated for user with id: {} to isActive={}", userId, request.getIsActive());
        return userMapper.toDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "users-search", key = "T(org.springframework.util.DigestUtils).md5DigestAsHex(('#keyword=' + #keyword + '&page=' + #pageable.pageNumber + '&size=' + #pageable.pageSize + '&sort=' + #pageable.sort).getBytes())")
    public Page<UserDto> searchUsers(String keyword, Pageable pageable) {
        return userRepository.searchUsers(keyword, pageable)
                .map(userMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "users-role", key = "T(org.springframework.util.DigestUtils).md5DigestAsHex(('#role=' + #role + '&page=' + #pageable.pageNumber + '&size=' + #pageable.pageSize + '&sort=' + #pageable.sort).getBytes())")
    public Page<UserDto> filterUsersByRole(String role, Pageable pageable) {
        return userRepository.findByRole(role, pageable)
                .map(userMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "users-active", key = "T(org.springframework.util.DigestUtils).md5DigestAsHex(('#active=' + #isActive + '&page=' + #pageable.pageNumber + '&size=' + #pageable.pageSize + '&sort=' + #pageable.sort).getBytes())")
    public Page<UserDto> filterUsersByIsActive(Pageable pageable) {
        return userRepository.findByIsActiveTrue(pageable)
                .map(userMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "users-predicate", key = "T(org.springframework.util.DigestUtils).md5DigestAsHex(('#predicate=' + #predicate.toString() + '&page=' + #pageable.pageNumber + '&size=' + #pageable.pageSize + '&sort=' + #pageable.sort).getBytes())")
    public Page<UserDto> findUsersWithPredicate(com.querydsl.core.types.Predicate predicate, Pageable pageable) {
        return userRepository.findAll(predicate, pageable)
                .map(userMapper::toDto);
    }
}
