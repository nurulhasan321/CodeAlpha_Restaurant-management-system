package com.restaurant.restaurant_management_Sys.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileRes {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Double walletBalance;
}
