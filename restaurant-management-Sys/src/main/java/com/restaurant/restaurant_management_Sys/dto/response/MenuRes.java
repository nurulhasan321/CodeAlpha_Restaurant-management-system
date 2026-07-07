package com.restaurant.restaurant_management_Sys.dto.response;

public record MenuRes(
        Long id,
        String name,
        String description,
        String category,
        Double price,
        String availability,
        String imageUrl
) {
}
