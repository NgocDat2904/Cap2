import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  fetchAdminCourseDetailAPI,
  approveCourseAPI,
  rejectCourseAPI,
} from "../../services/adminCourseAPI";
import {
  faArrowLeft,
  faPlayCircle,
  faCheckCircle,
  faBan,
  faTrash,
  faListUl,
  faInfoCircle,
  faUserTie,
  faTag,
  faDollarSign,
  faClockRotateLeft,
  faTimesCircle,
  faClock,
  faBell,
  faSave,
  faPenRuler,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const THUMB_FALLBACK =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80";

function formatUpdatedDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("vi-VN");
}

const AdminCourseDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [adminPrice, setAdminPrice] = useState("");
  const [loadState, setLoadState] = useState({ loading: true, error: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const loadCourse = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token || !id) {
      setLoadState({ loading: false, error: "Thiếu phiên đăng nhập hoặc mã khóa học." });
      setCourse(null);
      return;
    }
    setLoadState({ loading: true, error: "" });
    try {
      const data = await fetchAdminCourseDetailAPI(id, token);
      setCourse({
        ...data,
        lessons: Array.isArray(data?.lessons) ? data.lessons : [],
        status: String(data?.status || "").toLowerCase(),
      });
      setAdminPrice(
        data.price !== undefined && data.price !== null ? String(data.price) : "",
      );
      setLoadState({ loading: false, error: "" });
    } catch (e) {
      setCourse(null);
      setLoadState({ loading: false, error: e.message || "Không tải được khóa học" });
    }
  }, [id]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  if (loadState.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-400">
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-4xl animate-spin text-blue-500 mb-4"
        />
        <p className="font-bold">Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  if (loadState.error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 bg-slate-50 text-slate-600">
        <p className="font-bold text-red-600 mb-4">{loadState.error || "Không có dữ liệu"}</p>
        <button
          type="button"
          onClick={() => navigate("/admin/approvals")}
          className="px-4 py-2 bg-slate-200 rounded-xl font-bold hover:bg-slate-300"
        >
          Về hàng đợi duyệt
        </button>
      </div>
    );
  }

  // =========================================================================
  // LOGIC HÀNH ĐỘNG CỦA ADMIN
  // =========================================================================
  const handleApproveCourse = async () => {
    if (course.status !== "pending") return;
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Phiên đăng nhập hết hạn.");
      return;
    }
    const p =
      adminPrice === "" || adminPrice === null
        ? 0
        : parseFloat(String(adminPrice).replace(",", "."));
    if (Number.isNaN(p) || p < 0) {
      alert("Giá không hợp lệ (USD, ≥ 0 — 0 = miễn phí).");
      return;
    }
    const label = p === 0 ? "Miễn phí" : `$${p}`;
    if (!window.confirm(`Xác nhận xuất bản khóa học này với giá ${label}?`)) {
      return;
    }
    setActionLoading(true);
    try {
      await approveCourseAPI(id, p, token);
      alert("Đã xuất bản khóa học lên hệ thống.");
      navigate("/admin/approvals");
    } catch (e) {
      alert(e.message || "Phê duyệt thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCourse = async () => {
    if (course.status !== "pending") return;
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Phiên đăng nhập hết hạn.");
      return;
    }
    const reason = window.prompt(
      "Nhập lý do từ chối để phản hồi cho Giảng viên:",
      "",
    );
    if (reason === null) return;
    setActionLoading(true);
    try {
      await rejectCourseAPI(id, reason, token);
      alert("Đã từ chối khóa học.");
      await loadCourse();
    } catch (e) {
      alert(e.message || "Từ chối thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveUpdate = (isPriceChanged) => {
    const confirmMsg = isPriceChanged
      ? `Lưu mức giá mới là $${adminPrice} và Đánh dấu đã xem cập nhật?`
      : "Giữ nguyên mức giá cũ và Đánh dấu đã xem cập nhật?";

    if (window.confirm(confirmMsg)) {
      setCourse({ ...course, has_new_update: false, price: adminPrice });
      alert("Đã xử lý bản cập nhật thành công!");
    }
  };

  const handleToggleSuspension = () => {
    const newStatus = course.status === "suspended" ? "published" : "suspended";
    if (
      window.confirm(
        `Bạn có chắc chắn muốn ${newStatus === "suspended" ? "đình chỉ" : "khôi phục"} khóa học này?`,
      )
    ) {
      setCourse({ ...course, status: newStatus });
    }
  };

  const handleDeleteCourse = () => {
    alert("Chức năng xóa khóa học chưa được kết nối API.");
  };

  const lessons = Array.isArray(course?.lessons) ? course.lessons : [];
  const firstLesson = lessons.find((l) => l.play_url || l.url) || null;
  const firstVideoUrl = firstLesson
    ? firstLesson.play_url || firstLesson.url || ""
    : "";

  // =========================================================================
  // HÀM RENDER CỘT PHẢI - 5 GIAO DIỆN TÁCH BIỆT RÕ RÀNG
  // =========================================================================
  const renderAdminActions = () => {
    // KỊCH BẢN 1: CÓ BẢN CẬP NHẬT MỚI TỪ GIẢNG VIÊN (Ưu tiên số 1)
    if (course.has_new_update) {
      return (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl shadow-sm p-6 relative overflow-hidden">
          <h3 className="text-lg font-black text-amber-800 mb-2 flex items-center gap-2">
            <FontAwesomeIcon
              icon={faBell}
              className="text-amber-500 animate-bounce"
            />
            Xem xét lại Giá bán
          </h3>
          <p className="text-amber-700/80 text-xs font-medium mb-5">
            Giảng viên vừa cập nhật nội dung! Bạn có thể điều chỉnh giá bán nếu
            nhận thấy bản cập nhật này làm khóa học chất lượng hơn.
          </p>

          <div className="mb-6">
            <label className="block text-xs font-bold text-amber-800 mb-2 uppercase tracking-wider">
              Mức giá mới (USD)
            </label>
            <div className="relative">
              <FontAwesomeIcon
                icon={faDollarSign}
                className="absolute left-4 top-3.5 text-slate-400"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={adminPrice}
                onChange={(e) => setAdminPrice(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-amber-200 rounded-xl text-slate-800 font-black text-lg focus:ring-4 focus:ring-amber-500/20 outline-none"
              />
            </div>
          </div>
          <button
            onClick={() => handleResolveUpdate(adminPrice !== course.price)}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl transition-all shadow-md active:scale-95 flex justify-center items-center gap-2"
          >
            <FontAwesomeIcon icon={faSave} />{" "}
            {adminPrice !== course.price
              ? "Lưu giá mới & Tắt thông báo"
              : "Giữ nguyên & Tắt thông báo"}
          </button>
        </div>
      );
    }

    // KỊCH BẢN 2: KHÓA HỌC CHỜ DUYỆT (PENDING)
    if (course.status === "pending") {
      return (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-xl p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
          <h3 className="text-lg font-black text-white mb-2 relative z-10 flex items-center gap-2">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-emerald-400"
            />
            Thiết lập giá bán (USD)
          </h3>
          <p className="text-blue-200 text-xs font-medium mb-5 relative z-10">
            Nội dung đạt chuẩn? Hãy định giá để xuất bản lên sàn.
          </p>
          <div className="relative z-10 mb-6">
            <div className="relative">
              <FontAwesomeIcon
                icon={faDollarSign}
                className="absolute left-4 top-3.5 text-slate-400"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="VD: 49.99 (Để 0 nếu miễn phí)"
                value={adminPrice}
                onChange={(e) => setAdminPrice(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-0 rounded-xl text-slate-800 font-black text-lg focus:ring-4 focus:ring-emerald-500/30 outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 relative z-10">
            <button
              type="button"
              onClick={handleApproveCourse}
              disabled={actionLoading}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl transition-colors shadow-lg shadow-emerald-500/30 active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {actionLoading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faCheckCircle} />
              )}{" "}
              Phê duyệt & Xuất bản
            </button>
            <button
              type="button"
              onClick={handleRejectCourse}
              disabled={actionLoading}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              Từ chối duyệt
            </button>
          </div>
        </div>
      );
    }

    // KỊCH BẢN 3: BỊ TỪ CHỐI (REJECTED)
    if (course.status === "rejected") {
      return (
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 text-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-red-500 mb-3 shadow-sm border border-red-100">
            <FontAwesomeIcon icon={faTimesCircle} className="text-2xl" />
          </div>
          <h3 className="text-base font-black text-red-700 mb-2">
            Khóa học đã bị từ chối!
          </h3>
          <p className="text-xs text-red-600/80 font-medium">
            Bạn đã từ chối duyệt khóa học này. Giảng viên cần phải chỉnh sửa lại
            nội dung và gửi lại yêu cầu duyệt.
          </p>
          {course.rejectReason ? (
            <p className="text-xs text-red-800 font-bold mt-3 text-left bg-white/60 p-2 rounded-lg border border-red-100">
              Lý do: {course.rejectReason}
            </p>
          ) : null}
        </div>
      );
    }

    // KỊCH BẢN 4: BẢN NHÁP (DRAFT)
    if (course.status === "draft") {
      return (
        <div className="bg-slate-100 border-2 border-slate-200 border-dashed rounded-3xl p-6 text-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3 shadow-sm">
            <FontAwesomeIcon icon={faPenRuler} className="text-xl" />
          </div>
          <h3 className="text-base font-black text-slate-700 mb-2">
            Khóa học đang soạn thảo
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Giảng viên chưa gửi yêu cầu duyệt. Không có hành động nào khả dụng
            lúc này.
          </p>
        </div>
      );
    }

    // KỊCH BẢN 5: ĐÃ XUẤT BẢN HOẶC BỊ ĐÌNH CHỈ (PUBLISHED / SUSPENDED)
    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
        <h3 className="text-lg font-black text-slate-900 mb-5">
          Hậu kiểm & Xử lý
        </h3>
        <button
          onClick={handleToggleSuspension}
          className={`w-full py-3.5 px-4 font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-95 ${
            course.status === "published"
              ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200"
              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200"
          }`}
        >
          <FontAwesomeIcon
            icon={course.status === "published" ? faBan : faCheckCircle}
          />
          {course.status === "published"
            ? "Đình chỉ khóa học này"
            : "Khôi phục / Bỏ đình chỉ"}
        </button>
      </div>
    );
  };

  // =========================================================================
  // RENDER UI CHUNG
  // =========================================================================
  const renderStatusBadge = (status) => {
    if (status === "published")
      return (
        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-xl flex items-center gap-2 border border-emerald-200">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>{" "}
          Đang hoạt động
        </span>
      );
    if (status === "pending")
      return (
        <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-bold rounded-xl flex items-center gap-2 border border-amber-200 animate-pulse">
          <FontAwesomeIcon icon={faClockRotateLeft} /> Đang chờ duyệt
        </span>
      );
    if (status === "rejected")
      return (
        <span className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-bold rounded-xl flex items-center gap-2 border border-red-200">
          <FontAwesomeIcon icon={faTimesCircle} /> Đã từ chối
        </span>
      );
    if (status === "draft")
      return (
        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl flex items-center gap-2 border border-slate-200">
          <FontAwesomeIcon icon={faPenRuler} /> Bản nháp GV
        </span>
      );
    return (
      <span className="px-3 py-1.5 bg-slate-800 text-white text-sm font-bold rounded-xl flex items-center gap-2 border border-slate-900">
        <FontAwesomeIcon icon={faBan} /> Bị đình chỉ
      </span>
    );
  };

  return (
    <div className="flex-1 p-6 sm:p-8 bg-slate-50 min-h-screen font-sans animate-fade-slide-up pb-20">
      <div className="max-w-[1600px] mx-auto mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-blue-600 font-bold text-sm flex items-center gap-2 transition-colors mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách
        </button>

        {/* THÔNG BÁO CẬP NHẬT TRÊN CÙNG */}
        {course.has_new_update && (
          <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4 shadow-sm animate-fade-slide-up">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faBell} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-amber-800 font-bold text-sm">
                Hệ thống báo cáo: Có bản cập nhật nội dung!
              </h3>
              <p className="text-amber-700/80 text-xs mt-0.5">
                Giảng viên vừa thêm/sửa bài giảng mới. Vui lòng xem bảng công cụ
                bên phải để xử lý.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {renderStatusBadge(course.status)}
              <span className="text-slate-400 font-bold text-sm border-l border-slate-300 pl-3">
                Mã: {course.id}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {course.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8 items-start">
        {/* CỘT TRÁI: VIDEO & GIÁO TRÌNH */}
        <div className="w-full lg:w-2/3 space-y-8">
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800 aspect-video relative flex flex-col items-center justify-center group">
            {firstVideoUrl ? (
              <video
                src={firstVideoUrl}
                controls
                className="absolute inset-0 w-full h-full object-contain bg-black"
                playsInline
              />
            ) : (
              <>
                <img
                  src={course.thumbnail || THUMB_FALLBACK}
                  alt="Thumbnail"
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                  onError={(ev) => {
                    ev.currentTarget.src = THUMB_FALLBACK;
                  }}
                />
                <button
                  type="button"
                  className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-blue-600 hover:scale-110 transition-all duration-300 shadow-2xl pointer-events-none"
                >
                  <FontAwesomeIcon icon={faPlayCircle} className="text-5xl ml-1" />
                </button>
              </>
            )}
            <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-black tracking-widest rounded-lg z-20 pointer-events-none">
              ADMIN AUDIT
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 sm:p-8">
            <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <FontAwesomeIcon icon={faListUl} className="text-blue-600" />
              Giáo trình ({lessons.length} bài)
            </h3>
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 bg-white hover:border-blue-200 hover:bg-slate-50 ${index === lessons.length - 1 && course.has_new_update ? "border-amber-300 bg-amber-50/30" : ""}`}
                >
                  {lesson.thumbnail_url ? (
                    <img
                      src={lesson.thumbnail_url}
                      alt=""
                      className="w-14 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                      onError={(ev) => {
                        ev.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 text-slate-400">
                      <FontAwesomeIcon icon={faPlayCircle} className="text-lg" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm line-clamp-1 text-slate-700 flex items-center gap-2">
                      {lesson.title}
                      {index === lessons.length - 1 &&
                        course.has_new_update && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded uppercase">
                            Mới thêm
                          </span>
                        )}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Dung lượng: {lesson.size}
                    </p>
                  </div>
                  <div className="shrink-0 text-xs font-bold text-slate-400 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <FontAwesomeIcon icon={faClock} /> {lesson.duration}
                  </div>
                </div>
              ))}
              {lessons.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">
                  Chưa có bài giảng nào.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: GỌI HÀM RENDER 5 KỊCH BẢN Ở ĐÂY */}
        <div className="w-full lg:w-1/3 space-y-6 sticky top-24">
          {/* NƠI PHÉP THUẬT XẢY RA: Hiển thị giao diện tương ứng */}
          {renderAdminActions()}

          {/* KHU VỰC THÔNG TIN CHUNG (Luôn hiện) */}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6">
            <h3 className="text-base font-extrabold text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />{" "}
              Thông tin chung
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUserTie} className="w-4" /> Giảng
                  viên
                </span>
                <span className="text-sm font-black text-slate-800">
                  {course.instructor}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500 flex items-center gap-2">
                  <FontAwesomeIcon icon={faTag} className="w-4" /> Phân loại
                </span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                  {course.category}
                </span>
              </li>
              {/* Hiện giá tiền nếu KHÔNG PHẢI đang Pending và KHÔNG bị báo cập nhật và KHÔNG phải Bản nháp */}
              {course.status !== "pending" &&
                !course.has_new_update &&
                course.status !== "draft" && (
                  <li className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500 flex items-center gap-2">
                      <FontAwesomeIcon icon={faDollarSign} className="w-4" />{" "}
                      Giá bán
                    </span>
                    <span className="text-sm font-black text-emerald-600">
                      ${course.price}
                    </span>
                  </li>
                )}
            </ul>
          </div>

          {/* NÚT XÓA (Luôn hiện dưới cùng) */}
          <button
            onClick={handleDeleteCourse}
            className="w-full py-3.5 px-4 bg-white text-red-500 font-bold rounded-2xl border border-red-200 hover:bg-red-50 flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-sm"
          >
            <FontAwesomeIcon icon={faTrash} /> Xóa vĩnh viễn hệ thống
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseDetail;
