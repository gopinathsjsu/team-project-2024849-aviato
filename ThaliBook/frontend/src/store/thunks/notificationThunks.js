// src/store/thunks/notificationThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import notificationService from "@/services/notificationService";
import {
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  markNotificationAsReadStart,
  markNotificationAsReadSuccess,
  markNotificationAsReadFailure,
} from "@/store/slices/notificationSlice";

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(fetchNotificationsStart());
      const notifications = await notificationService.getNotifications();
      dispatch(fetchNotificationsSuccess(notifications));
      return notifications;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to fetch notifications";
      dispatch(fetchNotificationsFailure(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (notificationId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(markNotificationAsReadStart());
      await notificationService.markAsRead(notificationId);
      dispatch(markNotificationAsReadSuccess(notificationId));
      return notificationId;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to mark notification as read";
      dispatch(markNotificationAsReadFailure(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);
