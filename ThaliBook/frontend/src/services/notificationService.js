// src/services/notificationService.js
import api from "./api";

const notificationService = {
  getNotifications: async () => {
    const response = await api.get("/notifications");
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },
};

export default notificationService;
