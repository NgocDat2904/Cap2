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
  const response = await axios.put(`${API_URL}/update-profile`, profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 3. API UPLOAD AVATAR
export const uploadAvatarAPI = async (file, token) => {
  // Đóng gói file vào FormData
  const formData = new FormData();
  formData.append("file", file); // Chữ "file" này phải khớp với biến backend

  // Gọi API (Nhớ đổi URL cho đúng với port Backend của mẹ nhé)
  const response = await fetch("http://localhost:8000/user/upload-avatar", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // KHÔNG set Content-Type ở đây, trình duyệt sẽ tự động xử lý
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Lỗi khi tải ảnh lên server");
  }

  // Trả về dữ liệu JSON (chứa cái URL ảnh mới)
  return await response.json();
};
