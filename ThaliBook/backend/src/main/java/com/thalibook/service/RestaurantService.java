package com.thalibook.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thalibook.dto.CreateRestaurantRequest;
import com.thalibook.dto.RestaurantDetailsRequest;
import com.thalibook.exception.ResourceNotFoundException;
import com.thalibook.model.Booking;
import com.thalibook.model.Restaurant;
import com.thalibook.repository.BookingRepository;
import com.thalibook.repository.RestaurantRepository;
import com.thalibook.repository.TablesAvailabilityRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.nio.file.AccessDeniedException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
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
        restaurant.setLatitude(request.getLatitude());
        restaurant.setLongitude(request.getLongitude());
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
                time.plusMinutes(30));

        // convert JSON booking_times (String) to LocalTime list
        List<LocalTime> slots = availableSlots.stream()
                .map(t -> LocalTime.parse(t.replace("\"", "").replace("[", "").replace("]", "").trim()))
                .collect(Collectors.toList());

        boolean slotExists = checkTimes.stream().anyMatch(slots::contains);
        if (!slotExists)
            return false;

        // check if already booked
        List<Booking> bookings = bookingRepository.findByTableIdAndDateAndTimeInAndStatusIn(
                tableId,
                date,
                checkTimes,
                List.of("CONFIRMED", "PENDING"));

        return bookings.isEmpty();
    }

    public RestaurantDetailsRequest getRestaurantDetails(Long restaurantId) {
        Restaurant obj = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found with id: " + restaurantId));

        RestaurantDetailsRequest details = new RestaurantDetailsRequest();
        details.setRestaurantId(obj.getRestaurantId());
        details.setManagerId(obj.getManagerId());
        details.setName(obj.getName());
        details.setAddress(obj.getAddress());
        details.setCity(obj.getCity());
        details.setState(obj.getState());
        details.setZipCode(obj.getZipCode());
        details.setPhone(obj.getPhone());
        details.setDescription(obj.getDescription());
        details.setCuisine(obj.getCuisine());
        details.setCostRating(obj.getCostRating());
        details.setHours(obj.getHours());
        details.setLatitude(obj.getLatitude());
        details.setLongitude(obj.getLongitude());

        return details;
    }

    @Transactional
    public void approveRestaurant(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
        restaurant.setIsApproved(true);
        restaurantRepository.save(restaurant);
    }

    public List<Restaurant> getPendingRestaurants() {
        return restaurantRepository.findByIsApprovedFalse();
    }

    public Restaurant updateRestaurant(Long id, Restaurant updatedDetails) throws AccessDeniedException {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));

        // Get current authenticated user details
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> details = (Map<String, Object>) authentication.getDetails();
        String currentRole = (String) details.get("role");
        Long currentUserId = (Long) details.get("userId");

        // ⚠ Check if manager is allowed to update this restaurant
        if ("RESTAURANT_MANAGER".equalsIgnoreCase(currentRole)
                && !restaurant.getManagerId().equals(currentUserId)) {
            throw new AccessDeniedException("You are not authorized to update this restaurant.");
        }

        // Apply updates
        restaurant.setName(updatedDetails.getName());
        restaurant.setAddress(updatedDetails.getAddress());
        restaurant.setCity(updatedDetails.getCity());
        restaurant.setState(updatedDetails.getState());
        restaurant.setZipCode(updatedDetails.getZipCode());
        restaurant.setPhone(updatedDetails.getPhone());
        restaurant.setDescription(updatedDetails.getDescription());
        restaurant.setCuisine(updatedDetails.getCuisine());
        restaurant.setCostRating(updatedDetails.getCostRating());
        restaurant.setHours(updatedDetails.getHours());
        restaurant.setPhotoUrl(updatedDetails.getPhotoUrl());
        restaurant.setLatitude(updatedDetails.getLatitude());
        restaurant.setLongitude(updatedDetails.getLongitude());

        return restaurantRepository.save(restaurant);
    }

    public boolean isManagerOfRestaurant(Long managerId, Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));
        return restaurant.getManagerId().equals(managerId);
    }

    public void deleteRestaurant(Long restaurantId) {
        restaurantRepository.deleteById(restaurantId);
    }

}
