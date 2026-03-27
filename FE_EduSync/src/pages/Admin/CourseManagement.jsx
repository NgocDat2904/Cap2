import React, { useState } from "react";
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
} from "@fortawesome/free-solid-svg-icons";

// =========================================================================
// MOCK DATA MỚI: CHUẨN LUỒNG ADMIN DUYỆT & ĐỊNH GIÁ
// =========================================================================
const initialCourses = [
  {
    id: "CRS-101",
    title: "Lập trình ReactJS Thực chiến dự án EduSync",
    instructor: "Trần Việt Anh",
    category: "Frontend",
    price: 49.99,
    status: "published", // Đã được Admin duyệt và định giá
    updatedDate: "20/03/2026",
    thumbnail:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
  },
  {
    id: "CRS-102",
    title: "Java Backend Toàn tập với Spring Boot 3",
    instructor: "Nguyễn Văn Chuyên Gia",
    category: "Backend",
    price: 0, // Lúc giảng viên gửi lên chưa có giá
    status: "pending", // 🚨 Nằm chờ Admin vào duyệt và gõ giá
    updatedDate: "27/03/2026",
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  },
  {
    id: "CRS-103",
    title: "Khóa học lùa gà làm giàu siêu tốc",
    instructor: "Kẻ Gian Lận",
    category: "Business Analysis",
    price: 0,
    status: "rejected", // Admin xem xong thấy vi phạm nên Từ chối
    updatedDate: "25/03/2026",
    thumbnail:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
  },
  {
    id: "CRS-104",
    title: "UI/UX Design Cơ bản",
    instructor: "Hương Design",
    category: "UI/UX Design",
    price: 0,
    status: "draft", // Giảng viên đang làm dở, chưa gửi lên
    updatedDate: "10/02/2026",
    thumbnail:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
  },
];

const CATEGORIES = [
  "Tất cả",
  "Frontend",
  "Backend",
  "UI/UX Design",
  "Business Analysis",
  "Data Analysis",
];

const AdminCourseManagement = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState(initialCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

  // =========================================================================
  // LOGIC THỐNG KÊ
  // =========================================================================
  const stats = {
    total: courses.length,
    pending: courses.filter((c) => c.status === "pending").length,
    published: courses.filter((c) => c.status === "published").length,
    others: courses.filter((c) =>
      ["draft", "suspended", "rejected"].includes(c.status),
    ).length,
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "Tất cả" || course.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // =========================================================================
  // LOGIC HÀNH ĐỘNG CỦA ADMIN (HẬU KIỂM TRÊN DANH SÁCH)
  // =========================================================================
  const toggleCourseSuspension = (id, currentStatus) => {
    const newStatus = currentStatus === "suspended" ? "published" : "suspended";
    const confirmMsg =
      newStatus === "suspended"
        ? "Đình chỉ khóa học này? Nó sẽ bị gỡ khỏi trang chủ ngay lập tức."
        : "Khôi phục lại khóa học này lên hệ thống?";

    if (window.confirm(confirmMsg)) {
      setCourses(
        courses.map((course) =>
          course.id === id ? { ...course, status: newStatus } : course,
        ),
      );
      setOpenActionMenuId(null);
    }
  };

  const deleteCourse = (id) => {
    if (
      window.confirm(
        "Cảnh báo: Bạn có chắc chắn muốn xóa vĩnh viễn khóa học này khỏi hệ thống?",
      )
    ) {
      setCourses(courses.filter((course) => course.id !== id));
      setOpenActionMenuId(null);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "published":
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1.5 w-max border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{" "}
            Đang hoạt động
          </span>
        );
      case "pending":
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg flex items-center gap-1.5 w-max border border-amber-200 animate-pulse shadow-sm shadow-amber-200/50">
            <FontAwesomeIcon icon={faClockRotateLeft} /> Chờ duyệt
          </span>
        );
      case "draft":
        return (
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg flex items-center gap-1.5 w-max border border-slate-200">
            <FontAwesomeIcon icon={faPenRuler} /> Bản nháp GV
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg flex items-center gap-1.5 w-max border border-red-200">
            <FontAwesomeIcon icon={faTimesCircle} /> Bị từ chối
          </span>
        );
      case "suspended":
        return (
          <span className="px-2.5 py-1 bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 w-max border border-slate-900">
            <FontAwesomeIcon icon={faBan} /> Bị đình chỉ
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 p-6 sm:p-8 bg-slate-50 min-h-screen font-sans animate-fade-slide-up">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Quản lý Khóa học
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Duyệt khóa học mới, định giá và xử lý vi phạm nội dung.
          </p>
        </div>
        <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition shadow-sm flex items-center gap-2">
          <FontAwesomeIcon icon={faFileExport} /> Xuất báo cáo
        </button>
      </div>

      {/* WIDGETS THỐNG KÊ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Tổng khóa học",
            value: stats.total,
            icon: faBookOpen,
            color: "text-blue-600",
            bg: "bg-blue-100",
          },
          {
            label: "Chờ duyệt & Định giá",
            value: stats.pending,
            icon: faClockRotateLeft,
            color: "text-amber-600",
            bg: "bg-amber-100",
          },
          {
            label: "Đang hoạt động",
            value: stats.published,
            icon: faCheckCircle,
            color: "text-emerald-600",
            bg: "bg-emerald-100",
          },
          {
            label: "Nháp / Từ chối / Bị khóa",
            value: stats.others,
            icon: faBan,
            color: "text-slate-600",
            bg: "bg-slate-200",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 relative overflow-hidden"
          >
            {/* Hiệu ứng chớp viền nếu có khóa chờ duyệt */}
            {idx === 1 && stats.pending > 0 && (
              <div className="absolute top-0 right-0 w-1.5 h-full bg-amber-400 animate-pulse"></div>
            )}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.bg} ${stat.color}`}
            >
              <FontAwesomeIcon icon={stat.icon} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* VÙNG CHỨA BẢNG VÀ BỘ LỌC */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden relative">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-3 text-slate-400"
            />
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
              className="w-full md:w-48 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-pointer truncate"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 md:w-44 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-pointer"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="published">Đang hoạt động</option>
              <option value="rejected">Bị từ chối</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-extrabold">
                <th className="p-5 w-20 text-center">ID</th>
                <th className="p-5 min-w-[250px]">Thông tin Khóa học</th>
                <th className="p-5">Chuyên ngành</th>
                <th className="p-5 text-right">Giá bán</th>
                <th className="p-5">Trạng thái</th>
                <th className="p-5 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="p-5 text-center text-sm font-bold text-slate-400">
                      {course.id.replace("CRS-", "#")}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <img
                          src={course.thumbnail}
                          alt="Thumbnail"
                          className="w-16 h-10 rounded-lg object-cover border border-slate-200 shadow-sm"
                        />
                        <div className="min-w-0">
                          <p
                            className="text-sm font-extrabold text-slate-800 line-clamp-1 hover:text-blue-600 cursor-pointer transition-colors"
                            onClick={() =>
                              navigate(`/admin/courses/${course.id}`)
                            }
                          >
                            {course.title}
                          </p>
                          <p className="text-xs font-medium text-slate-500 mt-1">
                            GV:{" "}
                            <span className="font-bold text-slate-700">
                              {course.instructor}
                            </span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">
                        {course.category}
                      </span>
                    </td>

                    {/* CỘT GIÁ TIỀN THỂ HIỆN QUYỀN LỰC CỦA ADMIN */}
                    <td className="p-5 text-right">
                      {course.status === "pending" ||
                      course.status === "draft" ? (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                          Chờ định giá
                        </span>
                      ) : course.price === 0 ? (
                        <span className="text-sm font-black text-emerald-600">
                          Miễn phí
                        </span>
                      ) : (
                        <span className="text-sm font-black text-slate-700">
                          ${course.price}
                        </span>
                      )}
                    </td>

                    <td className="p-5">{renderStatusBadge(course.status)}</td>
                    <td className="p-5 text-center relative">
                      <button
                        onClick={() =>
                          setOpenActionMenuId(
                            openActionMenuId === course.id ? null : course.id,
                          )
                        }
                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                      >
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                      </button>

                      {openActionMenuId === course.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenActionMenuId(null)}
                          ></div>
                          <div className="absolute right-8 top-10 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden animate-fade-slide-up">
                            {/* NÚT CHUYỂN HƯỚNG TỚI TRANG ĐỊNH GIÁ & CHI TIẾT */}
                            <button
                              onClick={() => {
                                setOpenActionMenuId(null);
                                navigate(`/admin/courses/${course.id}`);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors flex items-center gap-2 ${
                                course.status === "pending"
                                  ? "text-blue-700 bg-blue-50 hover:bg-blue-100"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <FontAwesomeIcon icon={faEye} className="w-4" />{" "}
                              {course.status === "pending"
                                ? "Duyệt & Định giá"
                                : "Xem chi tiết"}
                            </button>

                            {/* Nút Đình chỉ (Chỉ hiện khi đã Published) */}
                            {course.status === "published" && (
                              <button
                                onClick={() =>
                                  toggleCourseSuspension(
                                    course.id,
                                    course.status,
                                  )
                                }
                                className="w-full text-left px-4 py-2.5 text-sm font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                              >
                                <FontAwesomeIcon icon={faBan} className="w-4" />{" "}
                                Đình chỉ
                              </button>
                            )}

                            {/* Nút Khôi phục (Chỉ hiện khi bị Suspended) */}
                            {course.status === "suspended" && (
                              <button
                                onClick={() =>
                                  toggleCourseSuspension(
                                    course.id,
                                    course.status,
                                  )
                                }
                                className="w-full text-left px-4 py-2.5 text-sm font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                              >
                                <FontAwesomeIcon
                                  icon={faCheckCircle}
                                  className="w-4"
                                />{" "}
                                Khôi phục
                              </button>
                            )}

                            <button
                              onClick={() => deleteCourse(course.id)}
                              className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-4" />{" "}
                              Xóa vĩnh viễn
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-10 text-center text-slate-500 font-medium"
                  >
                    Không tìm thấy khóa học nào.
                  </td>
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
