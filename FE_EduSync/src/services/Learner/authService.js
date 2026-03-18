import axios from "axios";

const API_URL = "http://127.0.0.1:8000/auth";

// Login learner
export const loginAPI = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  return response.data;
};

// Register learner
export const registerAPI = async (name, email, password) => {
  const response = await axios.post(`${API_URL}/register`, {
    name,
    email,
    password,
  });
  return response.data;
};
