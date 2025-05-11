package com.thalibook.service;

import com.thalibook.dto.TopRestaurantDTO;
import com.thalibook.repository.BookingRepository;
import com.thalibook.repository.RestaurantRepository;
import com.thalibook.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;

    public AdminService(BookingRepository bookingRepository, UserRepository userRepository, RestaurantRepository restaurantRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
    }
    public Map<String, Object> getAnalyticsData() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalRestaurants", restaurantRepository.count());
        data.put("approvedRestaurants", restaurantRepository.countByIsApproved(true));
        data.put("pendingRestaurants", restaurantRepository.countByIsApproved(false));
        data.put("totalUsers", userRepository.count());
        data.put("totalBookings", bookingRepository.count());
        data.put("pendingBookings", bookingRepository.countByStatus("PENDING"));
        data.put("confirmedBookings", bookingRepository.countByStatus("CONFIRMED"));
        Pageable pageable = PageRequest.of(0, 5);
        Page<Object[]> topRestaurants = bookingRepository.findTop5MostBookedRestaurants(pageable);

        data.put("topRestaurants", topRestaurants);
        return data;
    }


    public List<TopRestaurantDTO> getTop5MostBookedRestaurants() {
        Pageable pageable = PageRequest.of(0, 5);
        Page<Object[]> results = bookingRepository.findTop5MostBookedRestaurants(pageable);

        return results.getContent().stream()
                .map(row -> new TopRestaurantDTO(
                        ((Number) row[0]).longValue(),
                        ((Number) row[1]).longValue()
                ))
                .collect(Collectors.toList());
    }
}
