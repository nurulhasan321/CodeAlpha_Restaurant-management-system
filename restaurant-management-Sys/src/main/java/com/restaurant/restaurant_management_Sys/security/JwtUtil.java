package com.restaurant.restaurant_management_Sys.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value ("${jwt.secret}")
    private String secret;

    @Value ("${jwt.expiration-access}")
    private Long expirationAccess;

    @Value ("${jwt.expiration-refresh}")
    private Long expirationRefresh;

    private Key getKey(){
        return Keys.hmacShaKeyFor (secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken (String email){
        return Jwts.builder()
                .subject (email)
                .issuedAt (new Date ())
                .expiration (new Date (System.currentTimeMillis () + expirationAccess))
                .signWith (getKey ())
                .compact ();
    }

    public String generateRefreshToken(String email){
        return Jwts.builder ()
                .subject (email)
                .issuedAt (new Date ())
                .expiration (new Date (System.currentTimeMillis ()+ expirationRefresh))
                .signWith (getKey ())
                .compact ();
    }

    public String generatePasswordResetToken(String email){
        
        long expirationReset = 1000 * 60 * 15;
        return Jwts.builder()
                .subject(email)
                .claim("type", "reset")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationReset))
                .signWith(getKey())
                .compact();
    }

    public String generateEmailVerificationToken(String email){
        
        long expirationVerification = 1000 * 60 * 60 * 24;
        return Jwts.builder()
                .subject(email)
                .claim("type", "verify_email")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationVerification))
                .signWith(getKey())
                .compact();
    }

    public String extractEmail(String token){
        return Jwts.parser ()
                .verifyWith ((SecretKey) getKey ())
                .build ()
                .parseSignedClaims (token)
                .getPayload ()
                .getSubject ();
    }

    public boolean validateToken(String token){

        try {

            Jwts.parser()
                    .verifyWith((SecretKey) getKey())
                    .build()
                    .parseSignedClaims(token);

            return true;

        } catch(Exception e){

            return false;
        }
    }

    public boolean validateResetToken(String token) {
        try {
            String type = Jwts.parser()
                    .verifyWith((SecretKey) getKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("type", String.class);
            return "reset".equals(type);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean validateEmailVerificationToken(String token) {
        try {
            String type = Jwts.parser()
                    .verifyWith((SecretKey) getKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("type", String.class);
            return "verify_email".equals(type);
        } catch (Exception e) {
            return false;
        }
    }

}
