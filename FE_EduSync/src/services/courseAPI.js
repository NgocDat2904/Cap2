import axios from "axios";
// services/courseAPI.js
const BASE_URL = "http://localhost:8000";

// Ảnh bìa khóa học (Cloudinary) — dùng chung cho từng bài giảng
export async function uploadCourseThumbnailAPI(file, token) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axios.post(
      `${BASE_URL}/instructor/courses/thumbnail`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return data;
  } catch (error) {
    console.error(
      "Upload thumbnail error:",
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.detail ||
        "Failed to upload thumbnail to Cloudinary",
    );
  }
}

// Tạo khóa học mới (Nháp)
export const createCourseAPI = async (courseData, token) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/instructor/courses`,
      courseData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data; // Backend trả về { id: "..." }
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to create course");
  }
};

// Xin link mây (Presigned URL) từ Backend
export const getPresignedUrlAPI = async (
  courseId,
  fileName,
  contentType,
  token,
) => {
  // ĐÃ SỬA CHUẨN 100% THEO POSTMAN: Ép tên file lên thẳng thanh địa chỉ URL
  // Dùng encodeURIComponent để lỡ tên video của má có dấu cách (space) thì nó không bị lỗi mạng
  const safeFileName = encodeURIComponent(fileName);
  const ct = encodeURIComponent(contentType || "video/mp4");
  const urlVideo = `${BASE_URL}/instructor/videos/upload-url?filename=${safeFileName}&content_type=${ct}`;

  try {
    const response = await axios.post(
      urlVideo,
      {
        // Backend đã lấy filename từ URL rồi, nhưng vẫn gửi courseId để backend tiện quản lý
        course_id: courseId,
        content_type: contentType,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to get Google Cloud upload token",
    );
  }
};
// Đẩy Video thẳng lên Google Cloud (KHÔNG GỌI BACKEND MÀ GỌI THẲNG GOOGLE)
export const uploadVideoToGCS = async (presignedUrl, file) => {
  try {
    await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type, // Phải truyền đúng chuẩn video/mp4
      },
    });
    return true;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Failed to upload video to Google Cloud",
    );
  }
};

// Báo Backend lưu Video vào Database
export const saveVideoToDBAPI = async (courseId, videoData, token) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/instructor/videos`,
      videoData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    const detail = error.response?.data?.detail;
    if (Array.isArray(detail)) {
      throw new Error(detail.map((d) => d.msg || JSON.stringify(d)).join("; "));
    }
    throw new Error(detail || "Failed to save video info to database");
  }
};

export const createLessonAPI = async (lessonData, token) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/instructor/lessons`,
      lessonData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to create lesson");
  }
};

// Gửi duyệt khóa học
export const submitCourseAPI = async (courseId, token) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/instructor/courses/${courseId}/submit`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.detail || "Lỗi khi gửi duyệt khóa học",
    );
  }
};

export const trackViewAPI = async (videoId, watchedSeconds, completed) => {
  try {
    const token = localStorage.getItem("access_token");

    const response = await axios.post(
      `${BASE_URL}/videos/${videoId}/track-view`,

      {
        watched_seconds: watchedSeconds,

        completed,
      },

      {
        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to track view");
  }
};
