package com.smart_ecomernce_api.smart_ecomernce_api.modules.user.controller;

import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.entity.AdminDashboardDto;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.service.AdminService;
import com.smart_ecomernce_api.smart_ecomernce_api.security.annotation.RequestValidation;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin management endpoints.
 * Class-level @RequestValidation(roles = {"ADMIN"}) applies to every method.
 */
@RestController
@RequestMapping("v1/admin")
@RequiredArgsConstructor
@Slf4j
@RequestValidation(roles = {"ADMIN"})
@Tag(name = "Admin", description = "Admin management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<AdminDashboardDto> getDashboard() {
        log.info("Fetching admin dashboard");
        return ResponseEntity.ok(adminService.getDashboardStats());
    }
}