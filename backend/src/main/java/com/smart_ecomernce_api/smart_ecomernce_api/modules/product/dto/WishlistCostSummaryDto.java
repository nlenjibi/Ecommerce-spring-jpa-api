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
public class WishlistCostSummaryDto {

    private Integer totalItems;

    private Double subtotal;

    private Double estimatedTax;

    private Double estimatedShipping;

    private Double totalCost;

    private Integer inStockItems;

    private Integer outOfStockItems;

    private List<PriorityBreakdown> byPriority;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriorityBreakdown {
        private String priority;
        private Integer itemCount;
        private Double totalCost;
    }
}
