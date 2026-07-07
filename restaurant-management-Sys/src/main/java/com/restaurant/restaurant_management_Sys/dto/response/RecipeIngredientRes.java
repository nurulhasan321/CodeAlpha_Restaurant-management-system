package com.restaurant.restaurant_management_Sys.dto.response;

public record RecipeIngredientRes(
    Long id,
    Long inventoryItemId,
    String inventoryItemName,
    String unit,
    Double quantityRequired
) {}
