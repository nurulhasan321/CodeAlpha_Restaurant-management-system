package com.restaurant.restaurant_management_Sys.service;

import com.restaurant.restaurant_management_Sys.dto.request.ReservationReq;
import com.restaurant.restaurant_management_Sys.dto.response.ReservationRes;
import com.restaurant.restaurant_management_Sys.entity.Reservation;
import com.restaurant.restaurant_management_Sys.entity.RestaurantTable;
import com.restaurant.restaurant_management_Sys.entity.User;
import com.restaurant.restaurant_management_Sys.repository.ReservationRepository;
import com.restaurant.restaurant_management_Sys.repository.RestaurantTableRepository;
import com.restaurant.restaurant_management_Sys.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepo;
    private final RestaurantTableRepository tableRepo;
    private final UserRepository userRepo;

    public List<ReservationRes> getAllReservations() {
        return reservationRepo.findAll().stream().map(this::mapToRes).toList();
    }

    public List<ReservationRes> getMyReservations() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepo.findByEmail(email).orElse(null);
        if (user == null) return List.of();
        
        return reservationRepo.findByUserId(user.getId()).stream().map(this::mapToRes).toList();
    }

    public ReservationRes createReservation(ReservationReq req) {
        RestaurantTable table = tableRepo.findById(req.tableId())
                .orElseThrow(() -> new RuntimeException("Table not found"));

        
        java.time.LocalDateTime startTime = req.reservationTime().minusHours(2);
        java.time.LocalDateTime endTime = req.reservationTime().plusHours(2);
        
        boolean conflict = reservationRepo.existsConflictingReservation(table.getId(), startTime, endTime);
        if (conflict) {
            throw new RuntimeException("Table is already reserved for this time slot. Please choose another time or table.");
        }

        Reservation res = Reservation.builder()
                .reservationTime(req.reservationTime())
                .guestCount(req.guestCount())
                .status("PENDING")
                .restaurantTable(table)
                .build();

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email != null && !email.equals("anonymousUser")) {
            userRepo.findByEmail(email).ifPresent(res::setUser);
        }
        
        table.setStatus("RESERVED");
        tableRepo.save(table);

        return mapToRes(reservationRepo.save(res));
    }

    public ReservationRes updateReservationStatus(Long id, String status) {
        Reservation res = reservationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
                
        if ("COMPLETED".equalsIgnoreCase(res.getStatus()) || "CANCELLED".equalsIgnoreCase(res.getStatus())) {
            throw new RuntimeException("Cannot change status of a " + res.getStatus() + " reservation.");
        }
        
        res.setStatus(status);
        
        if ("CANCELLED".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) {
            RestaurantTable table = res.getRestaurantTable();
            if (table != null) {
                table.setStatus("AVAILABLE");
                tableRepo.save(table);
            }
        } else if ("PENDING".equalsIgnoreCase(status) || "CONFIRMED".equalsIgnoreCase(status)) {
            RestaurantTable table = res.getRestaurantTable();
            if (table != null) {
                table.setStatus("RESERVED");
                tableRepo.save(table);
            }
        }
        
        return mapToRes(reservationRepo.save(res));
    }

    public String deleteReservation(Long id) {
        Reservation res = reservationRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
                
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepo.findByEmail(email).orElse(null);
        
        boolean isAdminOrStaff = currentUser != null && 
            (currentUser.getRole().getName().equals("ADMIN") || currentUser.getRole().getName().equals("STAFF"));

        if (!isAdminOrStaff) {
            
            if (res.getUser() == null || currentUser == null || !res.getUser().getId().equals(currentUser.getId())) {
                throw new RuntimeException("Not authorized to delete this reservation.");
            }
            if ("CONFIRMED".equalsIgnoreCase(res.getStatus())) {
                throw new RuntimeException("Confirmed reservations cannot be cancelled online. Please call the restaurant at +1 (555) 0199.");
            }
        }
                
        RestaurantTable table = res.getRestaurantTable();
        if (table != null) {
            table.setStatus("AVAILABLE");
            tableRepo.save(table);
        }
        
        reservationRepo.delete(res);
        return "Reservation deleted successfully";
    }

    private ReservationRes mapToRes(Reservation res) {
        return new ReservationRes(
                res.getId(),
                res.getReservationTime(),
                res.getGuestCount(),
                res.getStatus(),
                res.getRestaurantTable() != null ? res.getRestaurantTable().getId() : null,
                res.getRestaurantTable() != null ? res.getRestaurantTable().getTableNumber() : "None",
                res.getUser() != null ? res.getUser().getName() : "Guest",
                res.getUser() != null ? res.getUser().getEmail() : "N/A",
                res.getUser() != null ? res.getUser().getPhone() : "N/A"
        );
    }
}
