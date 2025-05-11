// src/services/api.js
import axios from "axios";

const baseURL = "http://localhost:8080/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    // console.log("API Interceptor Tokkkkkkkkkkkkkkkkkkkkken:");

    // console.log("API Interceptor - Token from localStorage:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log("Authorization header set:", `Bearer ${token}`);
    } else {
      // console.log("No token found in localStorage");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common error cases
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authorization errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
