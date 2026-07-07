package com.restaurant.restaurant_management_Sys.dto.request;

public record RestaurantSettingsReq(
        String name,
        String address,
        String phone,
        String email,
        String openingTime,
        String closingTime,
        String currency,
        Double taxRate,
        Integer autoUpdatePendingToPreparing,
        Integer autoUpdatePreparingToReady,
        Integer autoUpdateReadyToCompleted,
        Integer autoUpdateOutForDeliveryToCompleted
) {
}
