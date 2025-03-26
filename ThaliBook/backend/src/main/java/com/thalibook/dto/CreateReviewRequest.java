package com.thalibook.dto;

import com.thalibook.model.Restaurant;
import com.thalibook.model.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateReviewRequest {
    private Long reviewId;
    private Restaurant restaurant;
    private User user;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}
