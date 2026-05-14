import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  faEdit, 
} from "@fortawesome/free-solid-svg-icons";
import toast from "../../utils/toast";
import {
  fetchAdminCourseDetailAPI,
  approveCourseAPI,
  rejectCourseAPI,
  resolveUpdateAPI
} from "../../services/adminCourseAPI";

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
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");

  const loadCourse = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token || !id) {
      setLoadState({ loading: false, error: "Thiếu thông tin phiên đăng nhập hoặc mã định danh khóa học." });
      setCourse(null);
      return;
    }
    setLoadState({ loading: true, error: "" });
    try {
      const data = await fetchAdminCourseDetailAPI(id, token);
      
      const fetchedLessons = Array.isArray(data?.lessons) ? data.lessons : [];
      setCourse({
        ...data,
        lessons: fetchedLessons,
        status: String(data?.status || "").toLowerCase(),
      });
      
      setAdminPrice(
        data.price !== undefined && data.price !== null ? String(data.price) : "",
      );

      const firstValidLesson = fetchedLessons.find((l) => l.play_url || l.url);
      if (firstValidLesson) {
        setCurrentVideoUrl(firstValidLesson.play_url || firstValidLesson.url);
      }

      setLoadState({ loading: false, error: "" });
    } catch (e) {
      setCourse(null);
      setLoadState({ loading: false, error: "Lỗi hệ thống: Không thể truy xuất dữ liệu chi tiết khóa học." });
    }
  }, [id]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  if (loadState.loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-400">
        <FontAwesomeIcon icon={faSpinner} className="text-4xl animate-spin text-blue-500 mb-4" />
        <p className="font-bold">Đang tải dữ liệu khóa học...</p>
      </div>
    );
  }

  if (loadState.error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 bg-slate-50 text-slate-600">
        <p className="font-bold text-red-600 mb-4">{loadState.error || "Không tìm thấy dữ liệu"}</p>
        <button
          type="button"
          onClick={() => navigate("/admin/approvals")}
          className="px-4 py-2 bg-slate-200 rounded-xl font-bold hover:bg-slate-300"
        >
          Quay lại danh sách phê duyệt
        </button>
      </div>
    );
  }

  const canEdit = !["pending", "rejected", "suspended"].includes(course.status);

  // =========================================================================
  // XỬ LÝ NGHIỆP VỤ QUẢN TRỊ
  // =========================================================================
  const handleApproveCourse = async () => {
    if (course.status !== "pending") return;
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Lỗi xác thực: Phiên làm việc đã hết hạn.");
      return;
    }
    const p = adminPrice === "" || adminPrice === null ? 0 : parseFloat(String(adminPrice).replace(",", "."));
    if (Number.isNaN(p) || p < 0) { 
      toast.warning("Tham số không hợp lệ: Giá niêm yết phải là định dạng số dương."); 
      return; 
    }
    
    if (!window.confirm(`Xác nhận phê duyệt và xuất bản khóa học với mức giá: ${p === 0 ? "Miễn phí" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p)}?`)) return;
    
    setActionLoading(true);
    try {
      await approveCourseAPI(id, p, token);
      toast.success("Hệ thống: Khóa học đã được xuất bản công khai thành công.");
      navigate("/admin/approvals");
    } catch (e) {
      toast.error("Lỗi nghiệp vụ: Quá trình phê duyệt thất bại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCourse = async () => {
    if (course.status !== "pending") return;
    const token = localStorage.getItem("access_token");
    const reason = window.prompt("Nhập lý do từ chối phê duyệt (Thông tin này sẽ được gửi tới giảng viên):", "");
    if (reason === null) return;
    
    setActionLoading(true);
    try {
      await rejectCourseAPI(id, reason, token);
      toast.success("Hệ thống: Đã từ chối phê duyệt khóa học và gửi thông báo phản hồi.");
      await loadCourse();
    } catch (e) {
      toast.error("Lỗi hệ thống: Không thể thực hiện thao tác từ chối.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveUpdate = async (isPriceChanged) => {
    const confirmMsg = isPriceChanged
      ? `Xác nhận lưu mức giá mới (${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(adminPrice)}) và cập nhật nội dung khóa học?`
      : "Xác nhận giữ nguyên mức giá cũ và cập nhật nội dung mới?";

    if (window.confirm(confirmMsg)) {
      const token = localStorage.getItem("access_token");
      setActionLoading(true);
      try {
        const newPrice = isPriceChanged ? parseFloat(adminPrice) : null;
        await resolveUpdateAPI(id, newPrice, token);
        toast.success("Thông báo: Đã phê duyệt các bản cập nhật nội dung mới.");
        await loadCourse();
      } catch (e) {
        toast.error("Lỗi xử lý: Cập nhật nội dung thất bại.");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleToggleSuspension = () => {
    const newStatus = course.status === "suspended" ? "published" : "suspended";
    const msg = course.status === "suspended" 
      ? "Khôi phục trạng thái hoạt động cho khóa học này?" 
      : "Đình chỉ hoạt động khóa học? Người dùng sẽ không thể truy cập nội dung này.";
      
    if (window.confirm(msg)) {
      setCourse({ ...course, status: newStatus });
      toast.success("Hệ thống: Trạng thái khóa học đã được thay đổi.");
    }
  };

  const handleDeleteCourse = () => {
    toast.info("Tính năng: Xóa khóa học vĩnh viễn hiện đang được bảo trì.");
  };

  const lessons = Array.isArray(course?.lessons) ? course.lessons : [];

  // =========================================================================
  // GIAO DIỆN QUẢN TRỊ (RIGHT PANEL)
  // =========================================================================
  const renderAdminActions = () => {
    if (course.has_new_update) {
      return (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl shadow-sm p-6 relative overflow-hidden">
          <h3 className="text-lg font-black text-amber-800 mb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faBell} className="text-amber-500 animate-bounce" />
            Kiểm tra mức giá
          </h3>
          <p className="text-amber-700/80 text-xs font-medium mb-5">
            Giảng viên vừa cập nhật nội dung giáo trình. Bạn có thể điều chỉnh lại giá bán nếu chất lượng khóa học thay đổi.
          </p>

          <div className="mb-6">
            <label className="block text-xs font-bold text-amber-800 mb-2 uppercase tracking-wider">
              Giá mới (VND)
            </label>
            <div className="relative">
              <FontAwesomeIcon icon={faDollarSign} className="absolute left-4 top-3.5 text-slate-400" />
              <input
                type="number"
                step="1000"
                min="0"
                // step="0.01"
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
            <FontAwesomeIcon icon={faSave} /> 
            {adminPrice !== course.price ? "Cập nhật giá & Đóng thông báo" : "Giữ nguyên giá & Đóng thông báo"}
          </button>
        </div>
      );
    }

    if (course.status === "pending") {
      return (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-xl p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
          <h3 className="text-lg font-black text-white mb-2 relative z-10 flex items-center gap-2">
            <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-400" />
            Thiết lập giá niêm yết
          </h3>
          <p className="text-blue-200 text-xs font-medium mb-5 relative z-10">
            Nội dung đã đạt yêu cầu kiểm duyệt? Hãy đặt giá để xuất bản lên nền tảng.
          </p>
          <div className="relative z-10 mb-6">
            <div className="relative">
              <FontAwesomeIcon icon={faDollarSign} className="absolute left-4 top-3.5 text-slate-400" />
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="Ví dụ: 500000 (0 là miễn phí)"
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
              {actionLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheckCircle} />}
              Phê duyệt & Xuất bản
            </button>
            <button
              type="button"
              onClick={handleRejectCourse}
              disabled={actionLoading}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              Từ chối phê duyệt
            </button>
          </div>
        </div>
      );
    }

    if (course.status === "rejected") {
      return (
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 text-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-red-500 mb-3 shadow-sm border border-red-100">
            <FontAwesomeIcon icon={faTimesCircle} className="text-2xl" />
          </div>
          <h3 className="text-base font-black text-red-700 mb-2">Đã từ chối khóa học</h3>
          <p className="text-xs text-red-600/80 font-medium">Hồ sơ đã được gửi trả lại giảng viên để yêu cầu chỉnh sửa nội dung.</p>
          {course.rejectReason ? (
            <p className="text-xs text-red-800 font-bold mt-3 text-left bg-white/60 p-2 rounded-lg border border-red-100">
              Lý do: {course.rejectReason}
            </p>
          ) : null}
        </div>
      );
    }

    if (course.status === "draft") {
      return (
        <div className="bg-slate-100 border-2 border-slate-200 border-dashed rounded-3xl p-6 text-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3 shadow-sm">
            <FontAwesomeIcon icon={faPenRuler} className="text-xl" />
          </div>
          <h3 className="text-base font-black text-slate-700 mb-2">Đang là bản nháp</h3>
          <p className="text-xs text-slate-500 font-medium">Giảng viên chưa gửi yêu cầu phê duyệt. Hiện không có thao tác nào khả dụng.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
        <h3 className="text-lg font-black text-slate-900 mb-5">Quản trị sau xuất bản</h3>
        <button
          onClick={handleToggleSuspension}
          className={`w-full py-3.5 px-4 font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-95 ${
            course.status === "published"
              ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200"
              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200"
          }`}
        >
          <FontAwesomeIcon icon={course.status === "published" ? faBan : faCheckCircle} />
          {course.status === "published" ? "Đình chỉ khóa học" : "Khôi phục hoạt động"}
        </button>
      </div>
    );
  };

  const renderStatusBadge = (status) => {
    const badges = {
      published: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", text: "Đã xuất bản", dot: true },
      pending: { color: "bg-amber-100 text-amber-700 border-amber-200 animate-pulse", text: "Đang chờ duyệt", icon: faClockRotateLeft },
      rejected: { color: "bg-red-100 text-red-700 border-red-200", text: "Đã từ chối", icon: faTimesCircle },
      draft: { color: "bg-slate-100 text-slate-700 border-slate-200", text: "Bản nháp", icon: faPenRuler },
      suspended: { color: "bg-slate-800 text-white border-slate-900", text: "Đang bị đình chỉ", icon: faBan }
    };
    const b = badges[status] || badges.suspended;
    return (
      <span className={`px-3 py-1.5 ${b.color} text-sm font-bold rounded-xl flex items-center gap-2 border`}>
        {b.dot && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>}
        {b.icon && <FontAwesomeIcon icon={b.icon} />} {b.text}
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

        {course.has_new_update && (
          <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4 shadow-sm animate-fade-slide-up">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
              <FontAwesomeIcon icon={faBell} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-amber-800 font-bold text-sm">Thông báo hệ thống: Có cập nhật nội dung mới!</h3>
              <p className="text-amber-700/80 text-xs mt-0.5">Giảng viên đã thay đổi bài học. Vui lòng kiểm tra và xử lý tại bảng điều khiển bên phải.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {renderStatusBadge(course.status)}
              <span className="text-slate-400 font-bold text-sm border-l border-slate-300 pl-3">Mã khóa học: {course.id}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">{course.title}</h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl line-clamp-3 mt-3">{course.description || "Chưa có mô tả cho khóa học này."}</p>
          </div>
          {canEdit && (
            <div className="shrink-0 mt-4 xl:mt-0 flex flex-col items-end">
              <button
                onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa khóa học
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-2/3 space-y-8">
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800 aspect-video relative flex flex-col items-center justify-center">
            {currentVideoUrl ? (
              <video src={currentVideoUrl} controls autoPlay className="absolute inset-0 w-full h-full object-contain bg-black" playsInline />
            ) : (
              <>
                <img src={course.thumbnail || THUMB_FALLBACK} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                <button className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-none">
                  <FontAwesomeIcon icon={faPlayCircle} className="text-5xl ml-1" />
                </button>
              </>
            )}
            <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-black tracking-widest rounded-lg z-20">KIỂM DUYỆT ADMIN</div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 sm:p-8">
            <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <FontAwesomeIcon icon={faListUl} className="text-blue-600" /> Giáo trình học tập ({lessons.length} bài học)
            </h3>
            <div className="space-y-3">
              {lessons.map((lesson) => {
                const videoUrl = lesson.play_url || lesson.url;
                const isPlaying = currentVideoUrl === videoUrl && videoUrl !== "";
                return (
                  <div
                    key={lesson.id}
                    onClick={() => videoUrl && setCurrentVideoUrl(videoUrl)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${isPlaying ? "bg-blue-50 border-blue-300" : "bg-white hover:bg-slate-50"}`}
                  >
                    <img src={course.thumbnail || THUMB_FALLBACK} alt="Thumbnail" className="w-14 h-10 rounded-xl object-cover shrink-0 border border-slate-200" />
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm line-clamp-1 ${isPlaying ? "text-blue-700" : "text-slate-700"}`}>
                        {lesson.title} {isPlaying && <span className="ml-2 text-[10px] animate-pulse text-blue-600"><FontAwesomeIcon icon={faPlayCircle} /> Đang phát</span>}
                      </p>
                    </div>
                    <div className="shrink-0 text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                      <FontAwesomeIcon icon={faClock} /> {lesson.duration}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/3 space-y-6 sticky top-24">
          {renderAdminActions()}
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6">
            <h3 className="text-base font-extrabold text-slate-800 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" /> Thông tin tổng quan
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500 flex items-center gap-2"><FontAwesomeIcon icon={faUserTie} className="w-4" /> Giảng viên</span>
                <span className="text-sm font-black text-slate-800">{course.instructor}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500 flex items-center gap-2"><FontAwesomeIcon icon={faTag} className="w-4" /> Danh mục</span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">{course.category}</span>
              </li>
            </ul>
          </div>
          <button onClick={handleDeleteCourse} className="w-full py-3.5 px-4 bg-white text-red-500 font-bold rounded-2xl border border-red-200 hover:bg-red-50 transition-all active:scale-95 shadow-sm">
            <FontAwesomeIcon icon={faTrash} /> Xóa vĩnh viễn khỏi hệ thống
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseDetail;