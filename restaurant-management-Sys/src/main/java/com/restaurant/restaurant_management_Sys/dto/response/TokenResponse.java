package com.restaurant.restaurant_management_Sys.dto.response;

public record TokenResponse(
        String name,
        String email,
        String role,
        String accessToken,
        String refreshToken
) {
}
