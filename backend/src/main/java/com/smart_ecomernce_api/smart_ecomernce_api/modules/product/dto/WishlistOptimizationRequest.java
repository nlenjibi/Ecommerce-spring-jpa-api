package com.smart_ecomernce_api.smart_ecomernce_api.modules.product.dto;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistOptimizationRequest {

    private Double maxBudget;

    private List<String> priorityOrder; // e.g., ["URGENT", "HIGH", "MEDIUM", "LOW"]

    private Boolean includeOnlyInStock;

    private Integer maxItems;

    private String optimizationStrategy; // "PRIORITY", "PRICE", "SAVINGS", "BALANCED"
}