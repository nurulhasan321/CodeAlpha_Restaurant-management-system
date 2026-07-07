package com.restaurant.restaurant_management_Sys.config;

import com.restaurant.restaurant_management_Sys.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final com.restaurant.restaurant_management_Sys.security.RateLimitingFilter rateLimitingFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                
                .csrf(csrf -> csrf.disable())

                
                .cors(Customizer.withDefaults())

                
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                
                .exceptionHandling(exception -> exception

                        .authenticationEntryPoint(
                                (request, response, authException) -> {

                                    log.warn(
                                            "AUTHENTICATION FAILED: {} | {}",
                                            request.getRequestURI(),
                                            authException.getMessage()
                                    );

                                    response.setStatus(401);
                                    response.setContentType("application/json");
                                    response.getWriter()
                                            .write("{\"message\":\"Unauthorized\"}");
                                }
                        )

                        .accessDeniedHandler(
                                (request, response, deniedException) -> {

                                    log.warn(
                                            "ACCESS DENIED: {} | {}",
                                            request.getRequestURI(),
                                            deniedException.getMessage()
                                    );

                                    response.setStatus(403);
                                    response.setContentType("application/json");
                                    response.getWriter()
                                            .write("{\"message\":\"Forbidden\"}");
                                }
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        )
                        .permitAll()

                        
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/signup/customer",
                                "/api/auth/refresh",
                                "/api/auth/logout",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password",
                                "/api/auth/verify-email"
                        )
                        .permitAll()

                        
                        .requestMatchers(
                                "/api/auth/signup/admin"
                        )
                        .hasRole("ADMIN")

                        
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/menu",
                                "/api/menu/**",
                                "/api/category",
                                "/api/category/**",
                                "/api/table",
                                "/api/table/**",
                                "/api/orders/stream",
                                "/uploads/**",
                                "/api/settings"
                        )
                        .permitAll()

                        
                        .requestMatchers(
                                "/api/user/**"
                        )
                        .hasAnyRole(
                                "CUSTOMER", "ADMIN"
                        )

                        .requestMatchers(
                                "/api/addresses/**",
                                "/api/reviews/**",
                                "/api/users/me/**"
                        )
                        .hasAnyRole("CUSTOMER", "ADMIN")

                        .requestMatchers(
                                "/api/orders/my-orders",
                                "/api/orders/add",
                                "/api/reservations/my-reservations",
                                "/api/reservations/add"
                        )
                        .hasAnyRole("CUSTOMER", "ADMIN")

                        
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/orders/*/status"
                        )
                        .hasAnyRole("CUSTOMER", "ADMIN", "STAFF")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/reservations/*/status"
                        )
                        .hasAnyRole("ADMIN", "STAFF")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/reservations/*"
                        )
                        .hasAnyRole("CUSTOMER", "ADMIN")

                        
                        .requestMatchers(
                                "/api/inventory",
                                "/api/inventory/**",
                                "/api/upload",
                                "/api/upload/**",
                                "/api/customers",
                                "/api/customers/**",
                                "/api/analytics/dashboard"
                        )
                        .hasAnyRole("ADMIN", "STAFF")

                        
                        .requestMatchers(
                                "/api/staff",
                                "/api/staff/**",
                                "/api/analytics/**"
                        )
                        .hasAnyRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/settings/restaurant",
                                "/api/settings/notifications"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/category/add",
                                "/api/menu/add",
                                "/api/table/add"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/category/**",
                                "/api/menu/**",
                                "/api/table/**"
                        )
                        .hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/category/**",
                                "/api/menu/**",
                                "/api/table/**"
                        )
                        .hasRole("ADMIN")

                        
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/orders",
                                "/api/reservations"
                        )
                        .hasAnyRole("ADMIN", "STAFF")

                        
                        .anyRequest()
                        .authenticated()
                )

                
                .addFilterBefore(
                        rateLimitingFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}