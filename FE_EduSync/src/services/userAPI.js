// file: src/services/userAPI.js
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/user";

// Hàm lấy Profile
export const getProfileAPI = async (token) => {
  const response = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`, // Nhét vé vào đây
    },
  });
  return response.data;
};

// Hàm cập nhật Profile
export const updateProfileAPI = async (profileData, token) => {
  const response = await axios.put(`${API_URL}/update-profile`, profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// API UPLOAD AVATAR
export const uploadAvatarAPI = async (file, token) => {
  // Đóng gói file vào FormData
  const formData = new FormData();
  formData.append("file", file); 

  const response = await axios.post(`${API_URL}/upload-avatar`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // KHÔNG set Content-Type ở đây, trình duyệt sẽ tự động xử lý
    },
    data: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image to server");
  }

  // Trả về dữ liệu JSON (chứa cái URL ảnh mới)
  return await response.json();
};

// =========================================================================
// ADMIN - QUẢN LÝ NGƯỜI DÙNG
// =========================================================================
const ADMIN_API_URL = "http://127.0.0.1:8000/user";

/**
 * Lấy danh sách người dùng (admin)
 * @param {string} token - JWT token của admin
 * @param {object} params - { q, role, status, page, limit }
 */
export const adminGetUsersAPI = async (token, params = {}) => {
  const { q = "", role = "", status = "", page = 1, limit = 10 } = params;

  const query = new URLSearchParams();
  if (q)      query.set("q", q);
  if (role)   query.set("role", role);
  if (status) query.set("status", status);
  query.set("page", page);
  query.set("limit", limit);

  const response = await axios.get(
    `${ADMIN_API_URL}/admin/users?${query.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

/**
 * Khóa / Mở khóa tài khoản người dùng (admin)
 * @param {string} userId - ID người dùng cần toggle
 * @param {string} token - JWT token của admin
 */
export const adminToggleBlockAPI = async (userId, token) => {
  const response = await axios.put(
    `${ADMIN_API_URL}/admin/users/${userId}/toggle-block`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Lấy chi tiết user
export const adminGetUserDetailAPI = async (userId, token) => {
  const response = await axios.get(
    `${ADMIN_API_URL}/admin/users/${userId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Xoá user
export const adminDeleteUserAPI = async (userId, token) => {
  const response = await axios.delete(
    `${ADMIN_API_URL}/admin/users/${userId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// add user
export const adminCreateUserAPI = async (userData, token) => {
  const res = await axios.post(`${ADMIN_API_URL}/admin/users`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
