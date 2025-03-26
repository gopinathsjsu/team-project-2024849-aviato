package com.thalibook.dto;
import lombok.Data;

import java.util.Map;

@Data
public class RestaurantDetailsRequest {
    private Long restaurantId;
    private Long managerId;
    private String name;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String phone;
    private String description;
    private String cuisine;
    private String costRating;
    private Map<String, String> hours;
}
