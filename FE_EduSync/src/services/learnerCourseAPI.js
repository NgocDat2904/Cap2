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
  if (!res.ok) throw new Error(await parseError(res, "Không tải được khóa học"));
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
  if (!res.ok) throw new Error(await parseError(res, "Không tìm kiếm được khóa học"));
  return res.json();
}

export async function getCourseDetailAPI(courseId) {
  const res = await fetch(`${BASE_URL}/courses/detail/${courseId}`);
  if (res.status === 404) throw new Error("Không tìm thấy khóa học");
  if (!res.ok) throw new Error(await parseError(res, "Không tải được chi tiết khóa học"));
  return res.json();
}
