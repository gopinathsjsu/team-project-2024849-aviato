package com.thalibook.controller;

import com.thalibook.dto.BookingRequest;
import com.thalibook.model.Booking;
import com.thalibook.service.BookingService;
import com.thalibook.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<?> bookTable(@RequestBody BookingRequest request,
                                       @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String userEmail = JwtUtil.getSubject(token);
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Map<String, Object> details = (Map<String, Object>) auth.getDetails();

            Long userId = (Long) details.get("userId");
            // Here you should resolve userId from email using UserRepository

            Booking booking = bookingService.createBooking(userId, request);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> details = (Map<String, Object>) auth.getDetails();

        Long userId = (Long) details.get("userId");
        String role = (String) details.get("role");

        List<Booking> bookings;

        switch (role) {
            case "CUSTOMER" -> bookings = bookingService.getBookingsByUserId(userId);
            case "RESTAURANT_MANAGER" -> bookings = bookingService.getBookingsForManager(userId);
            case "ADMIN" -> bookings = bookingService.getAllBookings();
            default -> bookings = List.of(); // or throw unauthorized
        }

        return ResponseEntity.ok(bookings);
    }

//    @PatchMapping("/{id}/confirm")
//    public ResponseEntity<String> confirmBooking(@PathVariable Long id) {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        Map<String, Object> details = (Map<String, Object>) auth.getDetails();
//        Long userId = (Long) details.get("userId");
//        String role = (String) details.get("role");
//
//        if (!role.equals("ADMIN") && !bookingService.isManagerOfBooking(userId, id)) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to confirm this booking.");
//        }
//
//        boolean success = bookingService.confirmBooking(id);
//        if (success) {
//            return ResponseEntity.ok("Booking confirmed successfully.");
//        } else {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Booking not found or already confirmed.");
//        }
//    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> details = (Map<String, Object>) auth.getDetails();
        Long userId = (Long) details.get("userId");
        String role = (String) details.get("role");

        try {
            bookingService.cancelBooking(bookingId, userId, role);
            return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }


}
