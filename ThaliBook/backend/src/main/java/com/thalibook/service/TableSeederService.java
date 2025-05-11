package com.thalibook.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thalibook.model.Restaurant;
import com.thalibook.model.TablesAvailability;
import com.thalibook.repository.RestaurantRepository;
import com.thalibook.repository.TablesAvailabilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TableSeederService {

    private final RestaurantRepository restaurantRepository;
    private final TablesAvailabilityRepository tablesAvailabilityRepository;
    private final ObjectMapper objectMapper;

    public void populateTablesAvailability() {
        List<Restaurant> restaurants = restaurantRepository.findAll();

        for (Restaurant restaurant : restaurants) {
            tablesAvailabilityRepository.deleteByRestaurantId(restaurant.getRestaurantId());

            Map<Integer, Integer> tables = restaurant.getTables(); // e.g., {2=4, 4=3, 6=2}
            Map<String, String> hours = restaurant.getHours();     // e.g., {"Mon":"11:00-21:00",...}

            // Pick a single day to extract start & end time for mock data
            String sampleHours = hours.getOrDefault("Mon", "11:00-21:00");
            String[] timeRange = sampleHours.split("-");
            LocalTime startTime = LocalTime.parse(timeRange[0]);
            LocalTime endTime = LocalTime.parse(timeRange[1]);

            for (Map.Entry<Integer, Integer> entry : tables.entrySet()) {
                int size = entry.getKey();
                int count = entry.getValue();
                int intervalMinutes = getIntervalForSize(size);

                List<String> slots = generateSlots(startTime, endTime, intervalMinutes);

                String bookingTimesJson;
                try {
                    bookingTimesJson = objectMapper.writeValueAsString(slots);
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                    continue;
                }

                for (int i = 0; i < count; i++) {
                    TablesAvailability table = new TablesAvailability();
                    table.setRestaurantId(restaurant.getRestaurantId());
                    table.setSize(size);
                    table.setBookingTimes(bookingTimesJson);
                    tablesAvailabilityRepository.save(table);
                }
            }
        }
    }

    public void populateAvailabilityForRestaurant(Restaurant restaurant) {
        tablesAvailabilityRepository.deleteByRestaurantId(restaurant.getRestaurantId());

        Map<Integer, Integer> tables = restaurant.getTables();
        Map<String, String> hours = restaurant.getHours();

        String sampleHours = hours.getOrDefault("Mon", "11:00-21:00");
        String[] range = sampleHours.split("-");
        LocalTime start = LocalTime.parse(range[0]);
        LocalTime end = LocalTime.parse(range[1]);

        for (Map.Entry<Integer, Integer> entry : tables.entrySet()) {
            int size = entry.getKey();
            int count = entry.getValue();
            int interval = getIntervalForSize(size);
            List<String> slots = generateSlots(start, end, interval);

            String bookingTimesJson;
            try {
                bookingTimesJson = objectMapper.writeValueAsString(slots);
            } catch (JsonProcessingException e) {
                e.printStackTrace();
                continue;
            }

            for (int i = 0; i < count; i++) {
                TablesAvailability table = new TablesAvailability();
                table.setRestaurantId(restaurant.getRestaurantId());
                table.setSize(size);
                table.setBookingTimes(bookingTimesJson);
                tablesAvailabilityRepository.save(table);
            }
        }
    }

    private int getIntervalForSize(int size) {
        return switch (size) {
            case 2 -> 60;   // 1 hour
            case 4 -> 90;   // 1.5 hours
            case 6 -> 120;  // 2 hours
            default -> 60;
        };
    }

    private List<String> generateSlots(LocalTime start, LocalTime end, int intervalMinutes) {
        List<String> slots = new ArrayList<>();
        LocalTime time = start;

        while (!time.plusMinutes(intervalMinutes).isAfter(end)) {
            slots.add(time.toString()); // e.g. "11:00"
            time = time.plusMinutes(intervalMinutes);
        }
        return slots;
    }
}


