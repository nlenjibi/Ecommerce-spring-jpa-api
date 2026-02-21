package com.smart_ecomernce_api.smart_ecomernce_api.modules.cart.service.impl;

import com.smart_ecomernce_api.smart_ecomernce_api.exception.*;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.cart.dto.*;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.cart.entity.Cart;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.cart.entity.CartItem;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.cart.entity.CartStatus;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.cart.mapper.CartMapper;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.cart.repository.CartRepository;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.cart.service.CartService;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.entity.Product;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.repository.ProductRepository;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.entity.User;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Optimized Cart Service Implementation with JPA and Caching
 * Features:
 * - Multi-level caching strategy
 * - Optimized JPA queries with fetch strategies
 * - Transactional boundaries
 * - Cache eviction on mutations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@CacheConfig(cacheNames = "carts")
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CartMapper cartMapper;

    @Override
    @CacheEvict(value = "carts", allEntries = true)
    public CartDto createCart() {
        log.info("Creating new cart");

        Cart cart = Cart.builder().build();

        Cart savedCart = cartRepository.save(cart);

        log.info("Cart created with ID: {}", savedCart.getId());
        return cartMapper.toDto(savedCart);
    }

    @Override
    @Cacheable(value = "carts", key = "#cartId")
    @Transactional(readOnly = true)
    public CartDto getCart(Long cartId) {
        log.info("Fetching cart: {}", cartId);

        Cart cart = cartRepository.findByIdWithItems(cartId).orElseThrow(() -> new CartNotFoundException(cartId));

        return cartMapper.toDto(cart);
    }

    @Override
    @CacheEvict(value = "carts", key = "#cartId")
    @Transactional
    public CartItemDto addToCart(Long cartId, AddItemToCartRequest request) {
        log.info("Adding product {} to cart {}", request.getProductId(), cartId);

        Cart cart = cartRepository.findByIdWithItems(cartId).orElseThrow(() -> new CartNotFoundException(cartId));

        // Fetch product within transaction to avoid lazy loading issues
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> ResourceNotFoundException.forResource("Product", request.getProductId()));

        CartItem cartItem = cart.addItem(product);

        cartRepository.save(cart);

        log.info("Added product {} to cart {} with quantity {}", request.getProductId(), cartId, cartItem.getQuantity());

        return cartMapper.toDto(cartItem);
    }
    @Override
    @CacheEvict(value = "carts", key = "#cartId")
    @Transactional
    public CartItemDto updateItemQuantity(Long cartId, Long productId, UpdateCartItemRequest request) {
        Integer quantity = request.getQuantity();
        log.info("Updating cart {} item {} quantity to {}", cartId, productId, quantity);

        Cart cart = cartRepository.findByIdWithItems(cartId).orElseThrow(() -> new CartNotFoundException(cartId));

        CartItem cartItem = cart.getItem(productId);
        if (cartItem == null) {
            throw ResourceNotFoundException.forResource("Cart item for product", productId);
        }

        // Fetch product directly to ensure it is initialized and avoid LazyInitializationException
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> ResourceNotFoundException.forResource("Product", productId));

        if (product.getStockQuantity() < quantity) {
            throw new InsufficientStockException(product.getName(), product.getStockQuantity(), quantity);
        }

        cartItem.setQuantity(quantity);
        cartRepository.save(cart);

        log.info("Updated cart item quantity: cart={}, product={}, quantity={}", cartId, productId, quantity);

        return cartMapper.toDto(cartItem);
    }


    @Override
    @CacheEvict(value = "carts", key = "#cartId")
    public void removeItem(Long cartId, Long productId) {
        log.info("Removing product {} from cart {}", productId, cartId);

        Cart cart = cartRepository.findByIdWithItems(cartId).orElseThrow(() -> new CartNotFoundException(cartId));

        cart.removeItem(productId);
        cartRepository.save(cart);

        log.info("Removed product {} from cart {}", productId, cartId);
    }

    @Override
    @CacheEvict(value = "carts", key = "#cartId")
    public void clearCart(Long cartId) {
        log.info("Clearing cart: {}", cartId);

        Cart cart = cartRepository.findByIdWithItems(cartId).orElseThrow(() -> new CartNotFoundException(cartId));

        if (cart.isEmpty()) {
            throw new CartNotFoundException("Cart is already empty");
        }

        cart.clear();
        cartRepository.save(cart);

        log.info("Cart cleared: {}", cartId);
    }

}