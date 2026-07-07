package com.restaurant.restaurant_management_Sys.service;

import com.restaurant.restaurant_management_Sys.dto.request.NotificationSettingsReq;
import com.restaurant.restaurant_management_Sys.dto.request.RestaurantSettingsReq;
import com.restaurant.restaurant_management_Sys.entity.RestaurantSettings;
import com.restaurant.restaurant_management_Sys.repository.RestaurantSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final RestaurantSettingsRepository settingsRepo;

    public RestaurantSettings getSettings() {
        List<RestaurantSettings> settingsList = settingsRepo.findAll();
        if (settingsList.isEmpty()) {
            return settingsRepo.save(new RestaurantSettings()); 
        }
        return settingsList.get(0); 
    }

    public RestaurantSettings updateRestaurantInfo(RestaurantSettingsReq req) {
        RestaurantSettings settings = getSettings();
        
        settings.setName(req.name());
        settings.setAddress(req.address());
        settings.setPhone(req.phone());
        settings.setEmail(req.email());
        settings.setOpeningTime(req.openingTime());
        settings.setClosingTime(req.closingTime());
        settings.setCurrency(req.currency());
        settings.setTaxRate(req.taxRate());
        
        if (req.autoUpdatePendingToPreparing() != null) settings.setAutoUpdatePendingToPreparing(req.autoUpdatePendingToPreparing());
        if (req.autoUpdatePreparingToReady() != null) settings.setAutoUpdatePreparingToReady(req.autoUpdatePreparingToReady());
        if (req.autoUpdateReadyToCompleted() != null) settings.setAutoUpdateReadyToCompleted(req.autoUpdateReadyToCompleted());
        if (req.autoUpdateOutForDeliveryToCompleted() != null) settings.setAutoUpdateOutForDeliveryToCompleted(req.autoUpdateOutForDeliveryToCompleted());
        
        return settingsRepo.save(settings);
    }

    public RestaurantSettings updateNotificationPreferences(NotificationSettingsReq req) {
        RestaurantSettings settings = getSettings();
        
        settings.setNotifyNewOrders(req.notifyNewOrders());
        settings.setNotifyNewReservations(req.notifyNewReservations());
        settings.setNotifyLowStock(req.notifyLowStock());
        settings.setNotifyOrderCompleted(req.notifyOrderCompleted());
        settings.setNotifyDailyReport(req.notifyDailyReport());
        
        return settingsRepo.save(settings);
    }
}
