package com.restaurant.restaurant_management_Sys.dto.request;

import java.util.List;

public record OrderReq(
        String orderType, 
        Long tableId,     
        String paymentMethod, 
        Long addressId,       
        List<OrderItemReq> items
) {
}
