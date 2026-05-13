// File: src/services/instructorAPI.js
import axios from "axios";

const API_URL = "http://localhost:8000/instructor";
const BASE_URL = "http://localhost:8000"; // dùng cho Q&A (không có prefix /instructor)

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
      // "Content-Type": "multipart/form-data",
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

// Trang student management
export const getInstructorStudentsAPI = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/students`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("data student:", res.data);

    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// lấy danh sách Q&A của khóa học (route: /questions/course/{courseId})
export const getCourseQuestionsAPI = async (courseId, token) => {
  const res = await axios.get(`${BASE_URL}/questions/course/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// đăng TRẢ LỜI (route: /questions/{questionId}/reply)
export const postReplyAPI = async (questionId, content, token) => {
  const res = await axios.post(`${BASE_URL}/questions/${questionId}/reply`,
    { content: content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// XÓA CÂU HỎI (Question) - Instructor
export const deleteQuestionAPI = async (questionId, token) => {
  const res = await axios.delete(`${BASE_URL}/questions/${questionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// XÓA REPLY (Câu trả lời) - Instructor
export const deleteReplyAPI = async (questionId, replyId, token) => {
  const res = await axios.delete(`${BASE_URL}/questions/${questionId}/reply/${replyId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};