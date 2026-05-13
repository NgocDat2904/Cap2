import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEllipsisVertical,
  faEye,
  faCheckCircle,
  faBan,
  faBookOpen,
  faTrash,
  faPenRuler,
  faFileExport,
  faClockRotateLeft,
  faTimesCircle,
  faBell,
  faRotateRight, 
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { fetchAllAdminCoursesAPI } from "../../services/adminCourseAPI";

// Danh mục đã được Việt hóa
const CATEGORIES = [
  { label: "Tất cả danh mục", value: "all" },
  { label: "Phát triển Web Frontend", value: "frontend" },
  { label: "Phát triển Web Backend", value: "backend" },
  { label: "Lập trình Di động", value: "mobile" },
  { label: "AI & Học máy", value: "ai" },
  { label: "Phân tích Dữ liệu", value: "data_analysis" },
  { label: "Kỹ thuật Dữ liệu", value: "data_engineer" },
  { label: "Thiết kế UI/UX", value: "uiux" },
  { label: "Phân tích Nghiệp vụ (BA)", value: "ba" },
];

const AdminCourseManagement = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const data = await fetchAllAdminCoursesAPI(token, { limit: 1000 });
      setCourses(data.courses || []);
    } catch (err) {
      console.error("Lỗi truy xuất danh sách khóa học:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleRefresh = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("all");
    fetchCourses();
  };

  const stats = {
    total: courses.length,
    pending: courses.filter((c) => c.status === "pending").length,
    published: courses.filter((c) => c.status === "published").length,
    others: courses.filter((c) =>
      ["draft", "suspended", "rejected"].includes(c.status),
    ).length,
  };

  const filteredCourses = courses.filter((course) => {
    const title = (course.title || "").toLowerCase();
    const instructor = (course.instructor || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = title.includes(search) || instructor.includes(search);
    const matchesCategory = categoryFilter === "all" || (course.category || "").toLowerCase() === categoryFilter.toLowerCase();

    let matchesStatus = false;
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (statusFilter === "has_update") {
      matchesStatus = course.has_new_update === true;
    } else {
      matchesStatus = (course.status || "").toLowerCase() === statusFilter.toLowerCase();
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const toggleCourseSuspension = async (id, currentStatus) => {
    const newStatus = currentStatus === "suspended" ? "published" : "suspended";
    const confirmMsg = newStatus === "suspended"
        ? "Xác nhận đình chỉ khóa học này? Nội dung sẽ bị gỡ khỏi trang chủ ngay lập tức."
        : "Khôi phục quyền truy cập cho khóa học này trên nền tảng?";

    if (window.confirm(confirmMsg)) {
      try {
        const token = localStorage.getItem("access_token");
        const { moderateCourseAPI } = await import("../../services/adminCourseAPI");
        await moderateCourseAPI(id, newStatus, token);
        fetchCourses();
      } catch (err) {
        alert("Thao tác thất bại: " + err.message);
      }
      setOpenActionMenuId(null);
    }
  };

  const deleteCourse = async (id) => {
    if (window.confirm("Cảnh báo: Bạn có chắc chắn muốn xóa vĩnh viễn khóa học này khỏi hệ thống? dữ liệu sẽ không thể khôi phục.")) {
      const token = localStorage.getItem("access_token");
      try {
        const { moderateCourseAPI } = await import("../../services/adminCourseAPI");
        await moderateCourseAPI(id, "REJECTED", token);
        fetchCourses();
      } catch (err) {
        alert("Lỗi hệ thống: Không thể thực hiện lệnh xóa.");
      }
      setOpenActionMenuId(null);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "published":
      case "approved":
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1.5 w-max border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Đã xuất bản
          </span>
        );
      case "pending":
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg flex items-center gap-1.5 w-max border border-amber-200 animate-pulse shadow-sm shadow-amber-200/50">
            <FontAwesomeIcon icon={faClockRotateLeft} /> Chờ kiểm duyệt
          </span>
        );
      case "draft":
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg flex items-center gap-1.5 w-max border border-slate-200">
            <FontAwesomeIcon icon={faPenRuler} /> Bản nháp
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg flex items-center gap-1.5 w-max border border-red-200">
            <FontAwesomeIcon icon={faTimesCircle} /> Đã từ chối
          </span>
        );
      case "suspended":
        return (
          <span className="px-2.5 py-1 bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 w-max border border-slate-900">
            <FontAwesomeIcon icon={faBan} /> Đang đình chỉ
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 p-6 sm:p-8 bg-slate-50 font-sans animate-fade-slide-up h-full">
      {/* TIÊU ĐỀ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Quản Lý Khóa Học</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">Phê duyệt nội dung mới, thiết lập giá niêm yết và xử lý vi phạm.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition duration-300 shadow-sm flex items-center gap-2 active:scale-95 disabled:opacity-70"
          >
            <FontAwesomeIcon icon={faRotateRight} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition shadow-sm flex items-center gap-2">
            <FontAwesomeIcon icon={faFileExport} /> <span className="hidden sm:inline">Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* THỐNG KÊ NHANH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Tổng số khóa học", value: stats.total, icon: faBookOpen, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Đang chờ duyệt & giá", value: stats.pending, icon: faClockRotateLeft, color: "text-amber-600", bg: "bg-amber-100" },
          { label: "Đã xuất bản", value: stats.published, icon: faCheckCircle, color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "Nháp / Từ chối / Cấm", value: stats.others, icon: faBan, color: "text-slate-600", bg: "bg-slate-200" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
            {idx === 1 && stats.pending > 0 && <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-400 animate-pulse"></div>}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.bg} ${stat.color}`}><FontAwesomeIcon icon={stat.icon} /></div>
            <div>
              <p className="text-sm font-bold text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm relative flex flex-col h-[600px] overflow-hidden">
        {/* THANH CÔNG CỤ */}
        <div className="sticky top-0 z-10 p-5 border-b border-slate-200 bg-slate-50/95 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="relative w-full md:w-96">
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên khóa học, giảng viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-48 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 md:w-56 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ kiểm duyệt (Mới)</option>
              <option value="has_update">🔔 Có cập nhật nội dung</option>
              <option value="published">Đã xuất bản</option>
              <option value="rejected">Đã từ chối</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-extrabold">
                <th className="p-5 w-20 text-center">ID</th>
                <th className="p-5 min-w-[300px]">Thông tin khóa học</th>
                <th className="p-5">Danh mục</th>
                <th className="p-5 text-right">Giá niêm yết</th>
                <th className="p-5">Trạng thái</th>
                <th className="p-5 text-center">Quản lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500 font-medium">
                    <FontAwesomeIcon icon={faRotateRight} className="animate-spin mr-2 text-blue-500" /> Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.id} className={`hover:bg-slate-50 transition-colors group ${course.has_new_update ? "bg-amber-50/30" : ""}`}>
                    <td className="p-5 text-center">
                      <span className="text-sm font-bold text-slate-400 font-mono">{course.id.substring(0, 8)}...</span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-start gap-4">
                        <img src={course.thumbnail} alt="" className="w-20 h-12 rounded-lg object-cover border border-slate-200 mt-1" />
                        <div className="min-w-0">
                          <p onClick={() => navigate(`/admin/courses/${course.id}`)} className="text-sm font-extrabold text-slate-800 line-clamp-1 hover:text-blue-600 cursor-pointer">{course.title}</p>
                          {course.has_new_update && (
                            <span className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-md border border-amber-200 animate-pulse">
                              <FontAwesomeIcon icon={faBell} /> CÓ CẬP NHẬT
                            </span>
                          )}
                          {!course.has_new_update && <p className="text-xs font-medium text-slate-500 mt-1">Giảng viên: <span className="font-bold text-slate-700">{course.instructor}</span></p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">
                        {CATEGORIES.find(c => c.value === course.category)?.label || course.category}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      {course.status === "pending" || course.status === "draft" ? (
                        <span className="text-xs font-bold text-amber-600">Đang chờ định giá</span>
                      ) : (
                        <span className="text-sm font-black text-slate-700">{course.price === 0 ? "Miễn phí" : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(course.price)}</span>
                      )}
                    </td>
                    <td className="p-5">{renderStatusBadge(course.status)}</td>
                    <td className="p-5 text-center relative">
                      <button
                        onClick={() => setOpenActionMenuId(openActionMenuId === course.id ? null : course.id)}
                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                      >
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                      </button>

                      {openActionMenuId === course.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenActionMenuId(null)}></div>
                          <div className="absolute right-8 top-10 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                            <button
                              onClick={() => { setOpenActionMenuId(null); navigate(`/admin/courses/${course.id}/approval`); }}
                              className={`w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-2 ${course.has_new_update ? "text-amber-700 bg-amber-50" : "text-slate-700 hover:bg-slate-50"}`}
                            >
                              <FontAwesomeIcon icon={course.has_new_update ? faBell : faEye} className="w-4" />
                              {course.has_new_update ? "Xử lý cập nhật" : course.status === "pending" ? "Duyệt & Định giá" : "Xem chi tiết"}
                            </button>

                            {(course.status === "published" || course.status === "approved") && (
                              <button onClick={() => toggleCourseSuspension(course.id, course.status)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                                <FontAwesomeIcon icon={faBan} className="w-4" /> Đình chỉ
                              </button>
                            )}

                            {course.status === "suspended" && (
                              <button onClick={() => toggleCourseSuspension(course.id, course.status)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2">
                                <FontAwesomeIcon icon={faCheckCircle} className="w-4" /> Khôi phục
                              </button>
                            )}

                            <button onClick={() => deleteCourse(course.id)} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100">
                              <FontAwesomeIcon icon={faTrash} className="w-4" /> Xóa vĩnh viễn
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500 font-medium">Không tìm thấy khóa học nào phù hợp.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseManagement;