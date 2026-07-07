package com.restaurant.restaurant_management_Sys.service;

import com.restaurant.restaurant_management_Sys.dto.response.UserProfileRes;
import com.restaurant.restaurant_management_Sys.entity.User;
import com.restaurant.restaurant_management_Sys.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserProfileRes getMyProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return mapToProfileRes(user);
    }

    public UserProfileRes addFundsToWallet(Double amount) {
        if (amount <= 0) {
            throw new RuntimeException("Amount must be positive");
        }
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setWalletBalance(user.getWalletBalance() + amount);
        userRepository.save(user);
        return mapToProfileRes(user);
    }

    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public void changePassword(com.restaurant.restaurant_management_Sys.dto.request.ChangePasswordReq req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(req.currentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
    }

    private UserProfileRes mapToProfileRes(User user) {
        return UserProfileRes.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .walletBalance(user.getWalletBalance())
                .build();
    }
}
