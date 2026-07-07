package com.restaurant.restaurant_management_Sys.repository;

import com.restaurant.restaurant_management_Sys.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"orderItems"})
    List<Order> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"orderItems"})
    List<Order> findByStatusNotIn(List<String> statuses);

    @EntityGraph(attributePaths = {"orderItems"})
    Optional<Order> findById(Long id);

    @EntityGraph(attributePaths = {"orderItems"})
    List<Order> findAll();

    
    @EntityGraph(attributePaths = {"orderItems", "orderItems.menuItem"})
    List<Order> findByStatusIgnoreCase(String status);

    @EntityGraph(attributePaths = {"orderItems", "orderItems.menuItem"})
    List<Order> findByStatusIgnoreCaseAndCreatedAtAfter(String status, java.time.LocalDateTime createdAt);
}

