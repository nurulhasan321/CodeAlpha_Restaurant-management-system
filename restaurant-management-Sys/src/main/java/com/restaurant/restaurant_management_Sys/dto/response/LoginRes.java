package com.restaurant.restaurant_management_Sys.dto.response;

public record LoginRes(
        String name,
        String email,
        String role
) {
}
