package com.restaurant.restaurant_management_Sys.dto.request;

public record OrderItemReq(
        Long menuItemId,
        Integer quantity,
        String specialNote
) {
}
