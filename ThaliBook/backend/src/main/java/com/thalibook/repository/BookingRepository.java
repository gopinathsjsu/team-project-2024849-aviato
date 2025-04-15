package com.thalibook.repository;

import com.thalibook.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByRestaurantIdAndDateAndTimeBetween(
            Long restaurantId,
            LocalDate date,
            LocalTime start,
            LocalTime end
    );

    List<Booking> findByTableIdAndDateAndTimeInAndStatusIn(
            Long tableId,
            LocalDate date,
            List<LocalTime> time,
            List<String> status
    );

    List<Booking> findByUserId(Long userId);

    @Query("""
    SELECT b FROM Booking b
    JOIN Restaurant r ON b.restaurantId = r.restaurantId
    WHERE r.managerId = :managerId
""")
    List<Booking> findAllByRestaurantManagerId(@Param("managerId") Long managerId);


    long countByStatus(String status);

    @Query(value = "SELECT restaurant_id, COUNT(*) as booking_count " +
            "FROM bookings " +
            "GROUP BY restaurant_id " +
            "ORDER BY booking_count DESC",
            countQuery = "SELECT COUNT(DISTINCT restaurant_id) FROM bookings",
            nativeQuery = true)
    Page<Object[]> findTop5MostBookedRestaurants(Pageable pageable);

}
