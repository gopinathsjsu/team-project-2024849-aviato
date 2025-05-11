// src/services/authService.js
import api from "./api";
import { getUserFromToken } from "@/utils/jwtUtils";

const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    console.log("Auth service login response:", response.data);

    // Store token in localStorage immediately after receiving it
    if (response.data && response.data.token) {
      console.log("Storing token in localStorage:", response.data.token);
      localStorage.setItem("token", response.data.token);

      // Extract user information from token
      const user = getUserFromToken(response.data.token);

      // Return both token and user information
      return {
        token: response.data.token,
        user,
      };
    }

    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  getCurrentUser: () => {
    const token = localStorage.getItem("token");
    return getUserFromToken(token);
  },
};

export default authService;
