package com.restaurant.restaurant_management_Sys.service;

import com.restaurant.restaurant_management_Sys.dto.request.LoginReq;
import com.restaurant.restaurant_management_Sys.dto.response.LoginRes;
import com.restaurant.restaurant_management_Sys.dto.request.SignupReq;
import com.restaurant.restaurant_management_Sys.dto.response.SignupRes;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@Service
@RequiredArgsConstructor
public class AuthService {


    private final UserRepository userRepo;

    private final RoleRepository roleRepo;

    private final PasswordEncoder passwordEncoder;

    private final JwtUtil jwtUtil;

    private final AuthenticationManager authenticationManager;

    public LoginRes login(LoginReq request){

        authenticationManager.authenticate (
                new UsernamePasswordAuthenticationToken (
                        request.email (),
                        request.password ()
                )
        );

        User user = userRepo.findByEmail (request.email ())
                .orElseThrow (()-> new
                        UserNotFoundException ("User Not Found"));



        String token = jwtUtil.generateToken (user.getEmail ());

        return new LoginRes (
                user.getName (),
                user.getEmail (),
                user.getRole ().getName (),
                token
        );
    }


    public SignupRes signupCustomer(SignupReq signupReq){

        if(userRepo.existsByEmail (signupReq.email ())){
            throw new UserNotFoundException ("User Already Registered!");
        }

        Role customerRole = roleRepo.findByName ("CUSTOMER")
                .orElseThrow (() -> new RuntimeException ("Role not found"));

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

        Role adminRole = roleRepo.findByName ("ADMIN")
                .orElseThrow (()-> new RuntimeException ("Role not found"));

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



}







