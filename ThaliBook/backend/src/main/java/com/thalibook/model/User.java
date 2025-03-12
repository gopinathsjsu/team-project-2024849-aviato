package com.thalibook.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 20)
    private String role;

    @Column(length = 15)
    private String phone;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // 👇 Add public getters manually
    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getRole() { return role; }
    public String getPhone() { return phone; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
