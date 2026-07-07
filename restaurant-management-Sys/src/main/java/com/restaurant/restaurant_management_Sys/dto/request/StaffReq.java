package com.restaurant.restaurant_management_Sys.dto.request;

public record StaffReq(
        String name,
        String email,
        String password,
        String phone,
        String roleName
) {
}
