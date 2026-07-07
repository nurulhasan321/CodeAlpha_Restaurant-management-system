package com.restaurant.restaurant_management_Sys.controller;

import com.restaurant.restaurant_management_Sys.dto.response.UserProfileRes;
import com.restaurant.restaurant_management_Sys.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me/profile")
    public ResponseEntity<UserProfileRes> getMyProfile() {
        return ResponseEntity.ok(userService.getMyProfile());
    }

    @PostMapping("/me/wallet/add")
    public ResponseEntity<UserProfileRes> addFundsToWallet(@RequestParam Double amount) {
        return ResponseEntity.ok(userService.addFundsToWallet(amount));
    }

    @PutMapping("/change-password")
    public ResponseEntity<java.util.Map<String, String>> changePassword(@RequestBody com.restaurant.restaurant_management_Sys.dto.request.ChangePasswordReq req) {
        userService.changePassword(req);
        return ResponseEntity.ok(java.util.Map.of("message", "Password changed successfully"));
    }
}
