// src/services/userService.js
import api from "./api";

const userService = {
  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },

  // Get all users
  getAllUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put("/users/profile", userData);
    return response.data;
  },

  // Update user password
  updatePassword: async (passwordData) => {
    const response = await api.put("/users/password", passwordData);
    return response.data;
  },
};

export default userService;
