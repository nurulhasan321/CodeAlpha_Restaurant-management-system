package com.restaurant.restaurant_management_Sys.security;

import jakarta.annotation.Nonnull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @Nonnull HttpServletRequest request,
            @Nonnull HttpServletResponse response,
            @Nonnull FilterChain filterChain)
            throws ServletException, IOException {

        String token = null;

        
        String authHeader = request.getHeader("Authorization");

        if(authHeader != null &&
                authHeader.startsWith("Bearer ")) {

            token = authHeader.substring(7);

        }

        
        if(token == null && request.getCookies() != null){

            for(Cookie cookie : request.getCookies()){

                if(cookie.getName().equals("access_token")){

                    token = cookie.getValue();
                    break;
                }
            }
        }

        if(token == null){

            filterChain.doFilter(request,response);
            return;
        }

        try {

            String email = jwtUtil.extractEmail(token);

            if(email != null &&
                    SecurityContextHolder.getContext()
                            .getAuthentication() == null){

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(email);

                if(jwtUtil.validateToken(token)){

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    auth.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(auth);
                }
            }

        }catch(Exception e){

            System.out.println(
                    "JWT ERROR: "+e.getMessage()
            );

        }

        filterChain.doFilter(request,response);

    }

}