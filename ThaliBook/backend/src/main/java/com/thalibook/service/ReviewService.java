package com.thalibook.service;
import com.thalibook.model.Review;
import com.thalibook.model.User;
import com.thalibook.model.Restaurant;
import com.thalibook.repository.ReviewRepository;
import com.thalibook.dto.CreateReviewRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {
  private ReviewRepository reviewRepository;
  public ReviewService( ReviewRepository reviewRepository )
  {
    this.reviewRepository = reviewRepository;
  }

  public Review createReview( CreateReviewRequest request )
  {
    if (request.getRestaurant() == null) {
      throw new IllegalArgumentException("Restaurant cannot be null.");
    }

    if (request.getUser() == null) {
      throw new IllegalArgumentException("Reviewer (User) cannot be null.");
    }

    Review createdReview = new Review();
    createdReview.setRestaurant(request.getRestaurant());
    createdReview.setUser(request.getUser());
    createdReview.setComment(request.getComment());
    createdReview.setRating(request.getRating());
    createdReview.setCreatedAt(LocalDateTime.now());

    return reviewRepository.save(createdReview);
  }

  public List<Review> getReviewsForRestaurant( Long RestaurantId)
  {
    List<Review> restaurantReviews = reviewRepository.findByRestaurantRestaurantId( RestaurantId );
    //Check for empty list should be handled on the frontend imo
    //JPA guarantees collections will not be null
    return restaurantReviews;
  }

  public List<Review> getReviewsByUser( Long UserId )
  {
    List< Review > reviewsByUser = reviewRepository.findByUserUserId( UserId );
    return reviewsByUser;
  }

}
