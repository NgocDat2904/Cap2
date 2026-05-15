import axios from "axios";

const BASE_URL = "http://localhost:8000/payments";

/**
 * Lấy lịch sử giao dịch của learner
 * @param {string} token - JWT token
 */
export const getPaymentHistoryAPI = async (token) => {
  const response = await axios.get(`${BASE_URL}/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Tạo thanh toán mới
 * @param {string} courseId - ID khóa học
 * @param {string} token - JWT token
 */
export const createPaymentAPI = async (courseId, token) => {
  const response = await axios.post(
    `${BASE_URL}/create`,
    { course_id: courseId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Xóa 1 giao dịch khỏi lịch sử
 * @param {string} paymentId - ID giao dịch
 * @param {string} token - JWT token
 */
export const deletePaymentHistoryAPI = async (paymentId, token) => {
  const response = await axios.delete(`${BASE_URL}/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
