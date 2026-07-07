package com.restaurant.restaurant_management_Sys.repository;

import com.restaurant.restaurant_management_Sys.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    
    @Query("SELECT COUNT(i) FROM InventoryItem i WHERE UPPER(i.status) IN ('LOW_STOCK', 'OUT_OF_STOCK')")
    long countLowOrOutOfStock();
}
