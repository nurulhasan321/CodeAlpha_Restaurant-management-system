package com.restaurant.restaurant_management_Sys.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record SignupReq(
        @NotBlank(message = "Name is required")
        String name,
        
        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email address")
        String email,
        
        @NotBlank(message = "Phone number is required")
        String phone,
        
        @NotBlank(message = "Password is required")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$", message = "Password must be at least 8 characters and contain at least one letter and one number")
        String password
) {
}
