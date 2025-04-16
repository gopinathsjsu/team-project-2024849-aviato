// src/store/thunks/restaurantThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import restaurantService from "@/services/restaurantService";

export const searchRestaurants = createAsyncThunk(
  "restaurant/search",
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await restaurantService.searchRestaurants(searchParams);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to search restaurants"
      );
    }
  }
);

export const fetchRestaurantDetails = createAsyncThunk(
  "restaurant/details",
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getRestaurantDetails(
        restaurantId
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch restaurant details"
      );
    }
  }
);

export const fetchAvailableRestaurants = createAsyncThunk(
  "restaurant/available",
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getAvailableRestaurants(
        searchParams
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch available restaurants"
      );
    }
  }
);
