package com.thalibook.dto;

import lombok.Data;
import java.util.Map;
import java.util.List;

@Data
public class RestaurantDetailResponse extends RestaurantResponse {
    private String description;
    private String state;
    private String zipCode;
    private String phone;
    private Double latitude;
    private Double longitude;
    private Map<String, String> hours;
    private Boolean isApproved;
    private List<ReviewResponse> recentReviews; // Optional: last 5-10 reviews
    private Map<Integer, Integer> tables;
}
