const BASE_URL = "http://localhost:8000";

async function parseErrorMessage(res, fallback) {
  try {
    const j = await res.json();
    if (j.detail != null) {
      return typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

export async function fetchPendingCoursesAPI(token, page = 1, limit = 50) {
  const res = await fetch(
    `${BASE_URL}/admin/courses/pending?page=${page}&limit=${limit}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Không tải được danh sách chờ duyệt"));
  }
  return res.json();
}

export async function fetchAdminCourseDetailAPI(courseId, token) {
  const res = await fetch(`${BASE_URL}/admin/courses/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) {
    throw new Error("Không tìm thấy khóa học");
  }
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Lỗi tải chi tiết khóa học"));
  }
  return res.json();
}

export async function approveCourseAPI(courseId, price, token) {
  const q = encodeURIComponent(String(price));
  const res = await fetch(
    `${BASE_URL}/admin/courses/${courseId}/approve?price=${q}`,
    { method: "PUT", headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Phê duyệt thất bại"));
  }
  return res.json();
}

export async function rejectCourseAPI(courseId, reason, token) {
  const q = encodeURIComponent(reason || "");
  const res = await fetch(
    `${BASE_URL}/admin/courses/${courseId}/reject?reason=${q}`,
    { method: "PUT", headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Từ chối thất bại"));
  }
  return res.json();
}

/**
 * Admin xác nhận review xong bản cập nhật của khóa học đang PUBLISHED.
 * - Approve tất cả lesson đang chờ duyệt
 * - Tắt cờ has_pending_update
 * - Cập nhật giá nếu newPrice được truyền vào (null = giữ nguyên)
 */
export async function resolveUpdateAPI(courseId, newPrice, token) {
  const params = newPrice !== null && newPrice !== undefined
    ? `?price=${encodeURIComponent(newPrice)}`
    : "";
  const res = await fetch(
    `${BASE_URL}/admin/courses/${courseId}/resolve-update${params}`,
    { method: "PUT", headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Xử lý cập nhật thất bại"));
  }
  return res.json();
}
