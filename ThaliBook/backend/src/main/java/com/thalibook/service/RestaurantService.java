package com.thalibook.service;

import com.thalibook.model.Restaurant;
import com.thalibook.repository.RestaurantRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    public RestaurantService(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    public List<Restaurant> searchRestaurants(LocalDate date, LocalTime time, int partySize,
                                              String city, String state, String zip) {
        List<Restaurant> restaurants = restaurantRepository.searchByLocation(city, state, zip);
        // ⏳ In the next step we'll add logic here to filter by table availability
        return restaurants;
    }
}
