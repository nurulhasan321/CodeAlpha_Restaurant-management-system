package com.restaurant.restaurant_management_Sys.controller;

import com.restaurant.restaurant_management_Sys.dto.request.LoginReq;
import com.restaurant.restaurant_management_Sys.dto.response.LoginRes;
import com.restaurant.restaurant_management_Sys.dto.request.SignupReq;
import com.restaurant.restaurant_management_Sys.dto.response.SignupRes;
import com.restaurant.restaurant_management_Sys.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup/customer")
    public ResponseEntity<SignupRes> signupCustomer(@Valid @RequestBody SignupReq req){
        return  ResponseEntity.ok (authService.signupCustomer (req));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginRes> loginCustomer(@Valid @RequestBody LoginReq loginReq, HttpServletResponse response){

        LoginRes loginRes = authService.login (loginReq);

        ResponseCookie cookie = ResponseCookie
                .from ("access_token",loginRes.message ())
                .httpOnly (true)
                .secure (false)
                .path("/")
                .maxAge (Duration.ofHours (1))
                .sameSite ("Lax")
                .build ();

        response.addHeader (HttpHeaders.SET_COOKIE, cookie.toString ());
        return ResponseEntity.ok (
                new LoginRes (
                        loginRes.name (),
                        loginRes.email (),
                        loginRes.role (),
                        "You are logged in successfully!"
                )
        );


    }



    @PostMapping("/signup/admin")
    public ResponseEntity<SignupRes> signupAdmin(@Valid @RequestBody SignupReq req){
        return ResponseEntity.ok (authService.signupAdmin (req));
    }
}
