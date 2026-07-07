package com.restaurant.restaurant_management_Sys.controller;

import com.restaurant.restaurant_management_Sys.dto.request.LoginReq;
import com.restaurant.restaurant_management_Sys.dto.response.LoginRes;
import com.restaurant.restaurant_management_Sys.dto.request.SignupReq;
import com.restaurant.restaurant_management_Sys.dto.response.SignupRes;
import com.restaurant.restaurant_management_Sys.dto.response.TokenResponse;
import com.restaurant.restaurant_management_Sys.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Value("${app.cookie.secure}")
    private boolean cookieSecure;

    
    @PostMapping("/signup/customer")
    public ResponseEntity<?> signupCustomer(@Valid @RequestBody SignupReq req) {
        
        authService.signupCustomer(req);
        return ResponseEntity.ok(Map.of("message", "Registration successful! You can now log in."));
    }

    @PostMapping("/signup/admin")
    public ResponseEntity<SignupRes> signupAdmin(@Valid @RequestBody SignupReq req) {
        return ResponseEntity.ok(authService.signupAdmin(req));
    }

    
    @PostMapping("/login")
    public ResponseEntity<LoginRes> login(@Valid @RequestBody LoginReq loginReq, HttpServletResponse response) {
        TokenResponse tokenRes = authService.login(loginReq);

        ResponseCookie accessCookie = ResponseCookie
                .from("access_token", tokenRes.accessToken())
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(Duration.ofMinutes(10))
                .sameSite("Lax")
                .build();

        ResponseCookie refreshCookie = ResponseCookie
                .from("refresh_token", tokenRes.refreshToken())
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/api/auth/refresh")
                .maxAge(Duration.ofDays(7))
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok(new LoginRes(tokenRes.name(), tokenRes.email(), tokenRes.role()));
    }

    
    @GetMapping("/me")
    public ResponseEntity<LoginRes> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.getCurrentUser(userDetails.getUsername()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(
            @CookieValue(name = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response) {

        if (refreshToken == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Refresh token missing"));
        }
        try {
            String newAccessToken = authService.refreshToken(refreshToken);
            ResponseCookie cookie = ResponseCookie
                    .from("access_token", newAccessToken)
                    .httpOnly(true)
                    .secure(cookieSecure)
                    .path("/")
                    .maxAge(Duration.ofMinutes(10))
                    .sameSite("Lax")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired refresh token"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie accessCookie = ResponseCookie.from("access_token", "")
                .httpOnly(true).secure(cookieSecure).path("/").maxAge(0).sameSite("Lax").build();
        ResponseCookie refreshCookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true).secure(cookieSecure).path("/api/auth/refresh").maxAge(0).sameSite("Lax").build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        
        authService.getCurrentUser(email); 
        return ResponseEntity.ok(Map.of("message", "Account found. You can now reset your password."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String newPassword = body.get("newPassword");
        
        if (email == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and a password of at least 6 characters are required"));
        }
        
        authService.resetPasswordDirectly(email, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully! You can now log in."));
    }
}
