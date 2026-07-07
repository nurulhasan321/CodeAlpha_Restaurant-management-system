package com.restaurant.restaurant_management_Sys.dto.response;

public record CategoryRes(
        Long categoryId,
        String name,
        String description,
        String status,
        Integer noOfItems
) {
}
