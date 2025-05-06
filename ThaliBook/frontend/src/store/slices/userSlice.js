// src/store/slices/userSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  getCurrentUser,
  updateUserProfile,
  updateUserPassword,
} from "../thunks/userThunks";

const initialState = {
  profile: null,
  loading: false,
  error: null,
  success: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserMessages: (state) => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    // Get current user
    builder.addCase(getCurrentUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload;
    });
    builder.addCase(getCurrentUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch user profile";
    });

    // Update user profile
    builder.addCase(updateUserProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = null;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload;
      state.success = "Profile updated successfully";
    });
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to update profile";
    });

    // Update user password
    builder.addCase(updateUserPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = null;
    });
    builder.addCase(updateUserPassword.fulfilled, (state) => {
      state.loading = false;
      state.success = "Password updated successfully";
    });
    builder.addCase(updateUserPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to update password";
    });
  },
});

export const { clearUserMessages } = userSlice.actions;
export default userSlice.reducer;
