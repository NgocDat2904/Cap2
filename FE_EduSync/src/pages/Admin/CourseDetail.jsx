import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "@fortawesome/free-solid-svg-icons";

// =========================================================================
// MOCK DATA: Giả lập 1 khóa học đang "Chờ duyệt" (Pending)
// =========================================================================
const mockCourseDetail = {
  id: "CRS-102",
  title: "Java Backend Toàn tập với Spring Boot 3",
  instructor: "Nguyễn Văn Chuyên Gia",
  category: "Backend Web Development",
  price: 0, // Lúc giảng viên gửi lên là chưa có giá
  status: "pending", // Đang chờ Admin duyệt
  updatedDate: "27/03/2026",
  thumbnail:
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  description:
    "Khóa học đi từ con số 0 đến Master Java Spring Boot. Học viên sẽ được xây dựng RESTful API thực tế cho dự án EdTech.",
  prerequisites:
    "Biết cơ bản về lập trình hướng đối tượng (OOP) và cơ sở dữ liệu SQL.",
  lessons: [
    {
      id: "v1",
      title: "Bài 1: Giới thiệu Spring Boot và Cài đặt",
      duration: "15:20",
      size: "55MB",
    },
    {
      id: "v2",
      title: "Bài 2: Dependency Injection & IoC Container",
      duration: "28:10",
      size: "110MB",
    },
    {
      id: "v3",
      title: "Bài 3: Xây dựng REST API chuẩn RESTful",
      duration: "42:00",
      size: "210MB",
    },
  ],
};

const AdminCourseDetail = () => {
  const navigate = useNavigate();
  const [course, setCourse] = useState(mockCourseDetail);

  const [adminPrice, setAdminPrice] = useState("");

  // =========================================================================
  // LOGIC HÀNH ĐỘNG CỦA ADMIN
  // =========================================================================

  // Hành động 1: Duyệt và Định giá (Dành cho khóa pending)
  const handleApproveCourse = () => {
    if (adminPrice === "") {
      alert("Vui lòng nhập giá bán cho khóa học trước khi xuất bản!");
      return;
    }
    if (
      window.confirm(`Xác nhận xuất bản khóa học này với giá $${adminPrice}?`)
    ) {
      setCourse({ ...course, status: "published", price: adminPrice });
      alert("🎉 Đã xuất bản khóa học lên hệ thống thành công!");
      // TODO: Gọi API PUT gửi { status: 'published', price: adminPrice } xuống BE
    }
  };

  // Hành động 2: Từ chối (Dành cho khóa pending)
  const handleRejectCourse = () => {
    const reason = window.prompt(
      "Nhập lý do từ chối để phản hồi cho Giảng viên:",
    );
    if (reason !== null) {
      setCourse({ ...course, status: "rejected" });
      alert("Đã từ chối khóa học và gửi thông báo cho Giảng viên.");
      // TODO: Gọi API PUT gửi { status: 'rejected', rejectReason: reason }
    }
  };

  // Hành động 3: Đình chỉ/Gỡ bỏ (Dành cho khóa đã Published)
  const handleToggleSuspension = () => {
    const newStatus = course.status === "suspended" ? "published" : "suspended";
    const confirmMsg =
      newStatus === "suspended"
        ? "Đình chỉ khóa học này? Nó sẽ bị gỡ khỏi trang chủ ngay lập tức."
        : "Khôi phục khóa học này lên hệ thống?";

    if (window.confirm(confirmMsg)) {
      setCourse({ ...course, status: newStatus });
    }
  };

  // Hành động 4: Xóa vĩnh viễn
  const handleDeleteCourse = () => {
    if (window.confirm("CẢNH BÁO: Xóa vĩnh viễn khóa học này?")) {
      alert("Đã xóa!");
      navigate("/admin/courses");
    }
  };

  // =========================================================================
  // RENDER GIAO DIỆN
  // =========================================================================
  const renderStatusBadge = (status) => {
    if (status === "published") {
      return (
        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-bold rounded-xl flex items-center gap-2 border border-emerald-200">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>{" "}
          Đang hoạt động
        </span>
      );
    } else if (status === "pending") {
      return (
        <span className="px-3 py-1.5 bg-amber-100 text-amber-700 text-sm font-bold rounded-xl flex items-center gap-2 border border-amber-200 animate-pulse">
          <FontAwesomeIcon icon={faClockRotateLeft} /> Đang chờ duyệt
        </span>
      );
    } else if (status === "rejected") {
      return (
        <span className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-bold rounded-xl flex items-center gap-2 border border-red-200">
          <FontAwesomeIcon icon={faTimesCircle} /> Đã từ chối
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl flex items-center gap-2 border border-slate-200">
          <FontAwesomeIcon icon={faBan} /> Bị đình chỉ
        </span>
      );
    }
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
            <img
              src={course.thumbnail}
              alt="Thumbnail"
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            <button className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-blue-600 hover:scale-110 transition-all duration-300 shadow-2xl">
              <FontAwesomeIcon icon={faPlayCircle} className="text-5xl ml-1" />
            </button>
            <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-black tracking-widest rounded-lg">
              ADMIN AUDIT
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 sm:p-8">
            <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <FontAwesomeIcon icon={faListUl} className="text-blue-600" />
              Giáo trình ({course.lessons.length} bài)
            </h3>
            <div className="space-y-3">
              {course.lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 bg-white hover:border-blue-200 hover:bg-slate-50"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 text-slate-400">
                    <FontAwesomeIcon icon={faPlayCircle} className="text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm line-clamp-1 text-slate-700">
                      {lesson.title}
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
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: QUYỀN LỰC CỦA ADMIN */}
        <div className="w-full lg:w-1/3 space-y-6 sticky top-24">
          {/* 🚨 KHU VỰC ĐỊNH GIÁ & XÉT DUYỆT (Chỉ hiện khi Pending) 🚨 */}
          {course.status === "pending" && (
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl shadow-xl p-6 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>

              <h3 className="text-lg font-black text-white mb-2 relative z-10 flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-emerald-400"
                />{" "}
                Định giá & Phê duyệt
              </h3>
              <p className="text-blue-200 text-xs font-medium mb-5 relative z-10">
                Nội dung đạt chuẩn? Hãy định giá để xuất bản lên sàn.
              </p>

              <div className="relative z-10 mb-6">
                <label className="block text-xs font-bold text-blue-300 mb-2 uppercase tracking-wider">
                  Thiết lập giá bán (USD)
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
                    placeholder="VD: 49.99 (Để 0 nếu miễn phí)"
                    value={adminPrice}
                    onChange={(e) => setAdminPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border-0 rounded-xl text-slate-800 font-black text-lg focus:ring-4 focus:ring-emerald-500/30 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 relative z-10">
                <button
                  onClick={handleApproveCourse}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl transition-colors shadow-lg shadow-emerald-500/30 active:scale-95 flex justify-center items-center gap-2"
                >
                  <FontAwesomeIcon icon={faCheckCircle} /> Phê duyệt & Xuất bản
                </button>
                <button
                  onClick={handleRejectCourse}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors backdrop-blur-sm"
                >
                  Từ chối duyệt
                </button>
              </div>
            </div>
          )}

          {/* KHU VỰC HẬU KIỂM (Hiện khi đã duyệt xong hoặc đang bị đình chỉ) */}
          {(course.status === "published" || course.status === "suspended") && (
            <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800"></div>
              <h3 className="text-lg font-black text-slate-900 mb-5">
                Hậu kiểm & Xử lý
              </h3>
              <div className="space-y-3">
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
            </div>
          )}

          {/* KHU VỰC THÔNG TIN CHUNG */}
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
              {/* Hiện giá tiền nếu đã được duyệt */}
              {course.status !== "pending" && course.status !== "rejected" && (
                <li className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500 flex items-center gap-2">
                    <FontAwesomeIcon icon={faDollarSign} className="w-4" /> Giá
                    bán (Admin set)
                  </span>
                  <span className="text-sm font-black text-emerald-600">
                    ${course.price}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Nút Xóa vĩnh viễn (Luôn nằm dưới cùng) */}
          <button
            onClick={handleDeleteCourse}
            className="w-full py-3.5 px-4 bg-white text-red-500 font-bold rounded-2xl border border-red-200 hover:bg-red-50 flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-sm"
          >
            <FontAwesomeIcon icon={faTrash} />
            Xóa vĩnh viễn hệ thống
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseDetail;
