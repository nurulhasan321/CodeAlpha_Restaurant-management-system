package com.restaurant.restaurant_management_Sys.repository;

import com.restaurant.restaurant_management_Sys.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);

    @Query("SELECT COUNT(r) > 0 FROM Reservation r WHERE r.restaurantTable.id = :tableId AND r.status NOT IN ('COMPLETED', 'CANCELLED') AND r.reservationTime >= :startTime AND r.reservationTime <= :endTime")
    boolean existsConflictingReservation(@Param("tableId") Long tableId, @Param("startTime") java.time.LocalDateTime startTime, @Param("endTime") java.time.LocalDateTime endTime);

    
    @Query("SELECT COUNT(r) FROM Reservation r WHERE UPPER(r.status) IN ('PENDING', 'CONFIRMED')")
    long countActiveReservations();

    
    @Query("SELECT COUNT(r) FROM Reservation r WHERE UPPER(r.status) IN ('PENDING', 'CONFIRMED') AND r.reservationTime >= :startOfDay AND r.reservationTime < :endOfDay")
    long countActiveReservationsForDate(@Param("startOfDay") java.time.LocalDateTime startOfDay, @Param("endOfDay") java.time.LocalDateTime endOfDay);
}

