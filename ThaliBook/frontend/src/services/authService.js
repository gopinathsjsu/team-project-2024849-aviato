// src/services/authService.js
import api from "./api";

const authService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    console.log("Auth service login response:", response.data);

    // Store token in localStorage immediately after receiving it
    if (response.data && response.data.token) {
      console.log("Storing token in localStorage:", response.data.token);
      localStorage.setItem("token", response.data.token);
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
};

export default authService;
