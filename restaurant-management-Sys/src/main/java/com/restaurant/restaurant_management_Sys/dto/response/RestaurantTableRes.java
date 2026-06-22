package com.restaurant.restaurant_management_Sys.dto.response;


public record RestaurantTableRes(
        Long id,
        String tableNumber,
        Integer capacity,
        String status,
        String location
) {
}
