package com.thalibook.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.thalibook.service.ReviewService;
import com.thalibook.model.Restaurant;
import com.thalibook.model.Review;
import com.thalibook.model.User;
import com.thalibook.dto.CreateReviewRequest;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
  private final ReviewService reviewService;
  public ReviewController( ReviewService reviewService )
  {
     this.reviewService =  reviewService;
  }

  @PostMapping("/create")
  public ResponseEntity<?> addReview(@Valid@RequestBody CreateReviewRequest request )
  {
    //We can add role based access to allow only customer to review
    Review createdReview = reviewService.createReview(request);
    return  ResponseEntity.status(HttpStatus.CREATED).body(createdReview);
  }

  @GetMapping("/restaurant/{id}")
  public ResponseEntity<List<Review>> getRestaurantReviews(
          @PathVariable("id") Long restaurantId )
  {
     List<Review> restaurantReviews =  reviewService.getReviewsForRestaurant( restaurantId );
     return ResponseEntity.ok(restaurantReviews);
  }

  @GetMapping("/user/{id}")
  public ResponseEntity<List<Review>> getReviewsByUser(
          @PathVariable("id")Long userId )
  {
      List<Review> restaurantReviews =  reviewService.getReviewsByUser(userId);
      return ResponseEntity.ok(restaurantReviews);
  }

}
