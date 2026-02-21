package com.smart_ecomernce_api.smart_ecomernce_api.modules.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.smart_ecomernce_api.smart_ecomernce_api.modules.order.entity.OrderStats;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatsResponse {
    private OrderStats stats;

    @Builder.Default
    private List<String> errors = new ArrayList<>();
}
