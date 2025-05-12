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
    // Get all bookings for the manager and filter by restaurant
    const response = await api.get("/bookings/my");
    // Filter bookings for this restaurant and date if provided
    return response.data.filter(
      (booking) =>
        booking.restaurantId === restaurantId &&
        (!date || booking.date === date)
    );
  },
};

export default bookingService;
