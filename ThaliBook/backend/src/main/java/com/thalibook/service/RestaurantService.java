package com.thalibook.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thalibook.dto.CreateRestaurantRequest;
import com.thalibook.dto.TableAvailabilityResponse;
import com.thalibook.exception.ResourceNotFoundException;
import com.thalibook.dto.RestaurantResponse;
import com.thalibook.dto.RestaurantDetailResponse;
import com.thalibook.model.Booking;
import com.thalibook.model.Restaurant;
import com.thalibook.model.TablesAvailability;
import com.thalibook.model.User;
import com.thalibook.repository.BookingRepository;
import com.thalibook.repository.RestaurantRepository;
import com.thalibook.repository.TablesAvailabilityRepository;
import com.thalibook.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RestaurantService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private  BookingService bookingService;

    @Autowired
    private  ReviewService reviewService;

    @Autowired
    private TableSeederService tableSeederService;

    @Autowired
    private GeoCodingService geoCodingService;

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final TablesAvailabilityRepository tablesAvailabilityRepository;



    public RestaurantService(RestaurantRepository restaurantRepository, UserRepository userRepository, TablesAvailabilityRepository tablesAvailabilityRepository,
                             BookingService bookingService,
                             ReviewService reviewService ) {
        this.restaurantRepository = restaurantRepository;
        this.userRepository = userRepository;
        this.tablesAvailabilityRepository = tablesAvailabilityRepository;
        this.bookingService       = bookingService;
        this.reviewService        = reviewService;
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
        restaurant.setTables(request.getTables());

        if (request.getLatitude()==null || request.getLongitude() ==null){
            String fullAddress = restaurant.getAddress() + ", " + restaurant.getCity() + ", " + restaurant.getState()
                    + " " + restaurant.getZipCode();
            try {
                double[] coords = geoCodingService.getLatLong(fullAddress, restaurant.getZipCode());
                restaurant.setLatitude(coords[0]);
                restaurant.setLongitude(coords[1]);
            } catch (IOException e) {
                System.out.println("❌ Failed to get coordinates for address: " +fullAddress);
                restaurant.setLatitude(null);
                restaurant.setLongitude(null);
            }
        }


        Restaurant restaurant1 = restaurantRepository.save(restaurant);
        // Fetch admin user (assuming you have at least one admin in users table)
        User admin = userRepository.findFirstByRole("ADMIN")
                .orElseThrow(() -> new RuntimeException("No admin found"));

        String message = "A new restaurant '" + restaurant.getName() + "' was submitted for approval by manager " + managerId;

        notificationService.notifyUser(admin.getUserId(), admin.getEmail(), message);
        return restaurant1;
    }

    public List<RestaurantDetailResponse> searchRestaurants(LocalDate date, LocalTime time, int partySize,
                                                            String city, String zip) throws JsonProcessingException {

        String dayKey = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
        List<Restaurant> candidates;

        if (city != null && !city.isEmpty()) {
            candidates = restaurantRepository.findApprovedByCity(city);
        } else if (zip != null && !zip.isEmpty()) {
            int zipCode = Integer.parseInt(zip);
            candidates = restaurantRepository.findApprovedByZipRange(zipCode - 5, zipCode + 5);
        } else {
            candidates = restaurantRepository.findAllApproved();
        }

        List<RestaurantDetailResponse> availableRestaurants = new ArrayList<>();

        for (Restaurant r : candidates) {
            Map<String, String> hours = r.getHours();
            if (hours == null || !hours.containsKey(dayKey)) continue;

            String[] openClose = hours.get(dayKey).split("-");
            LocalTime open = LocalTime.parse(openClose[0]);
            LocalTime close = LocalTime.parse(openClose[1]);

            if (time.isBefore(open) || time.isAfter(close)) continue;

            List<TablesAvailability> tables = tablesAvailabilityRepository
                    .findByRestaurantIdAndSizeGreaterThanEqual(r.getRestaurantId(), partySize);

            List<TableAvailabilityResponse> availableTables = new ArrayList<>();

            for (TablesAvailability table : tables) {
                List<String> availableSlots = objectMapper.readValue(table.getBookingTimes(), new TypeReference<>() {});

                // Filter out slots that have a conflict
                List<String> filteredSlots = availableSlots.stream()
                        .filter(slot -> {
                            LocalTime slotTime = LocalTime.parse(slot);
                            return !bookingRepository.existsByTableIdAndDateAndTimeAndStatusIn(
                                    table.getTableId(),
                                    date,
                                    slotTime,
                                    List.of("CONFIRMED", "PENDING")
                            );
                        })
                        .toList();

                if (!filteredSlots.isEmpty()) {
                    availableTables.add(new TableAvailabilityResponse(
                            table.getTableId(),
                            table.getSize(),
                            filteredSlots
                    ));
                }
            }

            if (!availableTables.isEmpty()) {
                RestaurantDetailResponse detailResponse = convertToDetailResponse(r);
                detailResponse.setTableAvailability(availableTables);
                availableRestaurants.add(detailResponse);
            }
        }

        return availableRestaurants;
    }


    private List<TableAvailabilityResponse> getAvailableTables(Long restaurantId) {
        List<TablesAvailability> tables = tablesAvailabilityRepository.findByRestaurantId(restaurantId);
        List<TableAvailabilityResponse> result = new ArrayList<>();
        ObjectMapper mapper = new ObjectMapper();

        for (TablesAvailability table : tables) {
            try {
                List<String> allTimes = mapper.readValue(table.getBookingTimes(), new TypeReference<>() {});
                // Optionally: check current date and filter out past times
                result.add(new TableAvailabilityResponse(table.getTableId(), table.getSize(), allTimes));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return result;
    }

    private boolean isTimeAvailable(LocalTime requested, List<String> availableSlots) {
        for (String slot : availableSlots) {
            try {
                LocalTime slotTime = LocalTime.parse(slot);
                if (Math.abs(ChronoUnit.MINUTES.between(slotTime, requested)) <= 30) {
                    return true;
                }
            } catch (DateTimeParseException e) {
                // skip invalid format
            }
        }
        return false;
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

    public RestaurantResponse getRestaurantDetails(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));

        RestaurantDetailResponse response = convertToDetailResponse(restaurant);
        response.setBookingsToday(bookingService.getBookingsCountForToday(restaurantId));

        // Optionally include recent reviews
        // List<ReviewResponse> recentReviews = reviewService.getRecentReviewsForRestaurant(restaurantId, 5);
       //  response.setRecentReviews(recentReviews);

        return response;
    }


    public RestaurantResponse getRestaurantSummary(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new IllegalArgumentException("Restaurant not found"));

        RestaurantResponse response = convertToBasicResponse(restaurant);
        response.setBookingsToday(bookingService.getBookingsCountForToday(restaurantId));

        return response;
    }

    private RestaurantResponse convertToBasicResponse(Restaurant restaurant) {
        RestaurantResponse response = new RestaurantResponse();
        response.setRestaurantId(restaurant.getRestaurantId());
        response.setName(restaurant.getName());
        response.setAddress(restaurant.getAddress());
        response.setCity(restaurant.getCity());
        response.setCuisine(restaurant.getCuisine());
        response.setCostRating(restaurant.getCostRating());
        response.setAverageRating(restaurant.getAverageRating());
        response.setTotalReviews(restaurant.getTotalReviews());
        response.setPhotoUrl(restaurant.getPhotoUrl());
        return response;
    }

    private RestaurantDetailResponse convertToDetailResponse(Restaurant restaurant) {
        RestaurantDetailResponse response = new RestaurantDetailResponse();

        response.setRestaurantId(restaurant.getRestaurantId());
        response.setName(restaurant.getName());
        response.setAddress(restaurant.getAddress());
        response.setCity(restaurant.getCity());
        response.setLongitude(restaurant.getLongitude());
        response.setLatitude(restaurant.getLatitude());
        response.setCuisine(restaurant.getCuisine());
        response.setCostRating(restaurant.getCostRating());
        response.setAverageRating(restaurant.getAverageRating());
        response.setTotalReviews(restaurant.getTotalReviews());
        response.setPhotoUrl(restaurant.getPhotoUrl());
        response.setTables(restaurant.getTables());
        response.setDescription(restaurant.getDescription());
        response.setState(restaurant.getState());
        response.setZipCode(restaurant.getZipCode());
        response.setPhone(restaurant.getPhone());
        response.setHours(restaurant.getHours());
        response.setIsApproved(restaurant.getIsApproved());

        return response;
    }




    @Transactional
    public void approveRestaurant(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
        restaurant.setIsApproved(true);
        restaurantRepository.save(restaurant);
        User manager = userRepository.findById(restaurant.getManagerId())
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        String message = "Your restaurant '" + restaurant.getName() + "' has been approved by the admin!";
        tableSeederService.populateAvailabilityForRestaurant(restaurant);
        notificationService.notifyUser(manager.getUserId(), manager.getEmail(), message);

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
    public List<Restaurant> getRestaurantsByManagerId(Long managerId) {
        return restaurantRepository.findByManagerId(managerId);
    }

    public List<Restaurant> getAllRestaurants(){
        return restaurantRepository.findAll();
    }

    public List<RestaurantDetailResponse> getRestaurantsByManager(Long managerId) throws JsonProcessingException {
        List<Restaurant> restaurants = restaurantRepository.findByManagerId(managerId);
        List<RestaurantDetailResponse> responses = new ArrayList<>();

        for (Restaurant r : restaurants) {
            RestaurantDetailResponse detail = convertToDetailResponse(r);

            List<TablesAvailability> tables = tablesAvailabilityRepository.findByRestaurantId(r.getRestaurantId());
            List<TableAvailabilityResponse> availableTables = new ArrayList<>();

            for (TablesAvailability table : tables) {
                List<String> availableSlots = objectMapper.readValue(table.getBookingTimes(), new TypeReference<>() {});

                // Optional: filter out slots that are already booked
                // OR just return all slots as "available" for management view
                availableTables.add(new TableAvailabilityResponse(
                        table.getTableId(),
                        table.getSize(),
                        availableSlots
                ));
            }

            detail.setTableAvailability(availableTables);
            responses.add(detail);
        }

        return responses;
    }
}
