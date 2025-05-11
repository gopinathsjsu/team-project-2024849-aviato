// src/store/thunks/userThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import userService from "@/services/userService";

export const getCurrentUser = createAsyncThunk(
  "user/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getCurrentUser();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch user profile"
      );
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(userData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update profile"
      );
    }
  }
);

export const updateUserPassword = createAsyncThunk(
  "user/updatePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await userService.updatePassword(passwordData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to update password"
      );
    }
  }
);
