package com.restaurant.restaurant_management_Sys.dto.request;

public record NotificationSettingsReq(
        Boolean notifyNewOrders,
        Boolean notifyNewReservations,
        Boolean notifyLowStock,
        Boolean notifyOrderCompleted,
        Boolean notifyDailyReport
) {
}
