package com.thalibook.repository;

import com.thalibook.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

}
