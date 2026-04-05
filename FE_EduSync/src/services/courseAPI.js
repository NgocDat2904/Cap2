// services/courseAPI.js
const BASE_URL = "http://localhost:8000";

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
  const urlVideo = `http://localhost:8000/videos/upload-url?filename=${safeFileName}`;
  
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
  const response = await fetch(`${BASE_URL}/videos`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...videoData,
      course_id: courseId, 
    }),
  });
  
  if (!response.ok) throw new Error("Lỗi khi lưu thông tin video vào CSDL");
  return await response.json();
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