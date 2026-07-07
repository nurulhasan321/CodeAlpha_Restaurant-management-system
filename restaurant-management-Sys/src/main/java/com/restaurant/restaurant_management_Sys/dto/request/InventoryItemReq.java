package com.restaurant.restaurant_management_Sys.dto.request;

public record InventoryItemReq(
        String itemName,
        String skuCode,
        Double quantity,
        String unit,
        Double minimumThreshold,
        Long categoryId
) {
}
