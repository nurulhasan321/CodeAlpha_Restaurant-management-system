package com.restaurant.restaurant_management_Sys.dto.response;

public record OrderItemRes(
        Long id,
        String menuItemName,
        Integer quantity,
        Double unitPrice,
        Double subtotal,
        String specialNote
) {
}
