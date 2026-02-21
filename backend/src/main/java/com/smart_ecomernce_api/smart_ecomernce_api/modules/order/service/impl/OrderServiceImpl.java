package com.smart_ecomernce_api.smart_ecomernce_api.modules.order.service.impl;

import com.querydsl.core.types.Predicate;

import com.smart_ecomernce_api.smart_ecomernce_api.common.predicate.OrderPredicates;
import com.smart_ecomernce_api.smart_ecomernce_api.exception.ResourceNotFoundException;
import com.smart_ecomernce_api.smart_ecomernce_api.exception.UnauthorizedException;
import com.smart_ecomernce_api.smart_ecomernce_api.graphql.input.OrderFilterInput;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.dto.OrderCreateRequest;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.dto.OrderResponse;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.dto.OrderStatsResponse;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.dto.OrderUpdateRequest;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.entity.Order;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.entity.OrderItem;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.entity.OrderStats;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.entity.OrderStatus;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.entity.PaymentStatus;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.mapper.OrderMapper;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.cart.entity.Cart;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.cart.repository.CartRepository;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.dto.CartOrderRequest;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.repository.OrderRepository;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.service.OrderService;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.entity.Product;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.repository.ProductRepository;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.entity.User;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Primary implementation of {@link OrderService}.
 *
 * <p>Transaction strategy:
 * <ul>
 *   <li>Class-level {@code @Transactional(readOnly = true)} for all reads —
 *       reduces lock contention and enables Hibernate read-optimisations.</li>
 *   <li>Each mutating method overrides with {@code @Transactional} (readOnly = false).</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository  userRepository;
    private final OrderMapper     orderMapper;
    private final ProductRepository productRepository;
    private final CartRepository  cartRepository;

    // =========================================================================
    // CREATE
    // =========================================================================

    @Override
    @Transactional
    @CacheEvict(value = {
            "orders",
            "orders-predicate",
            "orders-search",
            "orders-filter",
            "order-stats",
            "user-orders",
            "order-counts"
    }, allEntries = true)
    public OrderResponse createOrder(OrderCreateRequest request, Long userId) {
        User user = findUserOrThrow(userId);

        // Build order — orderNumber is intentionally omitted here.
        // The @PrePersist hook on Order calls generateOrderNumber() (format: ORD-YYYYMMDD-XXXXXX)
        // when the field is blank, so there is a single, consistent generation path.
        Order order = Order.builder()
                .user(user)
                .customerEmail(request.getCustomerEmail())
                .customerName(request.getCustomerName())
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .shippingMethod(request.getShippingMethod())
                .paymentMethod(request.getPaymentMethod())
                .shippingAddress(request.getShippingAddress())
                .customerNotes(request.getCustomerNotes())
                .couponCode(request.getCouponCode())
                .build();

        // Debug: Log incoming items
        log.info("Creating order with {} items", request.getItems() != null ? request.getItems().size() : 0);
        if (request.getItems() != null) {
            request.getItems().forEach(item ->
                    log.info("  - Item: productId={}, quantity={}", item.getProductId(), item.getQuantity())
            );
        }

        // Create order items from request
        if (request.getItems() != null) {
            for (var itemReq : request.getItems()) {
                try {
                    log.info("Processing item: productId={}, quantity={}", itemReq.getProductId(), itemReq.getQuantity());
                    var product = productRepository.findById(itemReq.getProductId())
                            .orElseThrow(() -> ResourceNotFoundException.forResource("Product", itemReq.getProductId()));

                    BigDecimal unitPrice = Optional.ofNullable(itemReq.getUnitPrice())
                            .filter(price -> price.compareTo(BigDecimal.ZERO) > 0)
                            .orElseGet(() -> Optional.ofNullable(product.getEffectivePrice())
                                    .orElse(product.getPrice()));

                    BigDecimal discount = Optional.ofNullable(itemReq.getDiscount())
                            .orElse(BigDecimal.ZERO);

                    int qty = Optional.ofNullable(itemReq.getQuantity())
                            .orElse(1);

                    BigDecimal total = unitPrice.multiply(BigDecimal.valueOf(qty))
                            .subtract(discount)
                            .max(BigDecimal.ZERO);

                    OrderItem orderItem = OrderItem.builder()
                            .order(order)
                            .product(product)
                            .productName(product.getName())
                            .quantity(qty)
                            .unitPrice(unitPrice)
                            .discount(discount)
                            .totalPrice(total)
                            .build();

                    order.addOrderItem(orderItem);
                    log.info("Added item to order: productId={}, orderItems size now={}",
                            itemReq.getProductId(), order.getOrderItems().size());
                } catch (Exception e) {
                    log.error("Error processing item {}: {}", itemReq.getProductId(), e.getMessage());
                    throw e;
                }
            }
        }


        order.calculateTotals();
        Order saved = orderRepository.save(order);
        log.info("Order {} created for user {} with {} items", saved.getOrderNumber(), userId,
                saved.getOrderItems() != null ? saved.getOrderItems().size() : 0);
        return orderMapper.toResponse(saved);
    }

    // =========================================================================
    // CREATE FROM CART  (checkout flow)
    // =========================================================================

    /**
     * Converts an existing cart into a persisted {@link Order} using the
     * {@link Order#fromCart(Cart, User)} domain factory method.
     *
     * <p>The factory already:
     * <ul>
     *   <li>Validates the cart is non-null and non-empty</li>
     *   <li>Creates one {@link OrderItem} per cart line</li>
     *   <li>Copies the coupon code and discount from the cart</li>
     *   <li>Calls {@code calculateTotals()} so every monetary field is consistent</li>
     *   <li>Generates the order number in the canonical ORD-YYYYMMDD-XXXXXX format</li>
     * </ul>
     *
     * <p>Optional fields in {@link CartOrderRequest} (shipping details, payment method,
     * notes) are layered on top after the factory builds the base order.
     *
     * @param cartId  the cart to convert into an order
     * @param userId  the authenticated customer — must own the cart
     * @param request optional shipping / payment details; may contain null fields
     * @return the persisted order as a response DTO
     * @throws ResourceNotFoundException if the cart does not exist
     * @throws UnauthorizedException     if the cart does not belong to the user
     * @throws IllegalStateException     if the cart is empty
     */
    @Override
    @Transactional
    @CacheEvict(value = {
            "orders",
            "orders-predicate",
            "orders-search",
            "orders-filter",
            "order-stats",
            "user-orders",
            "order-counts"
    }, allEntries = true)
    public OrderResponse createOrderFromCart(Long cartId, Long userId, CartOrderRequest request) {

        // 1. Resolve user and cart, enforce ownership
        User user = findUserOrThrow(userId);

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found: " + cartId));


        // 2. Delegate to the domain factory — this builds the Order + all OrderItems,
        //    copies coupon state, calls calculateTotals(), and generates the order number.
        Order order = Order.fromCart(cart, user);

        // 3. Layer on optional request fields (shipping, payment, notes).
        //    These are intentionally separate from the factory because they are
        //    concerns of the API layer, not the core domain checkout logic.
        if (request != null) {
            if (request.getShippingAddress() != null) {
                order.setShippingAddress(request.getShippingAddress());
            }
            if (request.getShippingMethod() != null) {
                order.setShippingMethod(request.getShippingMethod());
            }
            if (request.getPaymentMethod() != null) {
                order.setPaymentMethod(request.getPaymentMethod());
            }
            if (request.getCustomerNotes() != null) {
                order.setCustomerNotes(request.getCustomerNotes());
            }
            // Apply optional shipping cost override from the request
            if (request.getShippingCost() != null
                    && request.getShippingCost().compareTo(BigDecimal.ZERO) > 0) {
                order.applyShippingCost(request.getShippingCost()); // recalculates totals internally
            }
        }

        // 4. Persist — CascadeType.ALL on orderItems persists every OrderItem in one shot.
        Order saved = orderRepository.save(order);
        log.info("Order {} created from cart {} for user {} with {} items",
                saved.getOrderNumber(), cartId, userId, saved.getOrderItems().size());

        return orderMapper.toResponse(saved);
    }

    // =========================================================================
    // READ — single
    // =========================================================================

    @Override
    @Cacheable(value = "order", key = "#id")
    public OrderResponse getOrderById(Long id, Long userId) {
        Order order = findActiveOrThrow(id);
        assertOwner(order, userId);
        return orderMapper.toResponse(order);
    }

    @Override
    @Cacheable(value = "order", key = "#id")
    public OrderResponse getOrderByIdAsAdmin(Long id) {
        return orderMapper.toResponse(findActiveOrThrow(id));
    }

    @Override
    @Cacheable(value = "order", key = "#orderNumber")
    public OrderResponse getOrderByOrderNumber(String orderNumber, Long userId) {
        Order order = orderRepository.findByOrderNumberAndIsActiveTrue(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found: " + orderNumber));
        assertOwner(order, userId);
        return orderMapper.toResponse(order);
    }

    // =========================================================================
    // READ — paged
    // =========================================================================

    @Override
    @Cacheable(value = "user-orders", key = "'user:' + #userId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<OrderResponse> getUserOrders(Long userId, Pageable pageable) {
        return orderRepository
                .findByUserIdAndIsActiveTrue(userId, pageable)
                .map(orderMapper::toResponse);
    }

    @Override
    @Cacheable(value = "user-orders", key = "'user-status:' + #userId + ':' + #status + ':' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<OrderResponse> getUserOrdersByStatus(Long userId,
                                                     OrderStatus status,
                                                     Pageable pageable) {
        return orderRepository
                .findByUserIdAndStatusAndIsActiveTrue(userId, status, pageable)
                .map(orderMapper::toResponse);
    }

    @Override
    @Cacheable(value = "orders", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        Predicate predicate = OrderPredicates.builder()
                .withActive(true)
                .build();
        return orderRepository.findAll(predicate, pageable)
                .map(orderMapper::toResponse);
    }

    @Override
    @Cacheable(value = "orders", key = "'status:' + #status + ':' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        Predicate predicate = OrderPredicates.builder()
                .withActive(true)
                .withStatus(status)
                .build();
        return orderRepository.findAll(predicate, pageable)
                .map(orderMapper::toResponse);
    }

    /**
     * Generic predicate-based filtered query.
     * All filter logic lives in {@link OrderPredicates#from(OrderFilterInput)}.
     */
    @Override
    @Cacheable(value = "orders-filter",
            key = "T(org.springframework.util.DigestUtils).md5DigestAsHex(('#filter=' + #filter.toString() + '&page=' + #pageable.pageNumber + '&size=' + #pageable.pageSize + '&sort=' + #pageable.sort).getBytes())")
    public Page<OrderResponse> getFilteredOrders(OrderFilterInput filter, Pageable pageable) {
        Predicate predicate = OrderPredicates.from(filter);
        return orderRepository.findAll(predicate, pageable)
                .map(orderMapper::toResponse);
    }

    // =========================================================================
    // STATUS TRANSITIONS
    // =========================================================================

    @Override
    @Transactional
    @CacheEvict(value = {
            "orders",
            "orders-predicate",
            "orders-search",
            "orders-filter",
            "order-stats",
            "user-orders",
            "order-counts"
    }, allEntries = true)
    @CachePut(value = "order", key = "#id")
    public OrderResponse confirmOrder(Long id) {
        Order order = findActiveOrThrow(id);
        order.confirm();
        log.info("Order {} confirmed", order.getOrderNumber());
        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    @CacheEvict(value = {
            "orders",
            "orders-predicate",
            "orders-search",
            "orders-filter",
            "order-stats",
            "user-orders",
            "order-counts"
    }, allEntries = true)
    @CachePut(value = "order", key = "#id")
    public OrderResponse shipOrder(Long id, String trackingNumber, String carrier) {
        Order order = findActiveOrThrow(id);
        order.setTrackingNumber(trackingNumber);
        order.setCarrier(carrier);
        order.ship();
        log.info("Order {} shipped — tracking: {}", order.getOrderNumber(), trackingNumber);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    @CacheEvict(value = {
            "orders",
            "orders-predicate",
            "orders-search",
            "orders-filter",
            "order-stats",
            "user-orders",
            "order-counts"
    }, allEntries = true)
    @CachePut(value = "order", key = "#id")
    public OrderResponse deliverOrder(Long id) {
        Order order = findActiveOrThrow(id);
        order.deliver();
        log.info("Order {} delivered", order.getOrderNumber());
        return orderMapper.toResponse(orderRepository.save(order));
    }

    /**
     * Transition a CONFIRMED order → PROCESSING.
     * Guards are enforced by {@link Order#process()}.
     */
    @Override
    @Transactional
    @CacheEvict(value = {
            "orders",
            "orders-predicate",
            "orders-search",
            "orders-filter",
            "order-stats",
            "user-orders",
            "order-counts"
    }, allEntries = true)
    @CachePut(value = "order", key = "#id")
    public OrderResponse processOrder(Long id) {
        Order order = findActiveOrThrow(id);
        order.process();
        log.info("Order {} moved to PROCESSING", order.getOrderNumber());
        return orderMapper.toResponse(orderRepository.save(order));
    }

    /**
     * Transition a SHIPPED order → OUT_FOR_DELIVERY.
     * Guards are enforced by {@link Order#outForDelivery()}.
     */
    @Override
    @Transactional
    @CacheEvict(value = {
            "orders",
            "orders-predicate",
            "orders-search",
            "orders-filter",
            "order-stats",
            "user-orders",
            "order-counts"
    }, allEntries = true)
    @CachePut(value = "order", key = "#id")
    public OrderResponse outForDeliveryOrder(Long id) {
        Order order = findActiveOrThrow(id);
        order.outForDelivery();
        log.info("Order {} is OUT_FOR_DELIVERY", order.getOrderNumber());
        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    @CacheEvict(value = {
            "orders",
            "orders-predicate",
            "orders-search",
            "orders-filter",
            "order-stats",
            "user-orders",
            "order-counts"
    }, allEntries = true)
    @CachePut(value = "order", key = "#id")
    public OrderResponse cancelOrder(Long id, String reason, Long userId) {
        Order order = findActiveOrThrow(id);
        assertOwner(order, userId);
        order.cancel(reason);
        log.info("Order {} cancelled by user {}: {}", order.getOrderNumber(), userId, reason);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    @CacheEvict(value = {
            "orders",
            "orders-predicate",
            "orders-search",
            "orders-filter",
            "order-stats",
            "user-orders",
            "order-counts"
    }, allEntries = true)
    @CachePut(value = "order", key = "#id")
    public OrderResponse refundOrder(Long id, BigDecimal amount, String reason) {
        Order order = findActiveOrThrow(id);
        order.refund(amount, reason);
        log.info("Order {} refunded — amount: {}", order.getOrderNumber(), amount);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    // =========================================================================
    // UPDATE
    // =========================================================================

    @Override
    @Transactional
    @CacheEvict(value = {
            "orders",
            "orders-predicate",
            "orders-search",
            "orders-filter",
            "order-stats",
            "user-orders",
            "order-counts"
    }, allEntries = true)
    @CachePut(value = "order", key = "#id")
    public OrderResponse updateOrderStatus(Long id, OrderUpdateRequest request) {
        if (request.getStatus() == null) {
            throw new IllegalArgumentException("Status must not be null");
        }
        Order order = findActiveOrThrow(id);

        OrderStatus newStatus = request.getStatus();
        if (newStatus == OrderStatus.CONFIRMED) {
            order.confirm();
        } else if (newStatus == OrderStatus.PROCESSING) {
            order.process();
        } else if (newStatus == OrderStatus.SHIPPED) {
            if (request.getTrackingNumber() != null) {
                order.setTrackingNumber(request.getTrackingNumber());
            }
            if (request.getCarrier() != null) {
                order.setCarrier(request.getCarrier());
            }
            order.ship();
        } else if (newStatus == OrderStatus.OUT_FOR_DELIVERY) {
            order.outForDelivery();
        } else if (newStatus == OrderStatus.DELIVERED) {
            order.deliver();
        } else if (newStatus == OrderStatus.CANCELLED) {
            order.cancel(request.getCancellationReason() != null
                    ? request.getCancellationReason()
                    : "Cancelled by admin");
        } else if (newStatus == OrderStatus.REFUNDED) {
            order.refund(request.getRefundAmount() != null
                    ? request.getRefundAmount()
                    : order.getTotalAmount(),
                    request.getRefundReason() != null
                            ? request.getRefundReason()
                            : "Refunded by admin");
        } else {
            throw new IllegalArgumentException("Unsupported status transition: " + newStatus);
        }

        log.info("Order {} status updated to {} by admin", order.getOrderNumber(), request.getStatus());
        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    @CacheEvict(value = {
            "orders",
            "orders-predicate",
            "orders-search",
            "orders-filter",
            "order-stats",
            "user-orders",
            "order-counts"
    }, allEntries = true)
    @CachePut(value = "order", key = "#orderId")
    public OrderResponse updatePaymentStatus(Long orderId, String status) {
        Order order = findActiveOrThrow(orderId);
        PaymentStatus paymentStatus = PaymentStatus.valueOf(status.toUpperCase());

        if (paymentStatus == PaymentStatus.PAID) {
            order.markAsPaid(null);
        } else if (paymentStatus == PaymentStatus.FAILED) {
            order.markPaymentFailed();
        } else {
            order.setPaymentStatus(paymentStatus);
        }

        log.info("Order {} payment status updated to {}", order.getOrderNumber(), paymentStatus);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    @CacheEvict(value = {
            "orders",
            "orders-predicate",
            "orders-search",
            "orders-filter",
            "order-stats",
            "user-orders",
            "order-counts"
    }, allEntries = true)
    @CachePut(value = "order", key = "#id")
    public OrderResponse updateOrderAsCustomer(Long id, OrderUpdateRequest request, Long userId) {
        Order order = findActiveOrThrow(id);
        assertOwner(order, userId);
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Customers may only update PENDING orders");
        }
        orderMapper.applyCustomerUpdate(order, request);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    // =========================================================================
    // ORDER ITEM OPERATIONS (Edit Pending Orders)
    // =========================================================================

    @Override
    @Transactional
    @CacheEvict(value = {
            "orders", "orders-predicate", "orders-search", "orders-filter",
            "order-stats", "user-orders", "order-counts", "order"
    }, allEntries = true)
    @CachePut(value = "order", key = "#orderId")
    public OrderResponse addItemToOrder(Long orderId, Long productId, Integer quantity, Long userId) {
        Order order = findActiveOrThrow(orderId);
        assertOwner(order, userId);

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Items can only be added to PENDING orders");
        }

        // Use the entity helper to avoid re-streaming manually
        OrderItem existingItem = order.findItemByProductId(productId);

        if (existingItem != null) {
            // Product already in order — just bump the quantity.
            // getTotalPrice() now delegates to computeTotal(), so calculateTotals()
            // will pick up the new quantity correctly.
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
        } else {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> ResourceNotFoundException.forResource("Product", productId));

            BigDecimal unitPrice = product.getEffectivePrice() != null
                    ? product.getEffectivePrice()
                    : product.getPrice();

            OrderItem newItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .quantity(quantity)
                    .unitPrice(unitPrice)
                    .discount(BigDecimal.ZERO)
                    .build();

            // addOrderItem sets the back-reference (item.order = order) as well
            order.addOrderItem(newItem);
        }

        // calculateTotals() now reads live computeTotal() values — no stale data
        order.calculateTotals();
        Order saved = orderRepository.save(order);
        log.info("Added item {} (qty: {}) to order {}", productId, quantity, orderId);
        return orderMapper.toResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = {
            "orders", "orders-predicate", "orders-search", "orders-filter",
            "order-stats", "user-orders", "order-counts", "order"
    }, allEntries = true)
    @CachePut(value = "order", key = "#orderId")
    public OrderResponse removeItemFromOrder(Long orderId, Long productId, Long userId) {
        Order order = findActiveOrThrow(orderId);
        assertOwner(order, userId);

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Items can only be removed from PENDING orders");
        }

        var itemToRemove = order.getOrderItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> ResourceNotFoundException.forResource("Order item for product", productId));

        order.removeOrderItem(itemToRemove);
        order.calculateTotals();
        Order saved = orderRepository.save(order);
        log.info("Removed item {} from order {}", productId, orderId);
        return orderMapper.toResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = {
            "orders", "orders-predicate", "orders-search", "orders-filter",
            "order-stats", "user-orders", "order-counts", "order"
    }, allEntries = true)
    @CachePut(value = "order", key = "#orderId")
    public OrderResponse updateItemQuantity(Long orderId, Long productId, Integer quantity, Long userId) {
        Order order = findActiveOrThrow(orderId);
        assertOwner(order, userId);

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Items can only be modified in PENDING orders");
        }

        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        var item = order.getOrderItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> ResourceNotFoundException.forResource("Order item for product", productId));

        item.setQuantity(quantity);
        order.calculateTotals();
        Order saved = orderRepository.save(order);
        log.info("Updated item {} quantity to {} in order {}", productId, quantity, orderId);
        return orderMapper.toResponse(saved);
    }

    // =========================================================================
    // DELETE
    // =========================================================================

    @Override
    @Transactional
    @CacheEvict(value = {
            "orders",
            "orders-predicate",
            "orders-search",
            "orders-filter",
            "order-stats",
            "user-orders",
            "order-counts",
            "order"
    }, allEntries = true)
    public void deleteOrder(Long orderId) {
        if (!orderRepository.existsByIdAndIsActiveTrue(orderId)) {
            throw new ResourceNotFoundException("Order not found: " + orderId);
        }
        orderRepository.softDeleteById(orderId);
        log.info("Order {} soft-deleted", orderId);
    }

    // =========================================================================
    // STATISTICS
    // =========================================================================

    @Override
    //@Cacheable(value = "order-stats", key = "'global_v2'")
    public OrderStatsResponse getOrderStatistics() {
        // DEBUG: Simplified version
        return OrderStatsResponse.builder()
                .stats(OrderStats.builder()
                        .totalOrders(0L)
                        .totalRevenue(BigDecimal.ZERO)
                        .build())
                .build();
    }

    // =========================================================================
    // ADVANCED QUERY OPERATIONS
    // =========================================================================

    @Override
    @Cacheable(value = "orders-predicate",
            key = "T(org.springframework.util.DigestUtils).md5DigestAsHex(('#predicate=' + #predicate.toString() + '&page=' + #pageable.pageNumber + '&size=' + #pageable.pageSize + '&sort=' + #pageable.sort).getBytes())")
    public Page<OrderResponse> findOrdersWithPredicate(Predicate predicate, Pageable pageable) {
        log.debug("Finding orders with predicate: {}", predicate);
        return orderRepository.findAll(predicate, pageable)
                .map(orderMapper::toResponse);
    }

    @Override
    @Cacheable(value = "orders-search",
            key = "T(org.springframework.util.DigestUtils).md5DigestAsHex(('#keyword=' + #keyword + '&page=' + #pageable.pageNumber + '&size=' + #pageable.pageSize + '&sort=' + #pageable.sort).getBytes())")
    public Page<OrderResponse> searchOrders(String keyword, Pageable pageable) {
        log.debug("Searching orders with keyword: {}", keyword);

        Predicate predicate = OrderPredicates.builder()
                .withActive(true)
                .withSearch(keyword)
                .build();

        return orderRepository.findAll(predicate, pageable)
                .map(orderMapper::toResponse);
    }

    @Override
    @Cacheable(value = "orders-filter",
            key = "T(org.springframework.util.DigestUtils).md5DigestAsHex(('#filter=' + #filter.toString() + '&page=' + #pageable.pageNumber + '&size=' + #pageable.pageSize + '&sort=' + #pageable.sort).getBytes())")
    public Page<OrderResponse> filterOrders(OrderFilterInput filter, Pageable pageable) {
        log.debug("Filtering orders with: {}", filter);

        Predicate predicate = OrderPredicates.from(filter);
        return orderRepository.findAll(predicate, pageable)
                .map(orderMapper::toResponse);
    }

    @Override
    @Cacheable(value = "orders", key = "'payment-status:' + #paymentStatus + ':' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<OrderResponse> getOrdersByPaymentStatus(PaymentStatus paymentStatus, Pageable pageable) {
        log.debug("Finding orders by payment status: {}", paymentStatus);

        Predicate predicate = OrderPredicates.builder()
                .withActive(true)
                .withPaymentStatus(paymentStatus)
                .build();

        return orderRepository.findAll(predicate, pageable)
                .map(orderMapper::toResponse);
    }

    @Override
    @Cacheable(value = "orders", key = "'high-value:' + #threshold + ':' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<OrderResponse> getHighValueOrders(BigDecimal threshold, Pageable pageable) {
        log.debug("Finding high-value orders with threshold: {}", threshold);

        BigDecimal actualThreshold = threshold != null ? threshold : new BigDecimal("500.00");
        Predicate predicate = OrderPredicates.builder()
                .withActive(true)
                .withHighValue(actualThreshold)
                .build();

        return orderRepository.findAll(predicate, pageable)
                .map(orderMapper::toResponse);
    }

    @Override
    @Cacheable(value = "orders", key = "'overdue:' + T(org.springframework.util.DigestUtils).md5DigestAsHex(#cutoffDate.toString().getBytes()) + ':' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<OrderResponse> getOverdueOrders(LocalDateTime cutoffDate, Pageable pageable) {
        log.debug("Finding overdue orders with cutoff date: {}", cutoffDate);

        LocalDateTime actualCutoff = cutoffDate != null ? cutoffDate : LocalDateTime.now().minusDays(3);
        Predicate predicate = OrderPredicates.builder()
                .withActive(true)
                .withOverdueBefore(actualCutoff)
                .build();

        return orderRepository.findAll(predicate, pageable)
                .map(orderMapper::toResponse);
    }

    @Override
    @Cacheable(value = "orders", key = "'date-range:' + T(org.springframework.util.DigestUtils).md5DigestAsHex((#startDate.toString() + ':' + #endDate.toString()).getBytes()) + ':' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<OrderResponse> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        log.debug("Finding orders between {} and {}", startDate, endDate);

        Predicate predicate = OrderPredicates.builder()
                .withActive(true)
                .withCreatedAfter(startDate)
                .withCreatedBefore(endDate)
                .build();

        return orderRepository.findAll(predicate, pageable)
                .map(orderMapper::toResponse);
    }

    @Override
    @Cacheable(value = "order-exists", key = "#orderId")
    public boolean existsByIdAndActive(Long orderId) {
        return orderRepository.existsByIdAndIsActiveTrue(orderId);
    }

    @Override
    @Cacheable(value = "order-counts", key = "'user:' + #userId")
    public long countByUserId(Long userId) {
        return orderRepository.countByUserIdAndIsActiveTrue(userId);
    }

    @Override
    @Cacheable(value = "order-counts", key = "'status:' + #status")
    public long countByStatus(OrderStatus status) {
        return orderRepository.countByStatusAndIsActiveTrue(status);
    }

    // =========================================================================
    // ADDITIONAL CONVENIENCE METHODS
    // =========================================================================

    /**
     * Get orders that need attention (PENDING, PROCESSING, PAYMENT_PENDING)
     */
    @Override
    @Cacheable(value = "orders", key = "'needing-attention:' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<OrderResponse> getOrdersNeedingAttention(Pageable pageable) {
        Predicate predicate = OrderPredicates.builder()
                .withActive(true)
                .withOrdersNeedingAttention()
                .build();

        return orderRepository.findAll(predicate, pageable)
                .map(orderMapper::toResponse);
    }

    /**
     * Get completed orders (DELIVERED)
     */
    @Override
    @Cacheable(value = "orders", key = "'completed:' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<OrderResponse> getCompletedOrders(Pageable pageable) {
        Predicate predicate = OrderPredicates.builder()
                .withActive(true)
                .withCompletedOrders()
                .build();

        return orderRepository.findAll(predicate, pageable)
                .map(orderMapper::toResponse);
    }

    /**
     * Get paid orders
     */
    @Override
    @Cacheable(value = "orders", key = "'paid:' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<OrderResponse> getPaidOrders(Pageable pageable) {
        Predicate predicate = OrderPredicates.builder()
                .withActive(true)
                .withPaidOrders()
                .build();

        return orderRepository.findAll(predicate, pageable)
                .map(orderMapper::toResponse);
    }

    /**
     * Get orders with tracking numbers
     */
    @Override
    @Cacheable(value = "orders", key = "'with-tracking:' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")
    public Page<OrderResponse> getOrdersWithTracking(Pageable pageable) {
        Predicate predicate = OrderPredicates.builder()
                .withActive(true)
                .withTrackingNumber()
                .build();

        return orderRepository.findAll(predicate, pageable)
                .map(orderMapper::toResponse);
    }

    // =========================================================================
    // Private helpers
    // =========================================================================

    private Order findActiveOrThrow(Long id) {
        return orderRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found: " + userId));
    }

    private void assertOwner(Order order, Long userId) {
        if (!order.getUser().getId().equals(userId)) {
            throw new UnauthorizedException(
                    "Access denied to order " + order.getId());
        }
    }

    private static BigDecimal nullSafe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}