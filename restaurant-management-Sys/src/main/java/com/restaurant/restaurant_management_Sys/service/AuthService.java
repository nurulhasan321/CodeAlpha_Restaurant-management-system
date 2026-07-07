package com.restaurant.restaurant_management_Sys.service;

import com.restaurant.restaurant_management_Sys.dto.request.LoginReq;
import com.restaurant.restaurant_management_Sys.dto.response.LoginRes;
import com.restaurant.restaurant_management_Sys.dto.request.SignupReq;
import com.restaurant.restaurant_management_Sys.dto.response.SignupRes;
import com.restaurant.restaurant_management_Sys.dto.response.TokenResponse;
import com.restaurant.restaurant_management_Sys.entity.Role;
import com.restaurant.restaurant_management_Sys.entity.User;

import com.restaurant.restaurant_management_Sys.exception.UserAlreadyExistsException;
import com.restaurant.restaurant_management_Sys.exception.UserNotFoundException;
import com.restaurant.restaurant_management_Sys.repository.RoleRepository;
import com.restaurant.restaurant_management_Sys.repository.UserRepository;
import com.restaurant.restaurant_management_Sys.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;

    private final RoleRepository roleRepo;

    private final PasswordEncoder passwordEncoder;

    private final JwtUtil jwtUtil;

    private final AuthenticationManager authenticationManager;

    public TokenResponse login(LoginReq request){

        authenticationManager.authenticate (
                new UsernamePasswordAuthenticationToken (
                        request.email (),
                        request.password ()
                )
        );

        User user = userRepo.findByEmail (request.email ())
                .orElseThrow (()-> new
                        UserNotFoundException ("User Not Found"));

        String accessToken = jwtUtil.generateAccessToken (user.getEmail ());
        String refreshToken = jwtUtil.generateRefreshToken (user.getEmail ());

        return new TokenResponse (
                user.getName (),
                user.getEmail (),
                user.getRole ().getName (),
                accessToken,
                refreshToken
        );
    }

    public SignupRes signupCustomer(SignupReq signupReq){

        if(userRepo.existsByEmail (signupReq.email ())){
            throw new UserAlreadyExistsException ("User Already Registered!");
        }

        Role customerRole = roleRepo.findByName("CUSTOMER")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName("CUSTOMER");
                    return roleRepo.save(r);
                });

        String encodedPass = passwordEncoder.encode (signupReq.password ());

        User savedUser = userRepo.save (User.builder ()
                .name (signupReq.name ())
                .email (signupReq.email ())
                .phone (signupReq.phone ())
                .password (encodedPass)
                .role (customerRole)
                .build ());

        return new SignupRes (
                savedUser.getId (),
                savedUser.getName (),
                savedUser.getEmail ()
        );
    }

    public SignupRes signupAdmin(SignupReq request){

        if(userRepo.existsByEmail (request.email ())){
            throw new UserAlreadyExistsException ("User already registered");
        }

        Role adminRole = roleRepo.findByName("ADMIN")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setName("ADMIN");
                    return roleRepo.save(r);
                });

        String hashedPass = passwordEncoder.encode (request.password ());
        User savedUser = userRepo.save (User.builder ()
                .name (request.name ())
                .email (request.email ())
                .password (hashedPass)
                .phone (request.phone ())
                .role (adminRole)
                .build ());

        return new SignupRes (
                savedUser.getId (),
                savedUser.getName (),
                savedUser.getEmail ()
        );
    }

    public String refreshToken(String refreshToken) {
        if (jwtUtil.validateToken(refreshToken)) {
            String email = jwtUtil.extractEmail(refreshToken);
            return jwtUtil.generateAccessToken(email);
        } else {
            throw new RuntimeException("Invalid refresh token");
        }
    }

    public LoginRes getCurrentUser(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new UserNotFoundException("User not found"));
        return new LoginRes(
            user.getName(),
            user.getEmail(),
            user.getRole().getName()
        );
    }

    public void resetPasswordDirectly(String email, String newPassword) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);
    }
}
