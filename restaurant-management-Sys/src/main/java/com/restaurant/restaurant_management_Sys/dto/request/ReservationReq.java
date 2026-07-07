package com.restaurant.restaurant_management_Sys.dto.request;

import java.time.LocalDateTime;

public record ReservationReq(
        LocalDateTime reservationTime,
        Integer guestCount,
        Long tableId
) {
}
