package com.thalibook.dto;

import lombok.Data;
import java.util.Map;
import java.util.List;

@Data
public class RestaurantResponse {
    private Long restaurantId;
    private String name;
    private String address;
    private String city;
    private String cuisine;
    private String costRating;
    private Double averageRating;
    private Integer totalReviews;
    private Integer bookingsToday;
    private String photoUrl;
}
