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
};

export default restaurantService;
