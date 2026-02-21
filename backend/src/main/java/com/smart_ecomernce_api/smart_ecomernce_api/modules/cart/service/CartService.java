package com.smart_ecomernce_api.smart_ecomernce_api.modules.cart.service;

import com.smart_ecomernce_api.smart_ecomernce_api.modules.cart.dto.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Optimized Cart Service Interface for Modern E-commerce
 * Provides comprehensive cart management operations
 */
public interface CartService {

    CartDto createCart();

    CartDto getCart(Long cartId);

    CartItemDto addToCart(Long cartId, AddItemToCartRequest request);

    CartItemDto updateItemQuantity(Long cartId, Long productId, UpdateCartItemRequest request);


    void removeItem(Long cartId, Long productId);

    void clearCart(Long cartId);
}