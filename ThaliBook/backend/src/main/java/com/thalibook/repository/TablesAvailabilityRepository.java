package com.thalibook.repository;

import com.thalibook.model.TablesAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TablesAvailabilityRepository extends JpaRepository<TablesAvailability, Long> {

    // Get all tables for a specific restaurant
    List<TablesAvailability> findByRestaurantId(Long restaurantId);

    List<TablesAvailability> findByRestaurantIdAndSizeGreaterThanEqual(Long restaurantId, int size);

    void deleteByRestaurantId(Long restaurantId);

}
