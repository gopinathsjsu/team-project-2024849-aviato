package com.thalibook.service;

import com.thalibook.model.Review;
import com.thalibook.model.User;
import com.thalibook.model.Restaurant;
import com.thalibook.repository.ReviewRepository;
import com.thalibook.repository.RestaurantRepository;
import com.thalibook.repository.UserRepository;
import com.thalibook.dto.CreateReviewRequest;
import com.thalibook.dto.ReviewResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

  private final ReviewRepository reviewRepository;
  private final RestaurantRepository restaurantRepository;
  private final UserRepository userRepository;

  public ReviewService(ReviewRepository reviewRepository,
                       RestaurantRepository restaurantRepository,
                       UserRepository userRepository) {
    this.reviewRepository = reviewRepository;
    this.restaurantRepository = restaurantRepository;
    this.userRepository = userRepository;
  }

  public ReviewResponse createReview(CreateReviewRequest request) {
    // Validate input
    if (request.getRestaurantId() == null) {
      throw new IllegalArgumentException("Restaurant ID cannot be null");
    }

    if (request.getUserId() == null) {
      throw new IllegalArgumentException("User ID cannot be null");
    }

    // Check if user has already reviewed this restaurant
    if (reviewRepository.existsByUserUserIdAndRestaurantRestaurantId(
            request.getUserId(), request.getRestaurantId())) {
      throw new IllegalArgumentException("User has already reviewed this restaurant");
    }

    // Fetch restaurant
    Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
            .orElseThrow(() -> new IllegalArgumentException(
                    "Restaurant not found with id: " + request.getRestaurantId()));

    // Fetch user
    User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new IllegalArgumentException(
                    "User not found with id: " + request.getUserId()));

    // Create review
    Review review = new Review();
    review.setRestaurant(restaurant);
    review.setUser(user);
    review.setRating(request.getRating());
    review.setComment(request.getComment());
    review.setCreatedAt(LocalDateTime.now());

    // Save review
    Review savedReview = reviewRepository.save(review);

    // Update restaurant rating
    updateRestaurantRating(restaurant);

    return convertToResponse(savedReview);
  }

  public List<ReviewResponse> getReviewsForRestaurant(Long restaurantId) {
    List<Review> reviews = reviewRepository.findByRestaurantRestaurantId(restaurantId);

    return reviews.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
  }

  public Page<ReviewResponse> getReviewsForRestaurantPaged(Long restaurantId, Pageable pageable) {
    Page<Review> reviews = reviewRepository.findByRestaurantRestaurantId(restaurantId, pageable);

    return reviews.map(this::convertToResponse);
  }

  public List<ReviewResponse> getReviewsByUser(Long userId) {
    List<Review> reviews = reviewRepository.findByUserUserId(userId);

    return reviews.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
  }

  public void deleteReview(Long reviewId, Long userId) {
    Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new IllegalArgumentException(
                    "Review not found with id: " + reviewId));

    // Check if the user owns this review
    if (!review.getUser().getUserId().equals(userId)) {
      throw new IllegalArgumentException("User is not authorized to delete this review");
    }

    Restaurant restaurant = review.getRestaurant();
    reviewRepository.delete(review);

    // Update restaurant rating after deletion
    updateRestaurantRating(restaurant);
  }

  private void updateRestaurantRating(Restaurant restaurant) {
    Double avgRating = reviewRepository.findAverageRatingByRestaurantId(restaurant.getRestaurantId());
    Integer totalReviews = reviewRepository.countByRestaurantRestaurantId(restaurant.getRestaurantId());

    restaurant.setAverageRating(avgRating != null ? avgRating : 0.0);
    restaurant.setTotalReviews(totalReviews != null ? totalReviews : 0);

    restaurantRepository.save(restaurant);
  }

  private ReviewResponse convertToResponse(Review review) {
    ReviewResponse response = new ReviewResponse();
    response.setReviewId(review.getReviewId());
    response.setRestaurantId(review.getRestaurant().getRestaurantId());
    response.setRestaurantName(review.getRestaurant().getName());
    response.setUserId(review.getUser().getUserId());

    // Using email instead of constructing a name
    response.setUserEmail(review.getUser().getEmail());

    response.setRating(review.getRating());
    response.setComment(review.getComment());
    response.setCreatedAt(review.getCreatedAt());

    return response;
  }
}