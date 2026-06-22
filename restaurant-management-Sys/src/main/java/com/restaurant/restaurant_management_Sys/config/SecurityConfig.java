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

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;


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

                // Disable CSRF because JWT is stateless
                .csrf(csrf -> csrf.disable())


                // Enable CORS using CorsConfigurationSource bean
                .cors(Customizer.withDefaults())


                // No session
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                // Debug security errors
                .exceptionHandling(exception -> exception

                        .authenticationEntryPoint(
                                (request, response, authException) -> {

                                    System.out.println(
                                            "AUTHENTICATION FAILED: "
                                                    + request.getRequestURI()
                                                    + " | "
                                                    + authException.getMessage()
                                    );

                                    response.setStatus(401);
                                    response.getWriter()
                                            .write("Unauthorized");
                                }
                        )

                        .accessDeniedHandler(
                                (request, response, deniedException) -> {

                                    System.out.println(
                                            "ACCESS DENIED: "
                                                    + request.getRequestURI()
                                                    + " | "
                                                    + deniedException.getMessage()
                                    );

                                    response.setStatus(403);
                                    response.getWriter()
                                            .write("Forbidden");
                                }
                        )
                )


                .authorizeHttpRequests(auth -> auth


                        // Allow browser preflight request
                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        )
                        .permitAll()


                        // Authentication APIs
                        .requestMatchers(
                                "/api/auth/**"
                        )
                        .permitAll()


                        // Admin APIs
                        .requestMatchers(
                                "/api/admin/**"
                        )
                        .hasRole("ADMIN")


                        // Customer APIs
                        .requestMatchers(
                                "/api/user/**"
                        )
                        .hasAnyRole(
                                "CUSTOMER","ADMIN"
                        )

                        .requestMatchers ("/api/restaurant-table/**")
                        .hasAnyRole ("ADMIN")


                        // Everything else needs JWT
                        .anyRequest()
                        .authenticated()
                )


                // JWT filter
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );


        return http.build();
    }
}