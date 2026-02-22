package com.smart_ecomernce_api.smart_ecomernce_api.modules.order.controller;

import com.smart_ecomernce_api.smart_ecomernce_api.common.response.ApiResponse;
import com.smart_ecomernce_api.smart_ecomernce_api.common.response.PaginatedResponse;
import com.smart_ecomernce_api.smart_ecomernce_api.graphql.input.OrderFilterInput;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.dto.OrderCreateRequest;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.dto.CartOrderRequest;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.dto.OrderResponse;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.dto.OrderStatsResponse;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.dto.OrderUpdateRequest;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.entity.OrderStatus;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.entity.PaymentStatus;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.service.OrderService;
import com.smart_ecomernce_api.smart_ecomernce_api.security.annotation.RequestValidation;
import com.smart_ecomernce_api.smart_ecomernce_api.security.filter.AuthenticationFilter;
import jakarta.servlet.http.HttpServletRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * REST controller for order management.
 *
 * <p>Route layout:
 * <pre>
 *   /v1/orders                     — customer: create, get own orders
 *   /v1/orders/admin/**            — admin: full CRUD, status transitions, search
 * </pre>
 *
 * never accepted as a plain request parameter.
 */
@RestController
@RequestMapping("v1/orders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Orders", description = "Order management endpoints")
public class OrderController {

    private final OrderService orderService;

    // =========================================================================
    // Customer — create & read
    // =========================================================================


    @PostMapping("/from-cart/{cartId}")
    @Operation(
            summary   = "Create order from cart (checkout)",
            description = "Converts the specified cart into an order. Items, totals, and " +
                    "coupon data are read directly from the cart. Shipping and payment " +
                    "details are optional and can be supplied in the request body."
    )
    public ResponseEntity<ApiResponse<OrderResponse>> createOrderFromCart(
            @PathVariable Long cartId,
            @RequestBody(required = false) CartOrderRequest request,
            HttpServletRequest httpRequest) {

        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        log.info("POST /v1/orders/from-cart/{} — user={}", cartId, userId);

        // request may be null if the client sends no body at all; service handles null safely
        OrderResponse response = orderService.createOrderFromCart(cartId, userId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created from cart successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get own order by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getOrderById(id, userId)));
    }

    @GetMapping("/number/{orderNumber}")
    @Operation(summary = "Get own order by order number")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByNumber(
            @PathVariable String orderNumber,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getOrderByOrderNumber(orderNumber, userId)));
    }

    // =========================================================================
    // Customer — actions
    // =========================================================================

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel own order")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            @RequestParam String reason,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        log.info("PUT /v1/orders/{}/cancel — user={}", id, userId);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully",
                orderService.cancelOrder(id, reason, userId)));
    }

    @PutMapping("/customer/{id}")
    @RequestValidation(roles = {"USER"})
    @Operation(summary = "Update order (Customer, only if status is PENDING)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderAsCustomer(
            @PathVariable Long id,
            @Valid @RequestBody OrderUpdateRequest request,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Order updated successfully",
                orderService.updateOrderAsCustomer(id, request, userId)));
    }

    // =========================================================================
    // Customer — Edit Order Items (Pending Orders)
    // =========================================================================

    @PostMapping("/{id}/items")
    @Operation(summary = "Add item to pending order")
    public ResponseEntity<ApiResponse<OrderResponse>> addItemToOrder(
            @PathVariable Long id,
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") Integer quantity,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Item added to order",
                orderService.addItemToOrder(id, productId, quantity, userId)));
    }

    @DeleteMapping("/{id}/items/{productId}")
    @Operation(summary = "Remove item from pending order")
    public ResponseEntity<ApiResponse<OrderResponse>> removeItemFromOrder(
            @PathVariable Long id,
            @PathVariable Long productId,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Item removed from order",
                orderService.removeItemFromOrder(id, productId, userId)));
    }

    @PutMapping("/{id}/items/{productId}")
    @Operation(summary = "Update item quantity in pending order")
    public ResponseEntity<ApiResponse<OrderResponse>> updateItemQuantity(
            @PathVariable Long id,
            @PathVariable Long productId,
            @RequestParam Integer quantity,
            HttpServletRequest httpRequest) {
        Long userId = AuthenticationFilter.getCurrentUserId(httpRequest);
        return ResponseEntity.ok(ApiResponse.success("Item quantity updated",
                orderService.updateItemQuantity(id, productId, quantity, userId)));
    }

    // =========================================================================
    // Unified Get Orders (Admin & Customer)
    // =========================================================================

    @GetMapping
    @Operation(summary = "Get orders (Admin or Customer)")
    public ResponseEntity<ApiResponse<PaginatedResponse<OrderResponse>>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "DESC") Sort.Direction direction,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) String orderNumber,
            @RequestParam(required = false) String customerEmail,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) Boolean highValue,
            @RequestParam(required = false) Boolean overdue,
            HttpServletRequest httpRequest) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        String role = AuthenticationFilter.getCurrentUserRole(httpRequest); // Use available method for single role
        boolean isAdmin = "ADMIN".equals(role) || "MANAGER".equals(role);
        Long currentUserId = AuthenticationFilter.getCurrentUserId(httpRequest);

        // If not admin, restrict to own orders
        if (!isAdmin) {
            userId = currentUserId;
        }

        OrderFilterInput filter = new OrderFilterInput();
        filter.setStatus(status != null ? status.name() : null);
        filter.setUserId(userId);
        filter.setMinAmount(minAmount);
        filter.setMaxAmount(maxAmount);
        filter.setStartDate(startDate);
        filter.setEndDate(endDate);
        filter.setOrderNumber(orderNumber);
        filter.setCustomerEmail(customerEmail);
        filter.setHighValue(highValue);
        filter.setOverdue(overdue);
        filter.setIsActive(true);
        // If OrderFilterInput supports paymentStatus, set it here:
        // filter.setPaymentStatus(paymentStatus != null ? paymentStatus.name() : null);

        Page<OrderResponse> orders = orderService.getFilteredOrders(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(PaginatedResponse.from(orders)));
    }

    // =========================================================================
    // Statistics and Count Endpoints
    // =========================================================================

    @GetMapping("/admin/statistics")
    @Operation(summary = "Get order statistics (Admin)")
    public ResponseEntity<ApiResponse<OrderStatsResponse>> getStatistics() {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderStatistics()));
    }

    @GetMapping("/admin/count/user/{userId}")
    @Operation(summary = "Count orders for user (Admin)")
    public ResponseEntity<ApiResponse<Long>> countOrdersByUser(@PathVariable Long userId) {
        long count = orderService.countByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Order count retrieved successfully", count));
    }

    @GetMapping("/admin/count/status/{status}")
    @Operation(summary = "Count orders by status (Admin)")
    public ResponseEntity<ApiResponse<Long>> countOrdersByStatus(@PathVariable OrderStatus status) {
        long count = orderService.countByStatus(status);
        return ResponseEntity.ok(ApiResponse.success("Order count retrieved successfully", count));
    }

    @GetMapping("/admin/exists/{orderId}")
    @Operation(summary = "Check if order exists and is active (Admin)")
    public ResponseEntity<ApiResponse<Boolean>> orderExists(@PathVariable Long orderId) {
        boolean exists = orderService.existsByIdAndActive(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order existence checked successfully", exists));
    }

    // =========================================================================
    // Admin — status transitions
    // =========================================================================

    @PutMapping("/admin/{id}/confirm")
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    @Operation(summary = "Confirm order (Admin)")
    public ResponseEntity<ApiResponse<OrderResponse>> confirmOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order confirmed",
                orderService.confirmOrder(id)));
    }

    @PutMapping("/admin/{id}/process")
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    @Operation(
            summary     = "Process order (Admin)",
            description = "Transitions a CONFIRMED order to PROCESSING status. " +
                    "Throws 400 if the order is not currently CONFIRMED."
    )
    public ResponseEntity<ApiResponse<OrderResponse>> processOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order is now being processed",
                orderService.processOrder(id)));
    }


    @PutMapping("/admin/{id}/out-for-delivery")
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    @Operation(
            summary     = "Mark order as out for delivery (Admin)",
            description = "Transitions a SHIPPED order to OUT_FOR_DELIVERY status. " +
                    "Throws 400 if the order is not currently SHIPPED."
    )
    public ResponseEntity<ApiResponse<OrderResponse>> outForDeliveryOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order is out for delivery",
                orderService.outForDeliveryOrder(id)));
    }

    @PutMapping("/admin/{id}/ship")
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    @Operation(summary = "Ship order (Admin)")
    public ResponseEntity<ApiResponse<OrderResponse>> shipOrder(
            @PathVariable Long id,
            @RequestParam String trackingNumber,
            @RequestParam(required = false) String carrier) {

        return ResponseEntity.ok(ApiResponse.success("Order shipped",
                orderService.shipOrder(id, trackingNumber, carrier)));
    }

    @PutMapping("/admin/{id}/deliver")
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    @Operation(summary = "Mark order as delivered (Admin)")

    public ResponseEntity<ApiResponse<OrderResponse>> deliverOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order delivered",
                orderService.deliverOrder(id)));
    }

    @PutMapping("/admin/{id}/refund")
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    @Operation(summary = "Refund order (Admin)")
    public ResponseEntity<ApiResponse<OrderResponse>> refundOrder(
            @PathVariable Long id,
            @RequestParam BigDecimal amount,
            @RequestParam String reason) {

        return ResponseEntity.ok(ApiResponse.success("Order refunded",
                orderService.refundOrder(id, amount, reason)));
    }

    // =========================================================================
    // Admin — generic update
    // =========================================================================

    @PutMapping("/admin/{id}")
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    @Operation(summary = "Update order (Admin)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrder(
            @PathVariable Long id,
            @Valid @RequestBody OrderUpdateRequest request
    ) {

        return ResponseEntity.ok(ApiResponse.success("Order updated successfully",
                orderService.updateOrderStatus(id, request)));
    }

    @PatchMapping("/admin/{id}/status")
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    @Operation(summary = "Update order status (Admin)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status
    ) {

        OrderUpdateRequest req = OrderUpdateRequest.builder().status(status).build();
        return ResponseEntity.ok(ApiResponse.success("Order status updated",
                orderService.updateOrderStatus(id, req)));
    }

    @PutMapping("/admin/{id}/payment-status")
    @RequestValidation(roles = {"ADMIN", "MANAGER"}) @Operation(summary = "Update payment status (Admin)")
    public ResponseEntity<ApiResponse<OrderResponse>> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam PaymentStatus status) {

        return ResponseEntity.ok(ApiResponse.success("Payment status updated",
                orderService.updatePaymentStatus(id, status.name())));
    }

    // =========================================================================
    // Admin — delete
    // =========================================================================

    @DeleteMapping("/{orderId}")
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    @Operation(summary = "Delete order by ID")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order deleted successfully", null));
    }
}