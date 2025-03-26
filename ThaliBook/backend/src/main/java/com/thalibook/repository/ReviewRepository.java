package com.thalibook.repository;

import com.thalibook.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;
import java.util.ArrayList;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    //Get All Reviews belonging to a particular user
    List<Review> findByUserUserId(Long userId);
   //Get All Reviews for a particular restaurant
   List<Review> findByRestaurantRestaurantId( Long restaurantId);
}
