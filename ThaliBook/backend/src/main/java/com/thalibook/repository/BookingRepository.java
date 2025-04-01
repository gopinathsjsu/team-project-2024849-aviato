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

    Integer countByRestaurantIdAndDate(Long restaurantId, LocalDate date);

    Integer countByRestaurantIdAndDateAndStatus(Long restaurantId, LocalDate date, String status);

    List<Booking> findByRestaurantIdAndDate(Long restaurantId, LocalDate date);

    List<Booking> findByRestaurantIdAndDateAndTime(Long restaurantId, LocalDate date, LocalTime time);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.restaurantId = :restaurantId AND b.date = :date")
    Integer countTodaysBookings(@Param("restaurantId") Long restaurantId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.restaurantId = :restaurantId " +
            "AND b.date = :date AND b.status = :status")
    Integer countBookingsByStatus(@Param("restaurantId") Long restaurantId,
                                  @Param("date") LocalDate date,
                                  @Param("status") String status);

}
