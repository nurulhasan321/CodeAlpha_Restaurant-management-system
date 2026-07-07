package com.restaurant.restaurant_management_Sys.dto.request;

public record MenuReq(
        String name,
        String description,
        String category,
        Double price,
        String availability,
        String imageUrl
) {
}
