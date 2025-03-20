package com.thalibook.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thalibook.dto.BookingRequest;
import com.thalibook.model.Booking;
import com.thalibook.model.TablesAvailability;
import com.thalibook.repository.BookingRepository;
import com.thalibook.repository.TablesAvailabilityRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TablesAvailabilityRepository tablesAvailabilityRepository;

    public BookingService(BookingRepository bookingRepository, TablesAvailabilityRepository tablesAvailabilityRepository) {
        this.bookingRepository = bookingRepository;
        this.tablesAvailabilityRepository = tablesAvailabilityRepository;
    }

    public Booking createBooking(Long userId, BookingRequest request) throws Exception {
        List<TablesAvailability> tables = tablesAvailabilityRepository.findByRestaurantId(request.getRestaurantId());

        for (TablesAvailability table : tables) {
            if (table.getSize() >= request.getPartySize()) {
                ObjectMapper mapper = new ObjectMapper();
                List<String> availableTimes = mapper.readValue(table.getBookingTimes(), new TypeReference<>() {});

                if (!availableTimes.contains(request.getTime().toString())) continue;

                List<Booking> conflicts = bookingRepository.findByTableIdAndDateAndTimeInAndStatusIn(
                        table.getTableId(),
                        request.getDate(),
                        List.of(request.getTime(), request.getTime().minusMinutes(30), request.getTime().plusMinutes(30)),
                        List.of("CONFIRMED", "PENDING")
                );

                if (conflicts.isEmpty()) {
                    Booking booking = new Booking();
                    booking.setUserId(userId);
                    booking.setRestaurantId(request.getRestaurantId());
                    booking.setTableId(table.getTableId());
                    booking.setDate(request.getDate());
                    booking.setTime(request.getTime());
                    booking.setPartySize(request.getPartySize());
                    booking.setStatus("PENDING");
                    booking.setCreatedAt(LocalDateTime.now());

                    return bookingRepository.save(booking);
                }
            }
        }


        throw new Exception("No available table for the given time and party size.");
    }

    public List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getBookingsForManager(Long managerId) {
        return bookingRepository.findAllByRestaurantManagerId(managerId); // custom query
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

}

