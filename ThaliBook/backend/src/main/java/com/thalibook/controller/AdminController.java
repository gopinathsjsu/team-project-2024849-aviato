package com.thalibook.controller;

import com.thalibook.dto.TopRestaurantDTO;
import com.thalibook.model.Restaurant;
import com.thalibook.repository.BookingRepository;
import com.thalibook.repository.RestaurantRepository;
import com.thalibook.repository.UserRepository;
import com.thalibook.service.AdminService;
import com.thalibook.service.RestaurantService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final RestaurantRepository restaurantRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RestaurantService restaurantService;

    public AdminController(RestaurantRepository restaurantRepository,
                           BookingRepository bookingRepository,
                           UserRepository userRepository,
                           AdminService adminService,
                           RestaurantService restaurantService ) {
        this.restaurantRepository = restaurantRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.adminService = adminService;
        this.restaurantService = restaurantService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> userDetails = (Map<String, Object>) auth.getDetails();
        String role = (String) userDetails.get("role");
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        long restaurantCount = restaurantRepository.count();
        long pendingRestaurants = restaurantRepository.countByIsApproved(false);
        long bookingCount = bookingRepository.count();
        long userCount = userRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRestaurants", restaurantCount);
        stats.put("pendingRestaurants", pendingRestaurants);
        stats.put("totalBookings", bookingCount);
        stats.put("totalUsers", userCount);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> analytics = adminService.getAnalyticsData();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/analytics/top-restaurants")
    public ResponseEntity<List<TopRestaurantDTO>> getTopRestaurants() {
        List<TopRestaurantDTO> topRestaurants = adminService.getTop5MostBookedRestaurants();
        return ResponseEntity.ok(topRestaurants);
    }

    @GetMapping("/allRestaurants")
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
      List< Restaurant > allRestaurants = restaurantService.getAllRestaurants();
      return ResponseEntity.ok( allRestaurants );
    }


}

