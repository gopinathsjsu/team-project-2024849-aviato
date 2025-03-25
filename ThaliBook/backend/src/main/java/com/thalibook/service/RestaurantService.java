package com.thalibook.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thalibook.dto.CreateRestaurantRequest;
import com.thalibook.model.Booking;
import com.thalibook.model.Restaurant;
import com.thalibook.repository.BookingRepository;
import com.thalibook.repository.RestaurantRepository;
import com.thalibook.repository.TablesAvailabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RestaurantService {

    @Autowired
    private BookingRepository bookingRepository;

    private final RestaurantRepository restaurantRepository;

    public RestaurantService(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    public Restaurant createRestaurant(CreateRestaurantRequest request, Long managerId) {
        ObjectMapper objectMapper = new ObjectMapper();

        String hoursJson;
        try {
            hoursJson = objectMapper.writeValueAsString(request.getHours());
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Invalid hours format", e);
        }

        Restaurant restaurant = new Restaurant();
        restaurant.setManagerId(managerId);
        restaurant.setName(request.getName());
        restaurant.setAddress(request.getAddress());
        restaurant.setCity(request.getCity());
        restaurant.setState(request.getState());
        restaurant.setZipCode(request.getZipCode());
        restaurant.setPhone(request.getPhone());
        restaurant.setDescription(request.getDescription());
        restaurant.setCuisine(request.getCuisine());
        restaurant.setCostRating(request.getCostRating());
        restaurant.setHours(request.getHours());
        restaurant.setPhotoUrl(request.getPhotoUrl());
        restaurant.setIsApproved(false);
        restaurant.setCreatedAt(LocalDateTime.now());

        return restaurantRepository.save(restaurant);
    }


    public List<Restaurant> searchRestaurants(LocalDate date, LocalTime time, int partySize,
                                              String city, String state, String zip) {
        List<Restaurant> restaurants = restaurantRepository.searchByLocation(city, state, zip);
        // ⏳ In the next step we'll add logic here to filter by table availability
        return restaurants;
    }

    public boolean isTableAvailable(Long tableId, LocalDate date, LocalTime time, List<String> availableSlots) {
        // check if this time is available ±30 minutes
        List<LocalTime> checkTimes = List.of(
                time.minusMinutes(30),
                time,
                time.plusMinutes(30)
        );

        // convert JSON booking_times (String) to LocalTime list
        List<LocalTime> slots = availableSlots.stream()
                .map(t -> LocalTime.parse(t.replace("\"", "").replace("[", "").replace("]", "").trim()))
                .collect(Collectors.toList());

        boolean slotExists = checkTimes.stream().anyMatch(slots::contains);
        if (!slotExists) return false;

        // check if already booked
        List<Booking> bookings = bookingRepository.findByTableIdAndDateAndTimeInAndStatusIn(
                tableId,
                date,
                checkTimes,
                List.of("CONFIRMED", "PENDING")
        );

        return bookings.isEmpty();
    }
}
