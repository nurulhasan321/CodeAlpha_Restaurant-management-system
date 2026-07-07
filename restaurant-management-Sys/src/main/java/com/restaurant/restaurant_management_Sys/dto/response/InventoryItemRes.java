package com.restaurant.restaurant_management_Sys.dto.response;

public record InventoryItemRes(
        Long id,
        String itemName,
        String skuCode,
        Double quantity,
        String unit,
        Double minimumThreshold,
        String status,
        Long categoryId,
        String categoryName
) {
}
