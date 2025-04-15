package com.thalibook.repository;

import com.thalibook.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    @Query("""
        SELECT r FROM Restaurant r
        WHERE r.isApproved = true
        AND (:city IS NULL OR r.city = :city)
        AND (:state IS NULL OR r.state = :state)
        AND (:zip IS NULL OR r.zipCode = :zip)
    """)
    List<Restaurant> searchByLocation(
            @Param("city") String city,
            @Param("state") String state,
            @Param("zip") String zip
    );

    List<Restaurant> findByIsApprovedFalse();

    long countByIsApproved(boolean isApproved);
}
