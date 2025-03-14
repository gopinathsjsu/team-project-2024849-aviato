package com.thalibook.service;

import com.thalibook.dto.RegisterRequest;
import com.thalibook.model.User;
import com.thalibook.repository.UserRepository;
import com.thalibook.util.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public User register(RegisterRequest request) {
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .phone(request.getPhone())
                .createdAt(LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    public String login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
//        System.out.println(password +" "+ user.getPasswordHash()+" ");
//        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
        if (!password.equals(user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        // You can encode more info here, like role:userId
        return JwtUtil.generateToken(user.getEmail(), user.getRole());

    }

}
