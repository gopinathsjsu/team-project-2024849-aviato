package com.thalibook.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thalibook.dto.BookingRequest;
import com.thalibook.model.Booking;
import com.thalibook.model.Restaurant;
import com.thalibook.model.TablesAvailability;
import com.thalibook.model.User;
import com.thalibook.repository.BookingRepository;
import com.thalibook.repository.RestaurantRepository;
import com.thalibook.repository.TablesAvailabilityRepository;
import com.thalibook.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.time.LocalDate;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TablesAvailabilityRepository tablesAvailabilityRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;



    public BookingService(BookingRepository bookingRepository, TablesAvailabilityRepository tablesAvailabilityRepository
            , UserRepository userRepository, RestaurantRepository restaurantRepository) {
        this.bookingRepository = bookingRepository;
        this.tablesAvailabilityRepository = tablesAvailabilityRepository;
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
    }

    public Booking createBooking(Long userId, BookingRequest request) throws Exception {
        List<TablesAvailability> tables = tablesAvailabilityRepository.findByRestaurantId(request.getRestaurantId());

        // Fetch restaurant object once
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new Exception("Restaurant not found"));

        for (TablesAvailability table : tables) {
            if (table.getSize() >= request.getPartySize()) {
                ObjectMapper mapper = new ObjectMapper();
                List<String> availableTimes = mapper.readValue(table.getBookingTimes(), new TypeReference<>() {});

                if (!availableTimes.contains(request.getTime().toString())) continue;

                List<Booking> conflicts = bookingRepository.findByTableIdAndDateAndTimeInAndStatusIn(
                        table.getTableId(),
                        request.getDate(),
                        List.of(request.getTime(), request.getTime().minusMinutes(30),
                                request.getTime().plusMinutes(30)),
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
                    booking.setStatus("CONFIRMED");
                    booking.setCreatedAt(LocalDateTime.now());

                    Booking savedBooking = bookingRepository.save(booking);

                    // Notify restaurant manager
                    User manager = userRepository.findById(restaurant.getManagerId()).orElse(null);
                    User customer = userRepository.findById(userId).orElse(null);
                    if (manager != null && customer!=null) {

                        notificationService.notifyUser(
                                manager.getUserId(), manager.getEmail(),
                                "New booking at " + restaurant.getName() + " on " + booking.getDate() + " at " + booking.getTime() + "by " + customer.getName()
                        );

                        notificationService.notifyUser(
                                userId, customer.getEmail(),
                                "Your booking is confirmed at " + restaurant.getName() + " on " + booking.getDate() + " at " + booking.getTime()
                        );
                    }

                    return savedBooking;
                }
            }
        }

        throw new Exception("No available table found for the requested time and size.");
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

    public boolean isManagerOfBooking(Long managerId, Long bookingId) {
        // Check if the restaurant manager owns the booking’s restaurant
        return bookingRepository.existsByBookingIdAndRestaurantManagerId(bookingId, managerId);
    }

    @Deprecated
    public boolean confirmBooking(Long bookingId) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            if (!booking.getStatus().equals("CONFIRMED")) {
                booking.setStatus("CONFIRMED");
                bookingRepository.save(booking);
                Restaurant restaurant = restaurantRepository.findById(booking.getRestaurantId()).orElseThrow();
                User customer = userRepository.findById(booking.getUserId()).orElseThrow();

                String msg = "Your booking at " + restaurant.getName() + " on " + booking.getDate() + " at " + booking.getTime() + " is CONFIRMED";
                notificationService.notifyUser(customer.getUserId(), customer.getEmail(), msg);

                return true;
            }
        }
        return false;
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

    public List<Booking> findByRestaurantIdAndDate(Long restaurantId, LocalDate date) {
        return bookingRepository.findByRestaurantIdAndDate(restaurantId, date);
    }

}

