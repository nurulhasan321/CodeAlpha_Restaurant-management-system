package com.restaurant.restaurant_management_Sys.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressRes {
    private Long id;
    private String label;
    private String street;
    private String city;
    private String zipCode;
}
