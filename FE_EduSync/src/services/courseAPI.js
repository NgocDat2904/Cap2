// services/courseAPI.js

const BASE_URL = "http://localhost:8000";

// =========================================================
// UPLOAD COURSE THUMBNAIL
// =========================================================

export const uploadCourseThumbnailAPI = async (file, token) => {
  const fd = new FormData();

  fd.append("file", file);

  const response = await fetch(`${BASE_URL}/instructor/courses/thumbnail`, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${token}`,
    },

    body: fd,
  });

  if (!response.ok) {
    let detail = "Failed to upload thumbnail";

    try {
      const err = await response.json();

      if (typeof err.detail === "string") {
        detail = err.detail;
      }
    } catch {
      // ignore
    }

    throw new Error(detail);
  }

  return response.json();
};

// =========================================================
// CREATE COURSE
// =========================================================

export const createCourseAPI = async (courseData, token) => {
  const response = await fetch(`${BASE_URL}/instructor/courses`, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${token}`,

      "Content-Type": "application/json",
    },

    body: JSON.stringify(courseData),
  });

  if (!response.ok) {
    throw new Error("Failed to create course");
  }

  return response.json();
};

// =========================================================
// GET PRESIGNED URL
// =========================================================

export const getPresignedUrlAPI = async (
  courseId,
  fileName,
  contentType,
  token,
) => {
  const safeFileName = encodeURIComponent(fileName);

  const ct = encodeURIComponent(contentType || "video/mp4");

  const urlVideo =
    `${BASE_URL}/instructor/videos/upload-url` +
    `?filename=${safeFileName}` +
    `&content_type=${ct}`;

  const response = await fetch(urlVideo, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${token}`,

      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      course_id: courseId,
      content_type: contentType,
    }),
  });

  if (!response.ok) {
    console.error("FAILED PRESIGN RESPONSE:", response);

    throw new Error("Failed to get Google Cloud upload token");
  }

  const data = await response.json();

  console.log("PRESIGNED DATA:", data);

  return data;
};

// =========================================================
// UPLOAD VIDEO TO GOOGLE CLOUD
// =========================================================

export const uploadVideoToGCS = async (uploadUrl, file) => {
  try {
    console.log("RAW UPLOAD URL:", uploadUrl);

    // =====================================================
    // HANDLE STRING / OBJECT
    // =====================================================

    const finalUploadUrl =
      typeof uploadUrl === "string"
        ? uploadUrl
        : uploadUrl?.signed_url || uploadUrl?.url || uploadUrl?.upload_url;

    console.log("FINAL UPLOAD URL:", finalUploadUrl);

    if (!finalUploadUrl) {
      throw new Error("Upload URL invalid");
    }

    const response = await fetch(finalUploadUrl, {
      method: "PUT",

      headers: {
        "Content-Type": file.type,
      },

      body: file,
    });

    if (!response.ok) {
      console.error("GCS UPLOAD FAILED:", response);

      throw new Error(`GCS Upload Failed: ${response.status}`);
    }

    console.log("VIDEO UPLOADED SUCCESSFULLY");

    return true;
  } catch (error) {
    console.error("UPLOAD VIDEO ERROR:", error);

    throw new Error("Failed to upload video to Google Cloud");
  }
};

// =========================================================
// SAVE VIDEO TO DATABASE
// =========================================================

export const saveVideoToDBAPI = async (courseId, videoData, token) => {
  const response = await fetch(`${BASE_URL}/instructor/videos`, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${token}`,

      "Content-Type": "application/json",
    },

    body: JSON.stringify(videoData),
  });

  if (!response.ok) {
    let detail = "Failed to save video";

    try {
      const err = await response.json();

      if (Array.isArray(err.detail)) {
        detail = err.detail.map((d) => d.msg || JSON.stringify(d)).join("; ");
      } else if (typeof err.detail === "string") {
        detail = err.detail;
      }
    } catch {
      // ignore
    }

    throw new Error(detail);
  }

  return response.json();
};

// =========================================================
// CREATE LESSON
// =========================================================

export const createLessonAPI = async (lessonData, token) => {
  const response = await fetch(`${BASE_URL}/instructor/lessons`, {
    method: "POST",

    headers: {
      Authorization: `Bearer ${token}`,

      "Content-Type": "application/json",
    },

    body: JSON.stringify(lessonData),
  });

  if (!response.ok) {
    let detail = "Failed to create lesson";

    try {
      const err = await response.json();

      if (typeof err.detail === "string") {
        detail = err.detail;
      }
    } catch {
      // ignore
    }

    throw new Error(detail);
  }

  return response.json();
};

// =========================================================
// SUBMIT COURSE
// =========================================================

export const submitCourseAPI = async (courseId, token) => {
  const response = await fetch(
    `${BASE_URL}/instructor/courses/${courseId}/submit`,
    {
      method: "PUT",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Lỗi khi gửi duyệt khóa học");
  }

  return response.json();
};
