package com.restaurant.restaurant_management_Sys.repository;

import com.restaurant.restaurant_management_Sys.entity.RestaurantSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantSettingsRepository extends JpaRepository<RestaurantSettings, Long> {
}
