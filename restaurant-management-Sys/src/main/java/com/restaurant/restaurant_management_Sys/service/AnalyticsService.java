package com.restaurant.restaurant_management_Sys.service;

import com.restaurant.restaurant_management_Sys.dto.response.AnalyticsRes;
import com.restaurant.restaurant_management_Sys.entity.Order;
import com.restaurant.restaurant_management_Sys.entity.OrderItem;
import com.restaurant.restaurant_management_Sys.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepo;
    private final UserRepository userRepo;
    private final RestaurantTableRepository tableRepo;
    private final ReservationRepository reservationRepo;
    private final InventoryItemRepository inventoryRepo;

    public AnalyticsRes getDashboardStats() {
        
        java.time.LocalDateTime startOfDay = java.time.LocalDate.now().atStartOfDay();
        List<Order> completedOrders = orderRepo.findByStatusIgnoreCaseAndCreatedAtAfter("COMPLETED", startOfDay);

        long totalOrders = completedOrders.size();

        double revenue = completedOrders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();

        
        long customersCount = userRepo.countByRoleName("CUSTOMER");
        long availableTables = tableRepo.countByStatusIgnoreCase("AVAILABLE");
        java.time.LocalDateTime endOfDay = startOfDay.plusDays(1);
        long pendingReservations = reservationRepo.countActiveReservationsForDate(startOfDay, endOfDay);
        long lowStockItems = inventoryRepo.countLowOrOutOfStock();

        
        Map<String, Long> orderTypes = new HashMap<>();
        long dineIn   = completedOrders.stream().filter(o -> "DINE_IN".equalsIgnoreCase(o.getOrderType())).count();
        long takeaway = completedOrders.stream().filter(o -> "TAKEAWAY".equalsIgnoreCase(o.getOrderType())).count();
        long delivery = completedOrders.stream().filter(o -> "DELIVERY".equalsIgnoreCase(o.getOrderType())).count();
        orderTypes.put("Dine In", dineIn);
        orderTypes.put("Takeaway", takeaway);
        orderTypes.put("Delivery", delivery);

        
        Map<String, Long> itemCounts = new HashMap<>();
        for (Order order : completedOrders) {
            for (OrderItem item : order.getOrderItems()) {
                String itemName = item.getMenuItem() != null ? item.getMenuItem().getName() : "Unknown";
                itemCounts.merge(itemName, (long) item.getQuantity(), Long::sum);
            }
        }

        List<AnalyticsRes.PopularItem> popularItems = itemCounts.entrySet().stream()
                .map(e -> new AnalyticsRes.PopularItem(e.getKey(), e.getValue()))
                .sorted((a, b) -> b.count().compareTo(a.count()))
                .limit(5)
                .collect(Collectors.toList());

        return new AnalyticsRes(
                totalOrders,
                revenue,
                customersCount,
                availableTables,
                pendingReservations,
                lowStockItems,
                orderTypes,
                popularItems
        );
    }
}
