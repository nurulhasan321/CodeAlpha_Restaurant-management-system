package com.restaurant.restaurant_management_Sys.dto.request;

import java.util.List;

public record RecipeReq(
    List<RecipeIngredientReq> ingredients
) {}
