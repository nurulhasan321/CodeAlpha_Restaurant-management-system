package com.restaurant.restaurant_management_Sys.dto.request;

public record ChangePasswordReq(
        String currentPassword,
        String newPassword
) {
}
