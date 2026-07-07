package com.restaurant.restaurant_management_Sys.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginReq(
        @NotBlank(message = "Email is required")
        String email,
        
        @NotBlank(message = "Password is required")
        String password
) {
}
