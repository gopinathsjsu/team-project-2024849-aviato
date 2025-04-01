package com.thalibook.dto;

import com.thalibook.model.Restaurant;
import com.thalibook.model.User;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateReviewRequest {
    private Long reviewId;
    private Long restaurantId;
    @NotNull(message = "User ID is required")
    private Long userId;
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private int rating;
    @NotBlank(message = "Comment is required")
    @Size(max = 400, message = "Comment cannot exceed 400 characters")
    private String comment;
    private LocalDateTime createdAt;
}
