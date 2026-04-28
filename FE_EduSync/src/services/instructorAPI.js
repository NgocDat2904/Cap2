// File: src/services/instructorAPI.js
import axios from "axios";

const API_URL = "http://localhost:8000/instructor";

// 1. LẤY HỒ SƠ
export const getInstructorProfileAPI = async (token) => {
  const response = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 2. CẬP NHẬT HỒ SƠ
export const updateInstructorProfileAPI = async (data, token) => {
  const response = await axios.post(`${API_URL}/update-full-profile`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 3. LẤY DANH SÁCH KHÓA HỌC CỦA INSTRUCTOR
export const getInstructorCoursesAPI = async (token) => {
  const response = await axios.get(`${API_URL}/courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
