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
import java.util.NoSuchElementException;
import java.time.LocalDate;

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


    public void cancelBooking(Long bookingId, Long userId, String role) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        if (role.equals("CUSTOMER") && !booking.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only cancel your own bookings.");
        }

        if (role.equals("RESTAURANT_MANAGER")) {
            throw new IllegalArgumentException("Managers are not allowed to cancel bookings.");
        }

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalArgumentException("Booking is already cancelled.");
        }

        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
    }

    public Integer getBookingsCountForToday(Long restaurantId) {
        LocalDate today = LocalDate.now();
        return bookingRepository.countByRestaurantIdAndDate(restaurantId, today);
    }

    // Alternative: Count only confirmed bookings for today
    public Integer getConfirmedBookingsCountForToday(Long restaurantId) {
        LocalDate today = LocalDate.now();
        return bookingRepository.countByRestaurantIdAndDateAndStatus(
                restaurantId, today, "CONFIRMED");
    }

}

