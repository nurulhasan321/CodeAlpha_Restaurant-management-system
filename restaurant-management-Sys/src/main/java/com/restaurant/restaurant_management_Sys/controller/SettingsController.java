package com.restaurant.restaurant_management_Sys.controller;

import com.restaurant.restaurant_management_Sys.dto.request.NotificationSettingsReq;
import com.restaurant.restaurant_management_Sys.dto.request.RestaurantSettingsReq;
import com.restaurant.restaurant_management_Sys.entity.RestaurantSettings;
import com.restaurant.restaurant_management_Sys.service.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public ResponseEntity<RestaurantSettings> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PutMapping("/restaurant")
    public ResponseEntity<RestaurantSettings> updateRestaurantInfo(@RequestBody RestaurantSettingsReq req) {
        return ResponseEntity.ok(settingsService.updateRestaurantInfo(req));
    }

    @PutMapping("/notifications")
    public ResponseEntity<RestaurantSettings> updateNotificationPreferences(@RequestBody NotificationSettingsReq req) {
        return ResponseEntity.ok(settingsService.updateNotificationPreferences(req));
    }
}
