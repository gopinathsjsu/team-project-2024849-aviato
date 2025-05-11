package com.thalibook.dto;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewResponse {
    private Long reviewId;
    private Long restaurantId;
    private String restaurantName;
    private Long userId;
    private String userEmail;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}
