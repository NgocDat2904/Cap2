const BASE_URL = "http://localhost:8000";

async function parseError(res, fallback) {
  try {
    const data = await res.json();
    if (typeof data.detail === "string") return data.detail;
  } catch {
    // ignore
  }
  return fallback;
}

export async function getPublicCoursesAPI({ page = 1, limit = 12 } = {}) {
  const res = await fetch(`${BASE_URL}/courses?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(await parseError(res, "Failed to load courses"));
  return res.json();
}

export async function searchPublicCoursesAPI({
  keyword = "",
  category = "",
  page = 1,
  limit = 12,
} = {}) {
  const k = encodeURIComponent(keyword);
  const c = encodeURIComponent(category);
  const res = await fetch(
    `${BASE_URL}/courses/search?keyword=${k}&category=${c}&page=${page}&limit=${limit}`,
  );
  if (!res.ok) throw new Error(await parseError(res, "Failed to search courses"));
  return res.json();
}

export async function getCourseDetailAPI(courseId) {
  const res = await fetch(`http://localhost:8000/courses/detail/${courseId}`);
  if (res.status === 404) throw new Error("Course not found");
  if (!res.ok) throw new Error(await parseError(res, "Failed to load course details"));
  
  const data = await res.json();   // 👈 LẤY DATA RA
  // 🔥 THÊM LOG Ở ĐÂY
  console.log("🔥 learner API FIXED:", data);

  return data;

}


/**
 * Lấy danh sách khóa học của learner đang đăng nhập
 * Endpoint: GET /learning/my-courses
 */
export async function getMyCoursesAPI() {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${BASE_URL}/learning/my-courses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error("Session expired. Please sign in again.");
  if (!res.ok) throw new Error(await parseError(res, "Failed to load your courses."));
  return res.json(); // Trả về mảng courses
}
