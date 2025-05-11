// src/store/slices/bookingSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  createBooking,
  fetchUserBookings,
  cancelBooking,
} from "../thunks/bookingThunks";

const initialState = {
  bookings: [],
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create booking
    builder.addCase(createBooking.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createBooking.fulfilled, (state, action) => {
      state.loading = false;
      state.bookings = [...state.bookings, action.payload];
    });
    builder.addCase(createBooking.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to create booking";
    });

    // Fetch user bookings
    builder.addCase(fetchUserBookings.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUserBookings.fulfilled, (state, action) => {
      state.loading = false;
      state.bookings = action.payload;
    });
    builder.addCase(fetchUserBookings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch bookings";
    });

    // Cancel booking
    builder.addCase(cancelBooking.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(cancelBooking.fulfilled, (state, action) => {
      state.loading = false;
      // Update the booking status to cancelled in the state
      state.bookings = state.bookings.map((booking) =>
        booking.bookingId === action.payload.bookingId
          ? { ...booking, status: "CANCELLED" }
          : booking
      );
    });
    builder.addCase(cancelBooking.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to cancel booking";
    });
  },
});

export const { clearBookingError } = bookingSlice.actions;
export default bookingSlice.reducer;
