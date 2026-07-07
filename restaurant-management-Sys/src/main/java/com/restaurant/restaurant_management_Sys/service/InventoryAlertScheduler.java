package com.restaurant.restaurant_management_Sys.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InventoryAlertScheduler {

    private final InventoryService inventoryService;

    
    @Scheduled(fixedRate = 3600000)
    public void scheduleLowStockCheck() {
        System.out.println("Running scheduled check for low stock inventory items...");
        inventoryService.checkAndAlertLowStock();
    }
}
