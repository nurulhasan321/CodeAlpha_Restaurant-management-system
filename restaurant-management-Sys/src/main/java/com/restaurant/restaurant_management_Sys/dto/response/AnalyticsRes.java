package com.restaurant.restaurant_management_Sys.dto.response;

import java.util.List;
import java.util.Map;

public record AnalyticsRes(
        Long totalOrders,
        Double revenue,
        Long customers,
        Long availableTables,
        Long reservations,
        Long lowStockItems,
        Map<String, Long> orderTypes,
        List<PopularItem> popularItems
) {
    public record PopularItem(String name, Long count) {}
}
