package com.thalibook.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;

public class JwtUtil {

    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 hours
    private static final String SECRET = "YourSuperSecretKeyThatIsAtLeast32BytesLong!!";
    private static final Key SECRET_KEY = Keys.hmacShaKeyFor(SECRET.getBytes());


    public static String generateToken(Long userId, String subject, String role) {
        return Jwts.builder()
                .setSubject(subject)
                .claim("userId", userId)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }

    public static String getSubject(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
