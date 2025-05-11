package com.thalibook.config;

import com.thalibook.model.Restaurant;
import com.thalibook.model.User;
import com.thalibook.repository.RestaurantRepository;
import com.thalibook.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.Map;

@Component
public class TestDataLoader implements CommandLineRunner {
    @Autowired
    private RestaurantRepository restaurantRepository;
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        if (restaurantRepository.count() == 0 && userRepository.count() == 0) {

            // Step 1: Create restaurant manager user
            User manager = new User();
            manager.setEmail("manager@example.com");
            manager.setPasswordHash(new BCryptPasswordEncoder().encode("password123"));
            manager.setRole("RESTAURANT_MANAGER");
            manager.setPhone("4085554321");
            manager.setCreatedAt(LocalDateTime.now());

            userRepository.save(manager);

            // Step 2: Create restaurant with that manager
            Restaurant r = new Restaurant();
            r.setManagerId(manager.getUserId()); // This will now be valid
            r.setName("Curry Garden");
            r.setAddress("456 Masala St");
            r.setCity("San Jose");
            r.setState("CA");
            r.setZipCode("95110");
            r.setPhone("4085551234");
            r.setDescription("Delicious North Indian Cuisine");
            r.setCuisine("Indian");
            r.setCostRating("$$");
            r.setHours(Map.of("mon", "11:00-22:00", "tue", "11:00-22:00"));
            r.setPhotoUrl("https://example.com/restaurant.jpg");
            r.setIsApproved(true);
            r.setCreatedAt(LocalDateTime.now());
            r.setLatitude(37.338207); // San Jose coordinates
            r.setLongitude(-121.886330);

            restaurantRepository.save(r);

            System.out.println("✅ Test restaurant and manager inserted.");

        }
    }
}