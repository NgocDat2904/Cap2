// services/courseAPI.js
const BASE_URL = "http://localhost:8000";

// Ảnh bìa khóa học (Cloudinary) — dùng chung cho từng bài giảng
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
    let detail = "Không tải được ảnh bìa lên Cloudinary";
    try {
      const err = await response.json();
      if (typeof err.detail === "string") detail = err.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return response.json();
};

// 1. Tạo khóa học mới (Nháp)
export const createCourseAPI = async (courseData, token) => {
  const response = await fetch(`${BASE_URL}/instructor/courses`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(courseData),
  });
  if (!response.ok) throw new Error("Lỗi khi tạo khóa học");
  return await response.json(); // Backend trả về { id: "..." }
};

// 2. Xin link mây (Presigned URL) từ Backend
export const getPresignedUrlAPI = async (courseId, fileName, contentType, token) => {
  
  // ĐÃ SỬA CHUẨN 100% THEO POSTMAN: Ép tên file lên thẳng thanh địa chỉ URL
  // Dùng encodeURIComponent để lỡ tên video của má có dấu cách (space) thì nó không bị lỗi mạng
  const safeFileName = encodeURIComponent(fileName);
  const ct = encodeURIComponent(contentType || "video/mp4");
  const urlVideo = `${BASE_URL}/instructor/videos/upload-url?filename=${safeFileName}&content_type=${ct}`;
  
  const response = await fetch(urlVideo, {
    method: "POST", 
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    // Backend đã lấy filename từ URL rồi, nhưng con vẫn gửi courseId kèm theo cho ổng dễ quản lý
    body: JSON.stringify({ 
        course_id: courseId,
        content_type: contentType 
    }),
  });

  if (!response.ok) throw new Error("Không lấy được vé thông hành Google Cloud");
  return await response.json(); 
};
// 3. Đẩy Video thẳng lên Google Cloud (KHÔNG GỌI BACKEND MÀ GỌI THẲNG GOOGLE)
export const uploadVideoToGCS = async (presignedUrl, file) => {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type, // Phải truyền đúng chuẩn video/mp4
    },
    body: file, // Bơm trực tiếp file, không dùng FormData
  });
  if (!response.ok) throw new Error("Lỗi khi up video lên mây Google");
  return true;
};

// 4. Báo Backend lưu Video vào Database
export const saveVideoToDBAPI = async (courseId, videoData, token) => {
  const response = await fetch(`${BASE_URL}/instructor/videos`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(videoData),
  });
  
  if (!response.ok) {
    let detail = "Lỗi khi lưu thông tin video vào CSDL";
    try {
      const err = await response.json();
      if (Array.isArray(err.detail)) {
        detail = err.detail.map((d) => d.msg || JSON.stringify(d)).join("; ");
      } else if (typeof err.detail === "string") {
        detail = err.detail;
      }
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return await response.json();
};

export const createSectionAPI = async (sectionData, token) => {
  const response = await fetch(`${BASE_URL}/instructor/sections`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sectionData),
  });

  if (!response.ok) {
    let detail = "Lỗi khi tạo section";
    try {
      const err = await response.json();
      if (typeof err.detail === "string") detail = err.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  return response.json();
};

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
    let detail = "Lỗi khi tạo bài giảng";
    try {
      const err = await response.json();
      if (typeof err.detail === "string") detail = err.detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }

  return response.json();
};

// 5. Gửi duyệt khóa học
export const submitCourseAPI = async (courseId, token) => {
  const response = await fetch(`${BASE_URL}/instructor/courses/${courseId}/submit`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Lỗi khi gửi duyệt khóa học");
  return await response.json();
};