import axios from "axios";

const API_URL = "http://127.0.0.1:8000/notifications";

// Lấy danh sách thông báo
export const getNotificationsAPI = async (token) => {
  const response = await axios.get(`${API_URL}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Đánh dấu đã đọc
export const markNotificationReadAPI = async (notificationId, token) => {
  const response = await axios.put(`${API_URL}/${notificationId}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
