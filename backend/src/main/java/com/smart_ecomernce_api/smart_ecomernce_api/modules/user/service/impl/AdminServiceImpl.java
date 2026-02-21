package com.smart_ecomernce_api.smart_ecomernce_api.modules.user.service.impl;

import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.entity.PaymentStatus;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.repository.OrderRepository;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.entity.InventoryStatus;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.repository.ProductRepository;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.entity.AdminDashboardDto;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.repository.UserRepository;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    /**
     * Get dashboard statistics
     */
    @Cacheable(value = "admin-dashboard", key = "'stats'")
    public AdminDashboardDto getDashboardStats() {
        log.info("Calculating dashboard statistics");

        long lowStockProducts = productRepository.countByInventoryStatusAndIsActiveTrue(
            InventoryStatus.LOW_STOCK);

        return AdminDashboardDto.builder()
                .totalUsers(userRepository.count())
                .totalOrders(orderRepository.count())
                .totalProducts(productRepository.count())
                .totalRevenue(calculateTotalRevenue())
                .pendingOrders(orderRepository.countByPaymentStatusAndIsActiveTrue(PaymentStatus.PENDING))
                .activeUsers(userRepository.countActiveUsers())
                .lowStockProducts(lowStockProducts)
                .build();
    }

    /**
     * Calculate total revenue
     */

    private BigDecimal calculateTotalRevenue() {
        BigDecimal revenue = orderRepository.calculateTotalRevenue();
        return revenue != null ? revenue : BigDecimal.ZERO;
    }

    /**
     * Clear dashboard cache periodically (every 5 minutes)
     */
    @CacheEvict(value = "admin-dashboard", allEntries = true)
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void clearDashboardCache() {
        log.debug("Clearing admin dashboard cache");
    }
}
