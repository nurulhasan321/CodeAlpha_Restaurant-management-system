package com.restaurant.restaurant_management_Sys.dto.request;

public record RecipeIngredientReq(
    Long inventoryItemId,
    Double quantityRequired
) {}
