// file: src/api/userAPI.js
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/user";

// 1. Hàm lấy Profile
export const getProfileAPI = async (token) => {
  const response = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`, // Nhét vé vào đây
    },
  });
  return response.data;
};

// 2. Hàm cập nhật Profile
export const updateProfileAPI = async (profileData, token) => {
  const response = await axios.put(`${API_URL}/updateprofile`, profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
