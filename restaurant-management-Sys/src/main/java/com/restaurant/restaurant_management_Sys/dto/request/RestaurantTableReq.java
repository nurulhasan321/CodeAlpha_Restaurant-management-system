package com.restaurant.restaurant_management_Sys.dto.request;

public record RestaurantTableReq(
        String tableNumber,
        Integer capacity,
        String status,
        String location
) {
}
