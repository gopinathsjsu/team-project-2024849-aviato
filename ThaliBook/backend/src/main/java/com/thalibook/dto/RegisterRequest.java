package com.thalibook.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String name;
    private String password;
    private String role;  // CUSTOMER, RESTAURANT_MANAGER, ADMIN
    private String phone;
}
