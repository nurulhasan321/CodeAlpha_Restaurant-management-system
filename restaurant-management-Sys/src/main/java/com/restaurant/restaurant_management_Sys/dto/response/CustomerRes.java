package com.restaurant.restaurant_management_Sys.dto.response;

public record CustomerRes(
        Long id,
        String name,
        String email,
        String phone,
        Boolean active
) {
}
