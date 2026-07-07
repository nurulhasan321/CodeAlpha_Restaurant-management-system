package com.restaurant.restaurant_management_Sys.repository;

import com.restaurant.restaurant_management_Sys.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    List<User> findByRoleName(String roleName);

    
    @Query("SELECT COUNT(u) FROM User u WHERE UPPER(u.role.name) = :roleName")
    long countByRoleName(@Param("roleName") String roleName);
}
