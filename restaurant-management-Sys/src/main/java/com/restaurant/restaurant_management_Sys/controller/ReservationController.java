package com.restaurant.restaurant_management_Sys.controller;

import com.restaurant.restaurant_management_Sys.dto.request.ReservationReq;
import com.restaurant.restaurant_management_Sys.dto.response.ReservationRes;
import com.restaurant.restaurant_management_Sys.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    public ResponseEntity<List<ReservationRes>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @GetMapping("/my-reservations")
    public ResponseEntity<List<ReservationRes>> getMyReservations() {
        return ResponseEntity.ok(reservationService.getMyReservations());
    }

    @PostMapping("/add")
    public ResponseEntity<ReservationRes> createReservation(@RequestBody ReservationReq req) {
        return ResponseEntity.ok(reservationService.createReservation(req));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ReservationRes> updateReservationStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(reservationService.updateReservationStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.deleteReservation(id));
    }
}
