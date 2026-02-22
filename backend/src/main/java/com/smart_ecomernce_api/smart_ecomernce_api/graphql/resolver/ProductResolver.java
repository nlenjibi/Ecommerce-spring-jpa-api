package com.smart_ecomernce_api.smart_ecomernce_api.graphql.resolver;

import com.smart_ecomernce_api.smart_ecomernce_api.common.predicate.ProductPredicates;
import com.smart_ecomernce_api.smart_ecomernce_api.common.response.PaginatedResponse;
import com.smart_ecomernce_api.smart_ecomernce_api.graphql.dto.ProductDto;
import com.smart_ecomernce_api.smart_ecomernce_api.graphql.input.PageInput;
import com.smart_ecomernce_api.smart_ecomernce_api.graphql.input.ProductFilterInput;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.dto.*;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.entity.InventoryStatus;
import com.smart_ecomernce_api.smart_ecomernce_api.modules.product.service.ProductService;
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
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.math.BigDecimal;
import java.util.List;

/**
 * GraphQL Resolver for Product operations with advanced predicate filtering
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class ProductResolver {

    private final ProductService productService;

    // ==================== Single Product Queries ====================

    @QueryMapping
    @RequestValidation(requireAuth = false)
    public ProductResponse product(@Argument Long id) {
        log.debug("GraphQL Query: product(id: {})", id);
        return productService.getProductById(id);
    }

    @QueryMapping
    @RequestValidation(requireAuth = false)
    public ProductResponse productBySlug(@Argument String slug) {
        log.debug("GraphQL Query: productBySlug(slug: {})", slug);
        return productService.getProductBySlug(slug);
    }

    @QueryMapping
    @RequestValidation(requireAuth = false)
    public ProductResponse productBySku(@Argument String sku) {
        log.debug("GraphQL Query: productBySku(sku: {})", sku);
        return productService.getProductBySku(sku);
    }

    // ==================== List Queries with Advanced Filtering ====================

    @QueryMapping
    @RequestValidation(requireAuth = false)
    public ProductDto products(
            @Argument PageInput pagination,
            @Argument ProductFilterInput filter) {
        log.debug("GraphQL Query: products with filter: {}, hasFilters: {}", filter, filter != null ? filter.hasFilters() : "filter is null");

        Pageable pageable = createPageable(pagination);
        Page<ProductResponse> productPage;

        if (filter != null && filter.hasFilters()) {
            log.debug("Applying filter - keyword: {}, name: {}, featured: {}", filter.getKeyword(), filter.getName(), filter.getFeatured());
            // Build predicate for advanced filtering
            Predicate predicate = buildPredicateFromFilter(filter);
            log.debug("Built predicate: {}", predicate);
            productPage = productService.findByPredicate(predicate, pageable);
        } else {
            log.debug("No filters applied, getting all products");
            productPage = productService.getAllProducts(pageable);
        }

        return ProductDto.builder()
                .content(productPage.getContent())
                .pageInfo(PaginatedResponse.from(productPage))
                .build();
    }

    // ==================== Specialized Filter Queries ====================

    @QueryMapping
    @RequestValidation(requireAuth = false)
    public ProductDto productsByCategory(
            @Argument Long categoryId,
            @Argument PageInput pagination) {
        log.debug("GraphQL Query: productsByCategory(categoryId: {})", categoryId);

        Pageable pageable = createPageable(pagination);
        Page<ProductResponse> productPage = productService.getProductsByCategory(categoryId, pageable);

        return ProductDto.builder()
                .content(productPage.getContent())
                .pageInfo(PaginatedResponse.from(productPage))
                .build();
    }

    @QueryMapping
    @RequestValidation(requireAuth = false)
    public ProductDto productsByCategoryName(
            @Argument String categoryName,
            @Argument PageInput pagination) {
        log.debug("GraphQL Query: productsByCategoryName(categoryName: {})", categoryName);

        Pageable pageable = createPageable(pagination);
        Page<ProductResponse> productPage = productService.getProductsByCategoryName(categoryName, pageable);

        return ProductDto.builder()
                .content(productPage.getContent())
                .pageInfo(PaginatedResponse.from(productPage))
                .build();
    }

    @QueryMapping
    @RequestValidation(requireAuth = false)
    public ProductDto productsByPriceRange(
            @Argument BigDecimal minPrice,
            @Argument BigDecimal maxPrice,
            @Argument PageInput pagination) {
        log.debug("GraphQL Query: productsByPriceRange({} - {})", minPrice, maxPrice);

        Pageable pageable = createPageable(pagination);
        Page<ProductResponse> productPage = productService.getProductsByPriceRange(minPrice, maxPrice, pageable);

        return ProductDto.builder()
                .content(productPage.getContent())
                .pageInfo(PaginatedResponse.from(productPage))
                .build();
    }

    @QueryMapping
    @RequestValidation(requireAuth = false)
    public ProductDto productsByInventoryStatus(
            @Argument InventoryStatus status,
            @Argument PageInput pagination) {
        log.debug("GraphQL Query: productsByInventoryStatus(status: {})", status);

        Pageable pageable = createPageable(pagination);
        Page<ProductResponse> productPage = productService.findByInventoryStatus(status, pageable);

        return ProductDto.builder()
                .content(productPage.getContent())
                .pageInfo(PaginatedResponse.from(productPage))
                .build();
    }

    // ==================== Marketing Queries ====================

    @QueryMapping
    @RequestValidation(requireAuth = false)
    public ProductDto featuredProducts(@Argument PageInput pagination) {
        log.debug("GraphQL Query: featuredProducts");

        Pageable pageable = createPageable(pagination);
        Page<ProductResponse> productPage = productService.getFeaturedProducts(pageable);

        return ProductDto.builder()
                .content(productPage.getContent())
                .pageInfo(PaginatedResponse.from(productPage))
                .build();
    }

    @QueryMapping
    @RequestValidation(requireAuth = false)
    public ProductDto newProducts(@Argument PageInput pagination) {
        log.debug("GraphQL Query: newProducts");

        Pageable pageable = createPageable(pagination);
        Page<ProductResponse> productPage = productService.getNewProducts(pageable);

        return ProductDto.builder()
                .content(productPage.getContent())
                .pageInfo(PaginatedResponse.from(productPage))
                .build();
    }

    @QueryMapping
    @RequestValidation(requireAuth = false)
    public ProductDto discountedProducts(@Argument PageInput pagination) {
        log.debug("GraphQL Query: discountedProducts");

        Pageable pageable = createPageable(pagination);
        Page<ProductResponse> productPage = productService.getDiscountedProducts(pageable);

        return ProductDto.builder()
                .content(productPage.getContent())
                .pageInfo(PaginatedResponse.from(productPage))
                .build();
    }

    @QueryMapping
    @RequestValidation(requireAuth = false)
    public ProductDto bestsellerProducts(@Argument PageInput pagination) {
        log.debug("GraphQL Query: bestsellerProducts");

        Pageable pageable = createPageable(pagination);
        Page<ProductResponse> productPage = productService.getBestsellerProducts(pageable);

        return ProductDto.builder()
                .content(productPage.getContent())
                .pageInfo(PaginatedResponse.from(productPage))
                .build();
    }
    @QueryMapping
    @RequestValidation(requireAuth = false)
    public ProductDto topRatedProducts(@Argument PageInput pagination) {
        log.debug("GraphQL Query: topRatedProducts");

        Pageable pageable = createPageable(pagination);
        Page<ProductResponse> productPage = productService.getTopRatedProducts(pageable);

        return ProductDto.builder()
                .content(productPage.getContent())
                .pageInfo(PaginatedResponse.from(productPage))
                .build();
    }

    @QueryMapping
    @RequestValidation(requireAuth = false)
    public List<ProductResponse> trendingProducts(
            @Argument Long categoryId,
            @Argument(name = "limit") Integer limit) {
        log.debug("GraphQL Query: trendingProducts(categoryId: {}, limit: {})", categoryId, limit);

        int actualLimit = limit != null ? limit : 10;
        return productService.getTrendingProducts(categoryId, actualLimit);
    }

    @QueryMapping
    @RequestValidation(requireAuth = false)
    public ProductDto searchProducts(
            @Argument String keyword,
            @Argument PageInput pagination) {
        log.debug("GraphQL Query: searchProducts(keyword: {})", keyword);

        Pageable pageable = createPageable(pagination);
        Page<ProductResponse> productPage = productService.searchProducts(keyword, pageable);

        return ProductDto.builder()
                .content(productPage.getContent())
                .pageInfo(PaginatedResponse.from(productPage))
                .build();
    }

    // ==================== Inventory Management Queries ====================

    @QueryMapping
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    public ProductDto productsNeedingReorder(@Argument PageInput pagination) {
        log.debug("GraphQL Query: productsNeedingReorder");

        Pageable pageable = createPageable(pagination);
        Page<ProductResponse> productPage = productService.getProductsNeedingReorder(pageable);

        return ProductDto.builder()
                .content(productPage.getContent())
                .pageInfo(PaginatedResponse.from(productPage))
                .build();
    }

    @QueryMapping
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    public List<ProductResponse> lowStockProducts() {
        log.debug("GraphQL Query: lowStockProducts");
        ProductPredicates predicates = ProductPredicates.builder()
                .withActive(true)
                .withLowStockOnly(true);
        Page<ProductResponse> productPage = productService.findByPredicate(
                predicates.build(), PageRequest.of(0, 50, Sort.by("stockQuantity").ascending()));
        return productPage.getContent();
    }

    @QueryMapping
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    public List<ProductResponse> outOfStockProducts() {
        log.debug("GraphQL Query: outOfStockProducts");
        ProductPredicates predicates = ProductPredicates.builder()
                .withActive(true)
                .withOutOfStockOnly(true);
        Page<ProductResponse> productPage = productService.findByPredicate(
                predicates.build(), PageRequest.of(0, 50, Sort.by("stockQuantity").ascending()));
        return productPage.getContent();
    }

    // ==================== Statistics Queries ====================

    @QueryMapping
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    public ProductStatisticsResponse productStatistics() {
        log.debug("GraphQL Query: productStatistics");
        return productService.getProductStatistics();
    }

    // ==================== CRUD Mutations ====================

    @MutationMapping
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    public ProductResponse createProduct(@Argument ProductCreateRequest input) {
        log.info("GraphQL Mutation: createProduct(name: {})", input.getName());
        return productService.createProduct(input);
    }

    @MutationMapping
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    public ProductResponse updateProduct(
            @Argument Long id,
            @Argument ProductUpdateRequest input) {
        log.info("GraphQL Mutation: updateProduct(id: {})", id);
        return productService.updateProduct(id, input);
    }

    @MutationMapping
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    public Boolean deleteProduct(@Argument Long id) {
        log.info("GraphQL Mutation: deleteProduct(id: {})", id);
        productService.deleteProduct(id);
        return true;
    }

    // ==================== Stock Management Mutations ====================

    @MutationMapping
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    public ProductResponse reduceStock(
            @Argument Long id,
            @Argument Integer quantity) {
        log.info("GraphQL Mutation: reduceStock(id: {}, quantity: {})", id, quantity);
        return productService.reduceStock(id, quantity);
    }

    @MutationMapping
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    public Boolean restoreStock(
            @Argument Long id,
            @Argument Integer quantity) {
        log.info("GraphQL Mutation: restoreStock(id: {}, quantity: {})", id, quantity);
        productService.restoreStock(id, quantity);
        return true;
    }

    @MutationMapping
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    public ProductResponse addStock(
            @Argument Long id,
            @Argument Integer quantity) {
        log.info("GraphQL Mutation: addStock(id: {}, quantity: {})", id, quantity);
        productService.restoreStock(id, quantity);
        return productService.getProductById(id);
    }

    @MutationMapping
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    public ProductResponse reserveStock(
            @Argument Long id,
            @Argument Integer quantity) {
        log.info("GraphQL Mutation: reserveStock(id: {}, quantity: {})", id, quantity);
        productService.reserveStock(id, quantity);
        return productService.getProductById(id);
    }

    @MutationMapping
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    public ProductResponse releaseReservedStock(
            @Argument Long id,
            @Argument Integer quantity) {
        log.info("GraphQL Mutation: releaseReservedStock(id: {}, quantity: {})", id, quantity);
        productService.releaseReservedStock(id, quantity);
        return productService.getProductById(id);
    }

    // ==================== Bulk Operations Mutations ====================

    @MutationMapping
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    public Boolean bulkUpdateFeatured(
            @Argument List<Long> productIds,
            @Argument Boolean featured) {
        log.info("GraphQL Mutation: bulkUpdateFeatured(count: {}, featured: {})",
                productIds.size(), featured);
        productService.bulkUpdateFeatured(productIds, featured);
        return true;
    }

    @MutationMapping
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    @Caching(evict = {
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "products-search", allEntries = true),
            @CacheEvict(value = "products-by-category", allEntries = true),
            @CacheEvict(value = "products-by-category-name", allEntries = true),
            @CacheEvict(value = "featured-products", allEntries = true),
            @CacheEvict(value = "new-products", allEntries = true),
            @CacheEvict(value = "discounted-products", allEntries = true),
            @CacheEvict(value = "bestseller-products", allEntries = true),
            @CacheEvict(value = "products-reorder", allEntries = true)
    })
    public Boolean bulkDelete(@Argument List<Long> productIds) {
        log.info("GraphQL Mutation: bulkDelete(count: {})", productIds.size());
        productService.bulkDelete(productIds);
        return true;
    }

    // ==================== Analytics Mutations ====================

    @MutationMapping
    @RequestValidation(requireAuth = false)
    public Boolean incrementViewCount(@Argument Long id) {
        log.debug("GraphQL Mutation: incrementViewCount(id: {})", id);
        productService.incrementViewCount(id);
        return true;
    }

    @MutationMapping
    @RequestValidation(roles = {"ADMIN", "MANAGER"})
    @CacheEvict(value = "products", key = "#id")
    public ProductResponse updateRating(
            @Argument Long id,
            @Argument Float rating) {
        log.info("GraphQL Mutation: updateRating(id: {}, rating: {})", id, rating);
        // Note: You might want to implement a proper rating update service method
        // For now, this is a placeholder that would update the product rating
        ProductResponse product = productService.getProductById(id);
        // Actual rating update logic would go here
        return product;
    }

    // ==================== Helper Methods ====================

    private Pageable createPageable(PageInput input) {
        if (input == null) {
            return PageRequest.of(0, 20, Sort.by(Sort.Direction.ASC, "id"));
        }
        Sort.Direction direction = input.getDirection() == com.smart_ecomernce_api.smart_ecomernce_api.graphql.input.SortDirection.DESC
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        String sortBy = input.getSortBy() != null ? input.getSortBy() : "id";
        int page = input.getPage();
        int size = input.getSize();
        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }

    private Predicate buildPredicateFromFilter(ProductFilterInput filter) {
        // Use the same method as REST API for consistency
        return ProductPredicates.fromFilterRequest(filter.toFilterRequest());
    }
}