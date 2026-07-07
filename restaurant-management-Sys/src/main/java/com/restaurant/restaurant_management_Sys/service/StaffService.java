package com.restaurant.restaurant_management_Sys.service;

import com.restaurant.restaurant_management_Sys.dto.request.StaffReq;
import com.restaurant.restaurant_management_Sys.dto.response.StaffRes;
import com.restaurant.restaurant_management_Sys.entity.Role;
import com.restaurant.restaurant_management_Sys.entity.User;
import com.restaurant.restaurant_management_Sys.repository.RoleRepository;
import com.restaurant.restaurant_management_Sys.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder passwordEncoder;

    public List<StaffRes> getAllStaff() {
        return userRepo.findAll().stream()
                .filter(u -> !"CUSTOMER".equalsIgnoreCase(u.getRole().getName()))
                .map(this::mapToRes)
                .toList();
    }

    public StaffRes createStaff(StaffReq req) {
        if (userRepo.findByEmail(req.email()).isPresent()) {
            throw new RuntimeException("User with this email already exists.");
        }

        Role role = roleRepo.findByName(req.roleName().toUpperCase())
                .orElseGet(() -> {
                    Role newRole = Role.builder().name(req.roleName().toUpperCase()).build();
                    return roleRepo.save(newRole);
                });

        User user = User.builder()
                .name(req.name())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .phone(req.phone())
                .role(role)
                .build();

        return mapToRes(userRepo.save(user));
    }

    public String deleteStaff(Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        if ("CUSTOMER".equalsIgnoreCase(user.getRole().getName())) {
            throw new RuntimeException("Cannot delete customer through this API");
        }
        
        userRepo.delete(user);
        return "Staff member deleted successfully";
    }

    private StaffRes mapToRes(User user) {
        return new StaffRes(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().getName() : "NONE"
        );
    }
}
