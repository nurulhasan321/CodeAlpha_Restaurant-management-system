package com.restaurant.restaurant_management_Sys.security;

import com.restaurant.restaurant_management_Sys.entity.User;
import com.restaurant.restaurant_management_Sys.exception.UserNotFoundException;
import com.restaurant.restaurant_management_Sys.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername (String email)
            throws UsernameNotFoundException {

        User user = userRepo.findByEmail (email)
                .orElseThrow (()-> new UsernameNotFoundException ("User not found"));



        return org.springframework.security.core.userdetails.User
                .builder()
                .username (user.getEmail ())
                .password (user.getPassword ())
                .roles (user.getRole ().getName ())
                .build ();
    }
}
