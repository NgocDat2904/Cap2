import axios from "axios";

const BASE_URL = "http://localhost:8000";

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

function parseAxiosError(error, fallback) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (detail != null) return JSON.stringify(detail);
  return fallback;
}

export async function fetchAllAdminCoursesAPI(token, params = {}) {
  try {
    const response = await axios.get(`${BASE_URL}/admin/courses`, {
      params,
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw new Error(parseAxiosError(error, "Failed to load all courses"));
  }
}

export async function fetchPendingCoursesAPI(token, page = 1, limit = 50) {
  try {
    const response = await axios.get(`${BASE_URL}/admin/courses/pending`, {
      params: { page, limit },
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw new Error(parseAxiosError(error, "Failed to load approval queue"));
  }
}

export async function fetchAdminCoursesAPI(
  token,
  search = "",
  category = "",
  status = "",
  page = 1,
  limit = 50,
) {
  try {
    const params = { page, limit };
    if (search) params.q = search;
    if (category && category !== "All") params.category = category;
    if (status && status !== "all") params.status = status;

    const response = await axios.get(`${BASE_URL}/admin/courses`, {
      params,
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    throw new Error(parseAxiosError(error, "Failed to load courses"));
  }
}

export async function fetchAdminCourseDetailAPI(courseId, token) {
  try {
    const response = await axios.get(`${BASE_URL}/admin/courses/${courseId}`, {
      headers: authHeaders(token),
    });
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      throw new Error("Course not found");
    }
    throw new Error(parseAxiosError(error, "Error loading course details"));
  }
}

export async function approveCourseAPI(courseId, price, token) {
  try {
    const response = await axios.put(
      `${BASE_URL}/admin/courses/${courseId}/approve`,
      null,
      {
        params: { price: String(price) },
        headers: authHeaders(token),
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(parseAxiosError(error, "Approval failed"));
  }
}

export async function rejectCourseAPI(courseId, reason, token) {
  try {
    const response = await axios.put(
      `${BASE_URL}/admin/courses/${courseId}/reject`,
      null,
      {
        params: { reason: reason || "" },
        headers: authHeaders(token),
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(parseAxiosError(error, "Từ chối thất bại"));
  }
}

export async function resolveUpdateAPI(courseId, newPrice, token) {
  try {
    const response = await axios.put(
      `${BASE_URL}/admin/courses/${courseId}/resolve-update`,
      null,
      {
        params: {
          price: newPrice,
        },
        headers: authHeaders(token),
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(parseAxiosError(error, "Xử lý cập nhật thất bại"));
  }
}
export async function moderateCourseAPI(courseId, status, token) {
  try {
    const response = await axios.put(
      `${BASE_URL}/admin/courses/${courseId}/moderate`,
      null,
      {
        params: { status },
        headers: authHeaders(token),
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(parseAxiosError(error, "Cập nhật trạng thái thất bại"));
  }
}

export async function deleteCourseAPI(courseId, token) {
  try {
    const response = await axios.delete(
      `${BASE_URL}/admin/courses/${courseId}`,
      {
        headers: authHeaders(token),
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(parseAxiosError(error, "Xóa khóa học thất bại"));
  }
}

export async function updateCourseAPI(courseId, data, token) {
  try {
    const response = await axios.put(
      `${BASE_URL}/admin/courses/${courseId}`,
      data,
      {
        headers: authHeaders(token),
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(parseAxiosError(error, "Cập nhật khóa học thất bại"));
  }
}

export async function uploadCourseThumbnailAPI(file, token) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `${BASE_URL}/admin/courses/thumbnail`,
      formData,
      {
        headers: {
          ...authHeaders(token),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(parseAxiosError(error, "Tải lên thumbnail thất bại"));
  }
}

export async function deleteLessonAPI(lessonId, token) {
  try {
    const response = await axios.delete(
      `${BASE_URL}/instructor/lessons/${lessonId}`,
      {
        headers: authHeaders(token),
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(parseAxiosError(error, "Xóa bài học thất bại"));
  }
}

export async function deleteVideoAPI(videoId, token) {
  try {
    const response = await axios.delete(
      `${BASE_URL}/instructor/videos/${videoId}`,
      {
        headers: authHeaders(token),
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(parseAxiosError(error, "Xóa video thất bại"));
  }
}
