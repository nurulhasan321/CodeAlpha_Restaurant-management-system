package com.restaurant.restaurant_management_Sys.dto.request;

public record SignupReq(
        String name,
        String email,
        String phone,
        String password
) {
}
