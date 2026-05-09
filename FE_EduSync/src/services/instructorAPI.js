// File: src/services/instructorAPI.js
import axios from "axios";

const API_URL = "http://localhost:8000/instructor";

// LẤY HỒ SƠ
export const getInstructorProfileAPI = async (token) => {
  const response = await axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// CẬP NHẬT HỒ SƠ
export const updateInstructorProfileAPI = async (data, token) => {
  const response = await axios.post(`${API_URL}/update-full-profile`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// LẤY DANH SÁCH KHÓA HỌC CỦA INSTRUCTOR
export const getInstructorCoursesAPI = async (token) => {
  const response = await axios.get(`${API_URL}/courses`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// LẤY CHI TIẾT KHÓA HỌC CỦA INSTRUCTOR
export const getInstructorCourseDetailAPI = async (courseId, token) => {
  const response = await axios.get(`${API_URL}/courses/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// CẬP NHẬT KHÓA HỌC (Instructor chỉnh sửa)
export const updateInstructorCourseAPI = async (courseId, data, token) => {
  const response = await axios.put(`${API_URL}/courses/${courseId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// XÓA KHÓA HỌC (Soft delete - chuyển thành is_deleted)
export const deleteInstructorCourseAPI = async (courseId, token) => {
  const response = await axios.delete(`${API_URL}/courses/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Xóa khóa học
export const deleteCourseAPI = async (courseId, token) => {
  const response = await axios.delete(`${API_URL}/courses/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// LẤY DỮ LIỆU DASHBOARD
export const getInstructorDashboardAPI = async (token) => {
  const response = await axios.get(`${API_URL}/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};