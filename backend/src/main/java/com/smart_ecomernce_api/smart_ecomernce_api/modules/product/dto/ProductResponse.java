package com.smart_ecomernce_api.smart_ecomernce_api.modules.product.dto;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class ProductResponse {
    private Long id;
    private String slug;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private BigDecimal costPrice;
    private BigDecimal effectivePrice;
    private BigDecimal discountPercentage;
    private Integer stockQuantity;
    private Integer reservedQuantity;
    private Integer availableQuantity;
    private Integer lowStockThreshold;
    private Integer reorderPoint;
    private Integer reorderQuantity;
    private Integer maxStockQuantity;
    private String inventoryStatus;
    private Boolean trackInventory;
    private Boolean allowBackorder;
    private LocalDateTime expectedRestockDate;
    private LocalDateTime lastRestockedAt;
    private Boolean featured;
    private Boolean isNew;
    private Boolean isBestseller;
    private Long viewCount = 0L;
    private Long salesCount = 0L;
    private BigDecimal ratingAverage;
    private Integer ratingCount = 0;
    private String imageUrl;
    private String thumbnailUrl;
    private List<String> additionalImages;
    private String metaTitle;
    private String metaDescription;
    private Set<String> tags;
    private CategoryInfo category;
    private List<ProductImageResponse> images;
    private Boolean inStock;


    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    // version field removed

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryInfo {
        private Long id;
        private String slug;
        private String name;
        private String description;
        private String imageUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductImageResponse {
        private Long id;
        private String imageUrl;
        private String altText;
        private Boolean isPrimary;
    }
}
