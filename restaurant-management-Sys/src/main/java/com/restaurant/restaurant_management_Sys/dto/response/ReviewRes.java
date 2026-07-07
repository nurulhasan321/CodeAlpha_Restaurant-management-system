package com.restaurant.restaurant_management_Sys.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewRes {
    private Long id;
    private Long orderId;
    private Integer foodRating;
    private Integer deliveryRating;
    private String comment;
    private String userName;
    private LocalDateTime createdAt;
}
