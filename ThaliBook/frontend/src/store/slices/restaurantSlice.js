// src/store/slices/restaurantSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  searchRestaurants,
  fetchRestaurantDetails,
  fetchAvailableRestaurants,
} from "../thunks/restaurantThunks";

const initialState = {
  restaurants: [],
  currentRestaurant: null,
  loading: false,
  error: null,
};

const restaurantSlice = createSlice({
  name: "restaurant",
  initialState,
  reducers: {
    clearRestaurantError: (state) => {
      state.error = null;
    },
    clearCurrentRestaurant: (state) => {
      state.currentRestaurant = null;
    },
  },
  extraReducers: (builder) => {
    // Search restaurants
    builder.addCase(searchRestaurants.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(searchRestaurants.fulfilled, (state, action) => {
      state.loading = false;
      state.restaurants = action.payload;
    });
    builder.addCase(searchRestaurants.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to search restaurants";
    });

    // Fetch restaurant details
    builder.addCase(fetchRestaurantDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRestaurantDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.currentRestaurant = action.payload;
    });
    builder.addCase(fetchRestaurantDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch restaurant details";
    });

    // Fetch available restaurants
    builder.addCase(fetchAvailableRestaurants.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAvailableRestaurants.fulfilled, (state, action) => {
      state.loading = false;
      state.restaurants = action.payload;
    });
    builder.addCase(fetchAvailableRestaurants.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch available restaurants";
    });
  },
});

export const { clearRestaurantError, clearCurrentRestaurant } =
  restaurantSlice.actions;
export default restaurantSlice.reducer;
