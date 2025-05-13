// src/services/bookingService.js
import api from "./api";

const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post("/bookings", bookingData);
    return response.data;
  },

  getUserBookings: async () => {
    const response = await api.get("/bookings/my");
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const response = await api.delete(`/bookings/${bookingId}`);
    return response.data;
  },

  getRestaurantBookings: async (restaurantId, date) => {
    // Use the new endpoint to get bookings for a specific date
    const response = await api.get(
      `/bookings/onDate?restaurantId=${restaurantId}&date=${date}`
    );
    return response.data;
  },
};

export default bookingService;
