package com.restaurant.restaurant_management_Sys.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "restaurant_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantSettings extends BaseEntity {

    @jakarta.persistence.Id
    @jakarta.persistence.GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    private String name = "Savory Restaurant";
    private String address = "123 Culinary Boulevard, Food City, FC 90210";
    private String phone = "+1 (555) 0199";
    private String email = "hello@savory.com";
    private String openingTime = "09:00";
    private String closingTime = "22:00";
    private String currency = "USD";
    private Double taxRate = 5.0;

    
    private Boolean notifyNewOrders = true;
    private Boolean notifyNewReservations = true;
    private Boolean notifyLowStock = true;
    private Boolean notifyOrderCompleted = true;
    private Boolean notifyDailyReport = true;

    
    private Integer autoUpdatePendingToPreparing = 1;
    private Integer autoUpdatePreparingToReady = 2;
    private Integer autoUpdateReadyToCompleted = 2;
    private Integer autoUpdateOutForDeliveryToCompleted = 3;
}
