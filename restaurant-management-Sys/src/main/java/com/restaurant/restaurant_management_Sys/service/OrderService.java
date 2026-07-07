package com.restaurant.restaurant_management_Sys.service;

import com.restaurant.restaurant_management_Sys.dto.request.OrderReq;
import com.restaurant.restaurant_management_Sys.dto.request.OrderItemReq;
import com.restaurant.restaurant_management_Sys.dto.response.OrderRes;
import com.restaurant.restaurant_management_Sys.dto.response.OrderItemRes;
import com.restaurant.restaurant_management_Sys.entity.MenuItem;
import com.restaurant.restaurant_management_Sys.entity.Order;
import com.restaurant.restaurant_management_Sys.entity.OrderItem;
import com.restaurant.restaurant_management_Sys.entity.RestaurantTable;
import com.restaurant.restaurant_management_Sys.entity.User;
import com.restaurant.restaurant_management_Sys.repository.MenuRepository;
import com.restaurant.restaurant_management_Sys.repository.OrderRepository;
import com.restaurant.restaurant_management_Sys.repository.RestaurantTableRepository;
import com.restaurant.restaurant_management_Sys.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.restaurant.restaurant_management_Sys.repository.AddressRepository;
import com.restaurant.restaurant_management_Sys.entity.Address;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepo;
    private final MenuRepository menuRepo;
    private final RestaurantTableRepository tableRepo;
    private final UserRepository userRepo;
    private final AddressRepository addressRepo;
    private final InventoryService inventoryService;

    public List<OrderRes> getAllOrders() {
        return orderRepo.findAll().stream().map(this::mapToOrderRes).toList();
    }

    public List<OrderRes> getMyOrders() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) return List.of();
        
        return orderRepo.findByUserId(user.getId()).stream().map(this::mapToOrderRes).toList();
    }

    @Transactional
    public OrderRes createOrder(OrderReq request) {
        Order order = new Order();
        order.setOrderType(request.orderType());
        order.setStatus("PENDING");

        if (request.tableId() != null) {
            RestaurantTable table = tableRepo.findById(request.tableId())
                    .orElseThrow(() -> new RuntimeException("Table not found"));
            order.setRestaurantTable(table);
            
            if ("DINE_IN".equalsIgnoreCase(request.orderType())) {
                table.setStatus("OCCUPIED");
                tableRepo.save(table);
            }
        }

        if (request.addressId() != null) {
            Address address = addressRepo.findById(request.addressId())
                    .orElseThrow(() -> new RuntimeException("Address not found"));
            order.setDeliveryAddress(address);
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email != null && !email.equals("anonymousUser")) {
            userRepo.findByEmail(email).ifPresent(order::setUser);
        }

        double totalAmount = 0.0;
        
        List<Long> menuItemIds = request.items().stream()
                .map(itemReq -> itemReq.menuItemId())
                .toList();
        
        java.util.Map<Long, MenuItem> menuItemMap = menuRepo.findAllById(menuItemIds).stream()
                .collect(Collectors.toMap(MenuItem::getId, item -> item));
        
        Set<OrderItem> orderItems = request.items().stream().map(itemReq -> {
            MenuItem menuItem = menuItemMap.get(itemReq.menuItemId());
            if (menuItem == null) {
                throw new RuntimeException("Menu item not found: " + itemReq.menuItemId());
            }
            
            double subtotal = menuItem.getPrice() * itemReq.quantity();
            
            OrderItem orderItem = OrderItem.builder()
                    .menuItem(menuItem)
                    .quantity(itemReq.quantity())
                    .unitPrice(menuItem.getPrice())
                    .subtotal(subtotal)
                    .specialNote(itemReq.specialNote() != null ? itemReq.specialNote() : "")
                    .order(order)
                    .build();
            
            return orderItem;
        }).collect(Collectors.toSet());

        for (OrderItem item : orderItems) {
            totalAmount += item.getSubtotal();
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount);

        
        String paymentMethod = request.paymentMethod() != null ? request.paymentMethod() : "PAY_AT_COUNTER";
        order.setPaymentMethod(paymentMethod);
        
        if ("WALLET".equals(paymentMethod)) {
            User user = order.getUser();
            if (user == null) {
                throw new RuntimeException("Must be logged in to pay with wallet");
            }
            if (user.getWalletBalance() == null || user.getWalletBalance() < totalAmount) {
                throw new RuntimeException("Insufficient wallet balance");
            }
            user.setWalletBalance(user.getWalletBalance() - totalAmount);
            userRepo.save(user);
            order.setPaymentStatus("PAID");
        } else {
            order.setPaymentStatus("PENDING");
        }

        Order savedOrder = orderRepo.save(order);
        return mapToOrderRes(savedOrder);
    }

    @Transactional
    public OrderRes updateOrderStatus(Long id, String newStatus) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
                
        if ("COMPLETED".equalsIgnoreCase(order.getStatus()) || "CANCELLED".equalsIgnoreCase(order.getStatus())) {
            throw new RuntimeException("Cannot change status of a " + order.getStatus() + " order.");
        }
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepo.findByEmail(email).orElse(null);
        
        boolean isAdminOrStaff = currentUser != null && 
            (currentUser.getRole().getName().equals("ADMIN") || currentUser.getRole().getName().equals("STAFF"));

        if (!isAdminOrStaff) {
            
            if (currentUser == null || order.getUser() == null || !order.getUser().getId().equals(currentUser.getId())) {
                throw new RuntimeException("Not authorized to update this order.");
            }
            if (!"CANCELLED".equalsIgnoreCase(newStatus) || !"PENDING".equalsIgnoreCase(order.getStatus())) {
                throw new RuntimeException("Customers can only cancel PENDING orders.");
            }
        }
        
        return updateOrderStatusSystem(id, newStatus);
    }

    @Transactional
    public OrderRes updateOrderStatusSystem(Long id, String newStatus) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        
        if ("PREPARING".equalsIgnoreCase(newStatus) && !"PREPARING".equalsIgnoreCase(order.getStatus())) {
            inventoryService.deductForOrder(order);
        }

        
        if ("COMPLETED".equalsIgnoreCase(newStatus) || "CANCELLED".equalsIgnoreCase(newStatus)) {
            if ("DINE_IN".equalsIgnoreCase(order.getOrderType()) && order.getRestaurantTable() != null) {
                RestaurantTable table = order.getRestaurantTable();
                table.setStatus("AVAILABLE");
                tableRepo.save(table);
            }
        }

        
        if ("CANCELLED".equalsIgnoreCase(newStatus) && !"CANCELLED".equalsIgnoreCase(order.getStatus())) {
            if ("WALLET".equalsIgnoreCase(order.getPaymentMethod()) && "PAID".equalsIgnoreCase(order.getPaymentStatus())) {
                User user = order.getUser();
                if (user != null) {
                    double currentBalance = user.getWalletBalance() != null ? user.getWalletBalance() : 0.0;
                    user.setWalletBalance(currentBalance + order.getTotalAmount());
                    userRepo.save(user);
                    order.setPaymentStatus("REFUNDED");
                }
            }
        }

        order.setStatus(newStatus);
        
        return mapToOrderRes(orderRepo.save(order));
    }

    private OrderRes mapToOrderRes(Order order) {
        List<OrderItemRes> items = order.getOrderItems().stream().map(item -> new OrderItemRes(
                item.getId(),
                item.getMenuItem().getName(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getSubtotal(),
                item.getSpecialNote()
        )).toList();

        String addressStr = null;
        if (order.getDeliveryAddress() != null) {
            Address addr = order.getDeliveryAddress();
            addressStr = addr.getLabel() + " - " + addr.getStreet() + ", " + addr.getCity() + " " + addr.getZipCode();
        }

        return new OrderRes(
                order.getId(),
                order.getOrderType(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getUser() != null ? order.getUser().getName() : "Guest",
                order.getRestaurantTable() != null ? order.getRestaurantTable().getTableNumber() : null,
                addressStr,
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                items,
                order.getCreatedAt()
        );
    }
}
