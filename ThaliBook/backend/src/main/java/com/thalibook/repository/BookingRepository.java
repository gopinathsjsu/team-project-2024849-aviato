package com.thalibook.repository;

import com.thalibook.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

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

}
