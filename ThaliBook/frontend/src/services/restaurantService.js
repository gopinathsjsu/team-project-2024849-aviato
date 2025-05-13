// src/services/restaurantService.js
import api from "./api";

const restaurantService = {
  searchRestaurants: async (searchParams) => {
    console.log("searchParams", searchParams);
    const response = await api.get("/restaurants/search", {
      params: searchParams,
    });
    return response.data;
  },

  getRestaurantDetails: async (restaurantId) => {
    const response = await api.get(`/restaurants/details/${restaurantId}`);
    return response.data;
  },

  getAvailableRestaurants: async (searchParams) => {
    const response = await api.get("/restaurants/available", {
      params: searchParams,
    });
    return response.data;
  },

  getAvailableTimeSlots: async (restaurantId, date, partySize) => {
    // Use the search endpoint to get available time slots for a specific restaurant
    const response = await api.get("/restaurants/search", {
      params: {
        date,
        // Use a dummy time to get all available slots
        time: "12:00:00",
        partySize,
      },
    });

    // Find the restaurant in the response
    const restaurant = response.data.find(
      (r) => r.restaurantId === parseInt(restaurantId)
    );

    if (!restaurant || !restaurant.tableAvailability) {
      return [];
    }

    // Extract unique available times from all tables
    const availableTimes = new Set();
    restaurant.tableAvailability.forEach((table) => {
      table.availableTimes.forEach((time) => {
        availableTimes.add(time);
      });
    });

    // Sort the times
    return Array.from(availableTimes).sort();
  },
};

export default restaurantService;
