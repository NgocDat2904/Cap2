import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faBan,
  faEye,
  faListCheck,
  faTags,
  faXmark,
  faInbox,
  faSpinner,
  faBell, // ✅ Đã import thêm icon quả chuông
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import {
  fetchPendingCoursesAPI,
  approveCourseAPI,
  rejectCourseAPI,
} from "../../services/adminCourseAPI";

const THUMB_FALLBACK =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80";

function formatSubmittedAt(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AdminApprovalQueue = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [priceInput, setPriceInput] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadQueue = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setQueue([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchPendingCoursesAPI(token, 1, 100);
      setQueue(Array.isArray(data.items) ? data.items : []);
      setTotal(typeof data.total === "number" ? data.total : data.items?.length ?? 0);
    } catch (e) {
      console.error(e);
      alert(e.message || "Không tải được danh sách chờ duyệt");
      setQueue([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const openApproveModal = (course) => {
    setSelectedCourse(course);
    setPriceInput("");
    setIsModalOpen(true);
  };

  const handleConfirmApprove = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Phiên đăng nhập hết hạn.");
      return;
    }
    const p =
      priceInput === "" || priceInput === null
        ? 0
        : parseFloat(String(priceInput).replace(",", "."));
    if (Number.isNaN(p) || p < 0) {
      alert("Giá không hợp lệ (USD, ≥ 0 — 0 = miễn phí).");
      return;
    }
    setActionLoading(true);
    try {
      await approveCourseAPI(selectedCourse.id, p, token);
      alert(
        `Đã xuất bản khóa học "${selectedCourse.title}" với giá ${p === 0 ? "Miễn phí" : `$${p}`}.`,
      );
      setIsModalOpen(false);
      await loadQueue();
    } catch (err) {
      alert(err.message || "Phê duyệt thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (courseId) => {
    if (
      !window.confirm("Từ chối khóa học này? Khóa học sẽ được trả lại cho giảng viên.")
    ) {
      return;
    }
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Phiên đăng nhập hết hạn.");
      return;
    }
    const reason = window.prompt("Lý do từ chối (tùy chọn):", "") ?? "";
    setActionLoading(true);
    try {
      await rejectCourseAPI(courseId, reason, token);
      alert("Đã từ chối khóa học.");
      await loadQueue();
    } catch (err) {
      alert(err.message || "Từ chối thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 sm:p-8 bg-slate-50 min-h-screen font-sans animate-fade-slide-up">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <FontAwesomeIcon icon={faListCheck} className="text-blue-600" />
            Hàng đợi Phê duyệt
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Giải quyết các yêu cầu xuất bản khóa học từ giảng viên.
          </p>
        </div>
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-bold text-sm border border-red-200 shadow-sm">
          Cần xử lý: <span className="text-lg">{total}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[320px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-500">
            <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-500 mb-4" />
            <p className="font-bold">Đang tải danh sách chờ duyệt...</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-24 h-24 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center text-4xl mb-4">
              <FontAwesomeIcon icon={faInbox} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              Không có khóa học nào đang chờ duyệt.
            </h3>
            <p className="text-slate-500 mt-2">
              Khi giảng viên gửi duyệt, danh sách sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="p-5 min-w-[300px]">Khóa học yêu cầu</th>
                  <th className="p-5">Thời gian gửi</th>
                  <th className="p-5 text-center">Số bài giảng</th>
                  <th className="p-5 text-right">Quyết định</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={course.thumbnail || THUMB_FALLBACK}
                          alt=""
                          className="w-20 h-12 rounded-lg object-cover border border-slate-200 shadow-sm"
                          onError={(ev) => {
                            ev.currentTarget.src = THUMB_FALLBACK;
                          }}
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">
                            {course.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            GV:{" "}
                            <span className="font-semibold">{course.instructor}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-sm font-semibold text-slate-700">
                        {formatSubmittedAt(course.submittedAt)}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg text-sm">
                        {course.videoCount}
                      </span>
                    </td>
                    {/* ✅ ĐÃ THAY THẾ KHÚC RENDER NÚT BẤM THEO NGHIỆP VỤ MỚI Ở ĐÂY */}
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {course.status === "approved" && course.has_pending_update ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/courses/${course.id}/approval`)}
                            className="px-4 py-2 bg-amber-100 text-amber-700 font-bold rounded-xl hover:bg-amber-500 hover:text-white transition-colors text-sm flex items-center gap-2 shadow-sm"
                          >
                            <FontAwesomeIcon icon={faBell} className="animate-bounce" /> Xử lý cập nhật & Giá
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/courses/${course.id}/approval`)}
                              disabled={actionLoading}
                              className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                              <FontAwesomeIcon icon={faEye} /> Xem chi tiết
                            </button>
                            <button
                              type="button"
                              onClick={() => openApproveModal(course)}
                              disabled={actionLoading}
                              className="px-4 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-500 hover:text-white transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} /> Phê duyệt
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(course.id)}
                              disabled={actionLoading}
                              className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                            >
                              <FontAwesomeIcon icon={faBan} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !actionLoading && setIsModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-slide-up">
            <div className="bg-emerald-600 p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black mb-1">Xác nhận Xuất bản</h3>
                <p className="text-emerald-100 text-sm font-medium line-clamp-2">
                  {selectedCourse.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => !actionLoading && setIsModalOpen(false)}
                className="text-emerald-200 hover:text-white"
              >
                <FontAwesomeIcon icon={faXmark} className="text-2xl" />
              </button>
            </div>
            <form onSubmit={handleConfirmApprove} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faTags} className="text-slate-400" /> Giá bán (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="VD: 49.99 — để trống hoặc 0 = miễn phí"
                  className="w-full text-lg px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : null}
                  Lên sóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalQueue;