import axios from "axios";

const BASE_URL = "http://localhost:8000/admin/revenue";

/**
 * Lấy thống kê tổng quan doanh thu theo năm
 * @param {number} year - Năm (2020-2030)
 * @param {string} token - JWT token
 */
export const getRevenueStatsAPI = async (year, token) => {
  const response = await axios.get(`${BASE_URL}/stats`, {
    params: { year },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Lấy dữ liệu biểu đồ doanh thu theo năm
 * @param {number} year - Năm (2020-2030)
 * @param {string} token - JWT token
 */
export const getRevenueChartAPI = async (year, token) => {
  const response = await axios.get(`${BASE_URL}/chart`, {
    params: { year },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Lấy top khóa học doanh thu cao nhất
 * @param {number} limit - Số lượng khóa học (1-50)
 * @param {string} token - JWT token
 */
export const getTopCoursesAPI = async (limit, token) => {
  const response = await axios.get(`${BASE_URL}/top-courses`, {
    params: { limit },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Lấy dữ liệu biểu đồ students theo năm
 * @param {number} year - Năm (2020-2030)
 * @param {string} token - JWT token
 */
export const getStudentsChartAPI = async (year, token) => {
  const response = await axios.get(`${BASE_URL}/students-chart`, {
    params: { year },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
