import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    unreadCount: 0,
    totalPages: 1,
    loading: false,
  },

  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload.notifications;
      state.totalPages = action.payload.totalPages;
    },

    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    markAllAsReadLocal: (state) => {
      state.unreadCount = 0;
      state.notifications = state.notifications.map((n) => ({
        ...n,
        isRead: true,
      }));
    },

    addNewNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
});

export const {
  setNotifications,
  setUnreadCount,
  setLoading,
  markAllAsReadLocal,
  addNewNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
