package com.restaurant.restaurant_management_Sys.controller;

import com.restaurant.restaurant_management_Sys.dto.request.AddressReq;
import com.restaurant.restaurant_management_Sys.dto.response.AddressRes;
import com.restaurant.restaurant_management_Sys.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    public ResponseEntity<AddressRes> addAddress(@Valid @RequestBody AddressReq req) {
        return ResponseEntity.ok(addressService.addAddress(req));
    }

    @GetMapping("/me")
    public ResponseEntity<List<AddressRes>> getMyAddresses() {
        return ResponseEntity.ok(addressService.getMyAddresses());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.ok("Address deleted successfully");
    }
}
