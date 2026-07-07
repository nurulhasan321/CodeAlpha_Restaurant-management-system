package com.restaurant.restaurant_management_Sys.dto.response;

import java.util.List;

public record OrderRes(
        Long id,
        String orderType,
        String status,
        Double totalAmount,
        String customerName,
        String tableName,
        String deliveryAddress,
        String paymentMethod,
        String paymentStatus,
        List<OrderItemRes> items,
        java.time.LocalDateTime createdAt
) {
}
