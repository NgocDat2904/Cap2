// File: src/services/instructorAPI.js

// Lấy thông tin riêng của Instructor
export const getInstructorProfileAPI = async (token) => {
  const response = await fetch("http://localhost:8000/instructor/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error("Lỗi lấy hồ sơ giảng viên");
  return await response.json();
};

// Cập nhật thông tin riêng của Instructor
export const updateInstructorProfileAPI = async (data, token) => {
  const response = await fetch(
    "http://localhost:8000/instructor/update-profile",
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) throw new Error("Lỗi cập nhật hồ sơ giảng viên");
  return await response.json();
};
