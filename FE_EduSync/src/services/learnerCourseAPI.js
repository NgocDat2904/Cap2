
import axios from "axios";
const BASE_URL = "http://localhost:8000";

async function parseError(error, fallback) {
  if (error.response && error.response.data && typeof error.response.data.detail === "string") {
    return error.response.data.detail;
  }
  return fallback;
}

export async function getPublicCoursesAPI({ page = 1, limit = 12 } = {}) {
  try {
    const res = await axios.get(`${BASE_URL}/courses`, {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    throw new Error(await parseError(error, "Failed to load courses"));
  }
}

export async function searchPublicCoursesAPI({
  keyword = "",
  category = "",
  page = 1,
  limit = 12,
} = {}) {
  try {
    const res = await axios.get(`${BASE_URL}/courses/search`, {
      params: { keyword, category, page, limit },
    });
    return res.data;
  } catch (error) {
    throw new Error(await parseError(error, "Failed to search courses"));
  }
}

export async function getCourseDetailAPI(courseId) {
  try {
    const res = await axios.get(`http://localhost:8000/courses/detail/${courseId}`);
    const data = res.data;
    console.log("learner API FIXED:", data);
    return data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error("Course not found");
    }
    throw new Error(await parseError(error, "Failed to load course details"));
  }
}


/**
 * Lấy danh sách khóa học của learner đang đăng nhập
 * Endpoint: GET /learning/my-courses
 */
export async function getMyCoursesAPI() {
  const token = localStorage.getItem("access_token");
  try {
    const res = await axios.get(`${BASE_URL}/learning/my-courses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error("Session expired. Please sign in again.");
    }
    throw new Error(await parseError(error, "Failed to load your courses."));
  }
}
