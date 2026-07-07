package com.restaurant.restaurant_management_Sys.config;

import com.restaurant.restaurant_management_Sys.entity.Role;
import com.restaurant.restaurant_management_Sys.entity.User;
import com.restaurant.restaurant_management_Sys.repository.RoleRepository;
import com.restaurant.restaurant_management_Sys.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${ADMIN_PASSWORD:admin123}")
    private String defaultAdminPassword;

    @Override
    public void run(String... args) throws Exception {
        
        Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> {
            Role newRole = new Role();
            newRole.setName("ADMIN");
            return roleRepository.save(newRole);
        });

        
        roleRepository.findByName("CUSTOMER").orElseGet(() -> {
            Role newRole = new Role();
            newRole.setName("CUSTOMER");
            return roleRepository.save(newRole);
        });

        
        if (!userRepository.existsByEmail("admin@savory.com")) {
            User admin = User.builder()
                    .name("Super Admin")
                    .email("admin@savory.com")
                    .password(passwordEncoder.encode(defaultAdminPassword)) 
                    .phone("1234567890")
                    .role(adminRole)
                    .emailVerified(true)
                    .build();

            userRepository.save(admin);
            System.out.println("✅ Default Admin User created -> Email: admin@savory.com | Password: [from environment or default]");
        }
    }
}
