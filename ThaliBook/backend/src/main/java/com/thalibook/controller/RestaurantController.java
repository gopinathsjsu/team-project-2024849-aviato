package com.thalibook.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thalibook.dto.CreateRestaurantRequest;
import com.thalibook.dto.RestaurantResponse;
import com.thalibook.model.Restaurant;
import com.thalibook.repository.RestaurantRepository;
import com.thalibook.service.RestaurantService;
import com.thalibook.service.TableSeederService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.thalibook.model.TablesAvailability;
import com.thalibook.repository.TablesAvailabilityRepository;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final RestaurantRepository restaurantRepository;
    private final TablesAvailabilityRepository tablesAvailabilityRepository;
    private final ObjectMapper objectMapper;

    public RestaurantController(RestaurantService restaurantService, RestaurantRepository restaurantRepository, TablesAvailabilityRepository tablesAvailabilityRepository, ObjectMapper objectMapper) {
        this.restaurantService = restaurantService;
        this.restaurantRepository = restaurantRepository;
        this.tablesAvailabilityRepository = tablesAvailabilityRepository;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    public ResponseEntity<?> addRestaurant(@Valid @RequestBody CreateRestaurantRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> details = (Map<String, Object>) auth.getDetails();
        Long userId = (Long) details.get("userId");
        String role = (String) details.get("role");

        if (!"RESTAURANT_MANAGER".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only managers can add restaurants"));
        }

        Restaurant saved = restaurantService.createRestaurant(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> approveRestaurant(@PathVariable Long id) {
        restaurantService.approveRestaurant(id);
        return ResponseEntity.ok("Restaurant approved!");
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Restaurant>> getPendingRestaurants() {
        List<Restaurant> pending = restaurantService.getPendingRestaurants();
        return ResponseEntity.ok(pending);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RESTAURANT_MANAGER')")
    public ResponseEntity<Restaurant> updateRestaurant(
            @PathVariable Long id,
            @RequestBody Restaurant updatedDetails) {

        Restaurant updated = null;
        try {
            updated = restaurantService.updateRestaurant(id, updatedDetails);
        } catch (AccessDeniedException e) {
            throw new RuntimeException(e);
        }
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Restaurant>> searchRestaurants(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time,
            @RequestParam int partySize,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String zip
    ) {
        try {
            List<Restaurant> results = restaurantService.searchRestaurants(date, time, partySize, city, zip);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @GetMapping("/available")
    public ResponseEntity<List<Restaurant>> getAvailableRestaurants(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time,
            @RequestParam int partySize
    ) {
        List<Restaurant> allRestaurants = restaurantRepository.findAll(); // or findAllApproved() if you created that
        List<Restaurant> availableRestaurants = new ArrayList<>();

        for (Restaurant restaurant : allRestaurants) {
            List<TablesAvailability> tables = tablesAvailabilityRepository.findByRestaurantId(restaurant.getRestaurantId());

            for (TablesAvailability table : tables) {
                if (table.getSize() >= partySize) {
                    try {
                        List<String> slots = objectMapper.readValue(
                                table.getBookingTimes(),
                                new TypeReference<>() {}
                        );

                        boolean available = restaurantService.isTableAvailable(
                                table.getTableId(), date, time, slots
                        );

                        if (available) {
                            availableRestaurants.add(restaurant);
                            break; // break on first available table
                        }

                    } catch (IOException e) {
                        System.err.println("Failed to parse booking_times for table ID " + table.getTableId());
                    }
                }
            }
        }

        return ResponseEntity.ok(availableRestaurants);
    }

    @GetMapping("/details/{id}")
    public ResponseEntity<RestaurantResponse> getRestaurantDetails(@PathVariable("id") Long restaurantId) {
        try {
            RestaurantResponse restaurant = restaurantService.getRestaurantDetails(restaurantId);
            return ResponseEntity.ok(restaurant);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRestaurant(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> userDetails = (Map<String, Object>) auth.getDetails();
        String role = (String) userDetails.get("role");
        Long userId = ((Number) userDetails.get("userId")).longValue();

        if (!role.equals("ADMIN") && !restaurantService.isManagerOfRestaurant(userId, id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to delete this restaurant.");
        }

        restaurantService.deleteRestaurant(id);
        return ResponseEntity.ok("Restaurant deleted successfully.");
    }

    @GetMapping("/manager")
    @PreAuthorize("hasRole('RESTAURANT_MANAGER')")
    public ResponseEntity<List<Restaurant>> getRestaurantsForManager() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> details = (Map<String, Object>) auth.getDetails();
        Long userId = ((Number) details.get("userId")).longValue();

        List<Restaurant> managerRestaurants = restaurantRepository.findByManagerId(userId);
        return ResponseEntity.ok(managerRestaurants);
    }

}
