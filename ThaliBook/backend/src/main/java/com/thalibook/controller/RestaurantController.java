package com.thalibook.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thalibook.dto.CreateRestaurantRequest;
import com.thalibook.model.Restaurant;
import com.thalibook.repository.RestaurantRepository;
import com.thalibook.service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.thalibook.model.TablesAvailability;
import com.thalibook.repository.TablesAvailabilityRepository;

import java.io.IOException;
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


    @GetMapping("/search")
    public ResponseEntity<List<Restaurant>> searchRestaurants(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time,
            @RequestParam int partySize,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String zip
    ) {
        List<Restaurant> results = restaurantService.searchRestaurants(date, time, partySize, city, state, zip);
        return ResponseEntity.ok(results);
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

    @GetMapping("/details")
    public ResponseEntity<Restaurant> getRestaurantDetails(
          @RequestParam Long RestaurantId
    )
    {
      Optional<Restaurant> targetRestaurant =  restaurantRepository.findById( RestaurantId );
      if( targetRestaurant.isPresent())
      {
        return  ResponseEntity.ok(targetRestaurant.get());
      }
      else{
          return ResponseEntity.status(HttpStatus.NOT_FOUND)
                  .body(null);
      }
    }
}
