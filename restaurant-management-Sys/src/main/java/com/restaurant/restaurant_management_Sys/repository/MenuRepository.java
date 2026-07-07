package com.restaurant.restaurant_management_Sys.repository;

import com.restaurant.restaurant_management_Sys.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuRepository extends JpaRepository<MenuItem,Long> {

    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);
}
