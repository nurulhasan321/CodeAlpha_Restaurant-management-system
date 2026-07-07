package com.restaurant.restaurant_management_Sys.dto.response;

import java.time.LocalDateTime;

public record ReservationRes(
        Long id,
        LocalDateTime reservationTime,
        Integer guestCount,
        String status,
        Long tableId,
        String tableNumber,
        String customerName,
        String customerEmail,
        String customerPhone
) {
}
