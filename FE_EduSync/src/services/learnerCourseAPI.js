
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


export async function enrollFreeCourseAPI(courseId) {
  const token = localStorage.getItem("access_token");
  const res = await axios.post(`${BASE_URL}/learning/enroll`, { course_id: courseId }, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}

// lấy danh sách Q&A của khóa học
export const getCourseQuestionsAPI = async (courseId, token) => {
  const res = await axios.get(`${BASE_URL}/questions/course/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log("API Q&A Course:", res.data);
  return res.data;
};

// lấy danh sách Q&A của 1 lesson (video)
export const getLessonQuestionsAPI = async (lessonId, token) => {
  const res = await axios.get(`${BASE_URL}/questions/lesson/${lessonId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log("API Q&A Lesson:", res.data);
  return res.data;
};

// đăng CÂU HỎI MỚI (Dành cho Learner)
export const postQuestionAPI = async (courseId, lessonId, content, token) => {
  const res = await axios.post(`${BASE_URL}/questions`,
    {
      course_id: courseId,
      lesson_id: lessonId,
      content: content
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

//đăng TRẢ LỜI
export const postReplyAPI = async (questionId, content, token) => {
  const res = await axios.post(`${BASE_URL}/questions/${questionId}/reply`,
    { content: content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Lấy danh sách khóa học phổ biến
export const getPopularCoursesAPI = async () => {
  const token = localStorage.getItem("access_token");
  const res = await axios.get(`${BASE_URL}/courses/featured`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};