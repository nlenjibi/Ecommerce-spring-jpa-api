package com.smart_ecomernce_api.smart_ecomernce_api.modules.product.service;

import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.entity.Product;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service demonstrating REQUIRES_NEW transaction pattern for inventory management
 * Each operation runs in its own independent transaction
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryTransactionService {

    private final ProductRepository productRepository;

    /**
     * Reserve stock in independent transaction
     * Uses REQUIRES_NEW to ensure stock is reserved even if outer transaction fails
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void reserveStock(Long productId, Integer quantity) {
        log.info("Reserving {} units of product {} in independent transaction", quantity, productId);
        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        
        // Check available stock
        Integer availableStock = product.getStockQuantity() - product.getReservedQuantity();
        if (availableStock < quantity) {
            throw new IllegalStateException(
                String.format("Insufficient stock for product %s. Available: %s, Requested: %s",
                    productId, availableStock, quantity));
        }
        
        // Reserve the stock
        product.setReservedQuantity(product.getReservedQuantity() + quantity);
        productRepository.save(product);
        
        log.info("Successfully reserved {} units of product {}. Reserved: {}/{}",
            quantity, productId, product.getReservedQuantity(), product.getStockQuantity());
    }

    /**
     * Release reserved stock in independent transaction
     * Commits immediately regardless of outer transaction outcome
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void releaseReservedStock(Long productId, Integer quantity) {
        log.info("Releasing {} units of reserved stock for product {}", quantity, productId);
        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        
        // Ensure we don't release more than reserved
        Integer releaseAmount = Math.min(quantity, product.getReservedQuantity());
        product.setReservedQuantity(product.getReservedQuantity() - releaseAmount);
        productRepository.save(product);
        
        log.info("Released {} units of product {}. Remaining reserved: {}",
            releaseAmount, productId, product.getReservedQuantity());
    }

    /**
     * Commit reserved stock (deduct from actual stock)
     * Called when order is completed successfully
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void commitReservedStock(Long productId, Integer quantity) {
        log.info("Committing {} units of reserved stock for product {}", quantity, productId);
        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        
        // Verify reserved quantity
        if (product.getReservedQuantity() < quantity) {
            throw new IllegalStateException(
                String.format("Cannot commit %s units. Only %s reserved for product %s",
                    quantity, product.getReservedQuantity(), productId));
        }
        
        // Deduct from both reserved and actual stock
        product.setReservedQuantity(product.getReservedQuantity() - quantity);
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);
        
        log.info("Committed {} units of product {}. New stock: {}, Reserved: {}",
            quantity, productId, product.getStockQuantity(), product.getReservedQuantity());
    }

    /**
     * Adjust stock levels with independent transaction
     * Used for inventory adjustments, receiving shipments, etc.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void adjustStock(Long productId, Integer adjustment) {
        log.info("Adjusting stock for product {} by {}", productId, adjustment);
        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        
        Integer newStock = product.getStockQuantity() + adjustment;
        if (newStock < 0) {
            throw new IllegalStateException(
                String.format("Stock adjustment would result in negative inventory for product %s", productId));
        }
        
        product.setStockQuantity(newStock);
        productRepository.save(product);
        
        log.info("Stock adjusted for product {}. Old: {}, New: {}",
            productId, product.getStockQuantity() - adjustment, newStock);
    }

    /**
     * Batch stock update for multiple products
     * Each product update is in its own transaction
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    public void batchUpdateStock(Long[] productIds, Integer[] quantities) {
        log.info("Batch updating stock for {} products", productIds.length);
        
        if (productIds.length != quantities.length) {
            throw new IllegalArgumentException("Product IDs and quantities arrays must have same length");
        }
        
        for (int i = 0; i < productIds.length; i++) {
            try {
                adjustStock(productIds[i], quantities[i]);
            } catch (Exception e) {
                log.error("Failed to update stock for product {}: {}", productIds[i], e.getMessage());
                // Continue with other products - independent transactions
            }
        }
    }

    /**
     * Get current inventory snapshot
     * Runs without transaction for better performance
     */
    @Transactional(propagation = Propagation.NOT_SUPPORTED, readOnly = true)
    public InventorySnapshot getInventorySnapshot(Long productId) {
        log.info("Getting inventory snapshot for product {}", productId);
        
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        
        return new InventorySnapshot(
            productId,
            product.getStockQuantity(),
            product.getReservedQuantity(),
            product.getStockQuantity() - product.getReservedQuantity()
        );
    }

    /**
     * Inventory snapshot DTO
     */
    public record InventorySnapshot(
        Long productId,
        Integer totalStock,
        Integer reservedStock,
        Integer availableStock
    ) {}
}
