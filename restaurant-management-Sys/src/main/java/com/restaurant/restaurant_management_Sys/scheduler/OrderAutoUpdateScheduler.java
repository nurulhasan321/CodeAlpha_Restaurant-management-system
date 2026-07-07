package com.restaurant.restaurant_management_Sys.scheduler;

import com.restaurant.restaurant_management_Sys.entity.Order;
import com.restaurant.restaurant_management_Sys.repository.OrderRepository;
import com.restaurant.restaurant_management_Sys.service.OrderService;
import com.restaurant.restaurant_management_Sys.service.SettingsService;
import com.restaurant.restaurant_management_Sys.entity.RestaurantSettings;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.restaurant.restaurant_management_Sys.service.SseService;

@Component
@RequiredArgsConstructor
public class OrderAutoUpdateScheduler {

    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final SseService sseService;
    private final SettingsService settingsService;

    
    @Scheduled(fixedDelay = 30000)
    public void autoUpdateOrders() {
        System.out.println("🤖 Running automatic order status updates...");
        
        
        List<Order> activeOrders = orderRepository.findByStatusNotIn(List.of("COMPLETED", "CANCELLED"));
        LocalDateTime now = LocalDateTime.now();

        
        RestaurantSettings settings = settingsService.getSettings();
        int pendingToPreparing = settings.getAutoUpdatePendingToPreparing() != null ? settings.getAutoUpdatePendingToPreparing() : 1;
        int preparingToReady = settings.getAutoUpdatePreparingToReady() != null ? settings.getAutoUpdatePreparingToReady() : 2;
        int readyToCompleted = settings.getAutoUpdateReadyToCompleted() != null ? settings.getAutoUpdateReadyToCompleted() : 2;
        int outForDeliveryToCompleted = settings.getAutoUpdateOutForDeliveryToCompleted() != null ? settings.getAutoUpdateOutForDeliveryToCompleted() : 3;

        for (Order order : activeOrders) {
            String currentStatus = order.getStatus();
            String orderType = order.getOrderType();
            
            
            LocalDateTime lastUpdate = order.getUpdatedAt() != null ? order.getUpdatedAt() : order.getCreatedAt();
            long minutesElapsed = ChronoUnit.MINUTES.between(lastUpdate, now);

            try {
                if ("PENDING".equalsIgnoreCase(currentStatus) && minutesElapsed >= pendingToPreparing) {
                    orderService.updateOrderStatusSystem(order.getId(), "PREPARING");
                    sseService.sendOrderStatusUpdate(order.getId(), "PREPARING");
                    System.out.println("🔄 Auto-updated Order #" + order.getId() + " from PENDING -> PREPARING");
                } 
                else if ("PREPARING".equalsIgnoreCase(currentStatus) && minutesElapsed >= preparingToReady) {
                    if ("DELIVERY".equalsIgnoreCase(orderType)) {
                        orderService.updateOrderStatusSystem(order.getId(), "OUT_FOR_DELIVERY");
                        sseService.sendOrderStatusUpdate(order.getId(), "OUT_FOR_DELIVERY");
                        System.out.println("🔄 Auto-updated Order #" + order.getId() + " from PREPARING -> OUT_FOR_DELIVERY");
                    } else {
                        orderService.updateOrderStatusSystem(order.getId(), "READY");
                        sseService.sendOrderStatusUpdate(order.getId(), "READY");
                        System.out.println("🔄 Auto-updated Order #" + order.getId() + " from PREPARING -> READY");
                    }
                }
                else if ("READY".equalsIgnoreCase(currentStatus) && minutesElapsed >= readyToCompleted) {
                    orderService.updateOrderStatusSystem(order.getId(), "COMPLETED");
                    sseService.sendOrderStatusUpdate(order.getId(), "COMPLETED");
                    System.out.println("🔄 Auto-updated Order #" + order.getId() + " from READY -> COMPLETED");
                }
                else if ("OUT_FOR_DELIVERY".equalsIgnoreCase(currentStatus) && minutesElapsed >= outForDeliveryToCompleted) {
                    orderService.updateOrderStatusSystem(order.getId(), "COMPLETED");
                    sseService.sendOrderStatusUpdate(order.getId(), "COMPLETED");
                    System.out.println("🔄 Auto-updated Order #" + order.getId() + " from OUT_FOR_DELIVERY -> COMPLETED");
                }
            } catch (Exception e) {
                System.err.println("❌ Failed to auto-update order #" + order.getId() + ": " + e.getMessage());
            }
        }
    }
}
