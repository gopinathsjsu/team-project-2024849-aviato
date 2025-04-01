package com.thalibook.repository;

import com.thalibook.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {


    List<Review> findByUserUserId(Long userId);

    List<Review> findByRestaurantRestaurantId(Long restaurantId);

    Page<Review> findByRestaurantRestaurantId(Long restaurantId, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.restaurant.restaurantId = :restaurantId")
    Double findAverageRatingByRestaurantId(@Param("restaurantId") Long restaurantId);

    Integer countByRestaurantRestaurantId(Long restaurantId);

    boolean existsByUserUserIdAndRestaurantRestaurantId(Long userId, Long restaurantId);

    List<Review> findByRestaurantRestaurantIdAndRating(Long restaurantId, int rating);

    List<Review> findTop10ByRestaurantRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
}