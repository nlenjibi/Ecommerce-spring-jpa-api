package com.smart_ecomernce_api.smart_ecomernce_api.modules.user.service;

import com.querydsl.core.types.Predicate;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.dto.*;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface UserService {
    UserDto createUser(UserCreateRequest request);
    Optional<UserDto> getUserById(Long id);
    UserDto getUserByUsername(String username);
    UserDto getUserByEmail(String email);
    Page<UserDto> getAllUsers(Pageable pageable);
    UserDto updateUser(Long id, UserUpdateRequest request);
    void deleteUser(Long id);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    void changePassword(Long userId, ChangePasswordRequest request);
    LoginResponse login(UserLoginRequest request);
    UserDto updateUserRole(Long userId, UpdateUserRoleRequest request);
    UserDto updateUserStatus(Long userId, UserStatusRequest request);

    // Search and filter methods
    Page<UserDto> searchUsers(String keyword, Pageable pageable);
    Page<UserDto> filterUsersByRole(String role, Pageable pageable);
    Page<UserDto> filterUsersByIsActive( Pageable pageable);

    // Advanced querying with predicates
    Page<UserDto> findUsersWithPredicate(Predicate predicate, Pageable pageable);
}
