package com.restaurant.restaurant_management_Sys.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final ConcurrentHashMap<String, Integer> requestCounts = new ConcurrentHashMap<>();
    private final int MAX_REQUESTS_PER_MINUTE = 10;

    public RateLimitingFilter() {
        
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        scheduler.scheduleAtFixedRate(requestCounts::clear, 1, 1, TimeUnit.MINUTES);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String path = request.getRequestURI();
        
        
        if (path.equals("/api/auth/login") || 
            path.equals("/api/auth/signup/customer") || 
            path.equals("/api/auth/signup/admin") || 
            path.equals("/api/auth/forgot-password") || 
            path.equals("/api/auth/reset-password")) {
            String clientIp = request.getRemoteAddr();
            int requests = requestCounts.getOrDefault(clientIp, 0);
            
            if (requests >= MAX_REQUESTS_PER_MINUTE) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("{\"error\": \"Too many requests. Please try again later.\"}");
                return;
            }
            
            requestCounts.put(clientIp, requests + 1);
        }
        
        filterChain.doFilter(request, response);
    }
}
