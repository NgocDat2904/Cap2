import axios from "axios";

const API_URL = "http://127.0.0.1:8000/auth";

// Login learner
export const loginAPI = async (email, password) => {
  const response = await axios.post(`${API_URL}/learner/login`, {
    email,
    password,
  });
  return response.data;
};

// Register learner
export const registerAPI = async (name, email, password, confirm_password) => {
  const response = await axios.post(`${API_URL}/learner/register`, {
    name,
    email,
    password,
    confirm_password,
  });
  return response.data;
};

// Login instructor
export const loginInstructorAPI = async (email, password) => {
  const response = await axios.post(`${API_URL}/instructor/login`, {
    email,
    password,
  });
  return response.data;
};

// Register instructor (if needed in the future)
export const registerInstructorAPI = async (
  name,
  email,
  password,
  confirm_password,
) => {
  const response = await axios.post(`${API_URL}/instructor/register`, {
    name,
    email,
    password,
    confirm_password,
  });
  return response.data;
};

// login admin
export const loginAdminAPI = async (email, password) => {
  const response = await axios.post(`${API_URL}/admin/login`, {
    email,
    password,
  });
  return response.data;
};

// logout
export const logoutAPI = async (token) => {
  const response = await axios.post(
    `${API_URL}/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
};
