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

    // Search by city (case-insensitive) and approved
    @Query("SELECT r FROM Restaurant r WHERE LOWER(r.city) = LOWER(:city) AND r.isApproved = true")
    List<Restaurant> findApprovedByCity(@Param("city") String city);

    // Search by zip code ±5 and approved
    @Query("SELECT r FROM Restaurant r WHERE CAST(r.zipCode AS int) BETWEEN :zipStart AND :zipEnd AND r.isApproved = true")
    List<Restaurant> findApprovedByZipRange(@Param("zipStart") int zipStart, @Param("zipEnd") int zipEnd);

    List<Restaurant> findByIsApprovedFalse();

    long countByIsApproved(boolean isApproved);

    //  NEW: Used to list restaurants owned by the logged-in manager
    List<Restaurant> findByManagerId(Long managerId);

    @Query("SELECT r FROM Restaurant r WHERE r.isApproved = true")
    List<Restaurant> findAllApproved();
}
