import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faEnvelope,
  faDownload,
  faGraduationCap,
  faChartLine,
  faUserCheck,
  faEllipsisV,
  faTrophy,
  faEye,
  faBell,
  faBan,
} from "@fortawesome/free-solid-svg-icons";

const InstructorStudentsPage = () => {
  // =========================================================================
  // 1. STATE QUẢN LÝ
  // =========================================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");

  // State quản lý Dropdown Menu nào đang mở (lưu ID của học viên)
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  // =========================================================================
  // 2. XỬ LÝ CLICK RA NGOÀI ĐỂ ĐÓNG MENU
  // =========================================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================================================================
  // 3. MOCK DATA
  // =========================================================================
  const courses = [
    { id: "all", name: "Tất cả khóa học" },
    { id: "python", name: "Master Python from basics to advanced" },
    { id: "react", name: "ReactJS Thực chiến 2026" },
  ];

  const students = [
    {
      id: 1,
      name: "Trần Văn Khang",
      email: "khang.tran@gmail.com",
      avatar: "TK",
      courseId: "python",
      courseName: "Master Python from basics to advanced",
      enrolledDate: "15/03/2026",
      progress: 85,
      lastActive: "2 giờ trước",
      color: "bg-blue-600",
    },
    {
      id: 2,
      name: "Nguyễn Thị Mai",
      email: "mai.nguyen.99@yahoo.com",
      avatar: "NM",
      courseId: "react",
      courseName: "ReactJS Thực chiến 2026",
      enrolledDate: "10/03/2026",
      progress: 100,
      lastActive: "1 ngày trước",
      color: "bg-emerald-600",
    },
    {
      id: 3,
      name: "Lê Hoàng Bách",
      email: "hoangbach_dev@edusync.vn",
      avatar: "LB",
      courseId: "python",
      courseName: "Master Python from basics to advanced",
      enrolledDate: "20/03/2026",
      progress: 15,
      lastActive: "Vừa xong",
      color: "bg-amber-500",
    },
    {
      id: 4,
      name: "Phạm Thu Hương",
      email: "huong.pham2k@gmail.com",
      avatar: "PH",
      courseId: "python",
      courseName: "Master Python from basics to advanced",
      enrolledDate: "01/03/2026",
      progress: 45,
      lastActive: "5 ngày trước",
      color: "bg-purple-600",
    },
    {
      id: 5,
      name: "Đinh Công Trứ",
      email: "tru.dinh@company.com",
      avatar: "ĐT",
      courseId: "react",
      courseName: "ReactJS Thực chiến 2026",
      enrolledDate: "05/02/2026",
      progress: 0,
      lastActive: "1 tháng trước",
      color: "bg-rose-500",
    },
    // Thêm vài data để test cuộn
    {
      id: 6,
      name: "Vũ Trọng Phụng",
      email: "phung.vu@gmail.com",
      avatar: "VP",
      courseId: "python",
      courseName: "Master Python from basics to advanced",
      enrolledDate: "28/03/2026",
      progress: 30,
      lastActive: "10 phút trước",
      color: "bg-teal-500",
    },
    {
      id: 7,
      name: "Hoàng Mộc Lan",
      email: "lan.hoang@edusync.vn",
      avatar: "HL",
      courseId: "react",
      courseName: "ReactJS Thực chiến 2026",
      enrolledDate: "29/03/2026",
      progress: 60,
      lastActive: "4 giờ trước",
      color: "bg-pink-500",
    },
  ];

  const filteredStudents = students.filter((student) => {
    const matchCourse =
      filterCourse === "all" || student.courseId === filterCourse;
    const matchSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCourse && matchSearch;
  });

  // =========================================================================
  // 4. HÀM XỬ LÝ SỰ KIỆN MENU
  // =========================================================================
  const toggleDropdown = (id, event) => {
    event.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleAction = (action, studentName) => {
    setOpenDropdownId(null);
    setTimeout(() => {
      switch (action) {
        case "view":
          alert(`Đang mở chi tiết tiến độ của ${studentName}...`);
          break;
        case "remind":
          alert(`Hệ thống đã gửi Email nhắc nhở học tập đến ${studentName}.`);
          break;
        case "reset":
          if (
            window.confirm(
              `Bạn có chắc muốn Reset toàn bộ tiến độ của ${studentName} về 0% không?`,
            )
          ) {
            alert(`Đã reset tiến độ của ${studentName}.`);
          }
          break;
        case "ban":
          if (
            window.confirm(
              `NGUY HIỂM: Bạn đang thao tác thu hồi quyền truy cập khóa học của ${studentName}. Học viên sẽ không được hoàn tiền. Tiếp tục?`,
            )
          ) {
            alert(`Đã thu hồi quyền truy cập của ${studentName}.`);
          }
          break;
        default:
          break;
      }
    }, 50);
  };

  return (
    // 🚨 Sửa min-h-screen thành h-full để thanh cuộn mượt mà
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 h-full animate-fade-slide-up">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Học viên của tôi
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Theo dõi tiến độ và tương tác với học viên.
          </p>
        </div>
        <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm active:scale-95">
          <FontAwesomeIcon icon={faDownload} /> Xuất file CSV
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl shrink-0">
            <FontAwesomeIcon icon={faGraduationCap} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">
              Tổng học viên
            </p>
            <h3 className="text-3xl font-black text-slate-900">1,250</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl shrink-0">
            <FontAwesomeIcon icon={faUserCheck} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">
              Đang học (Tháng này)
            </p>
            <h3 className="text-3xl font-black text-slate-900">842</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-2xl shrink-0">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">
              Tỉ lệ hoàn thành TB
            </p>
            <h3 className="text-3xl font-black text-slate-900">45%</h3>
          </div>
        </div>
      </div>

      {/* 🚨 VÙNG CHỨA BẢNG VÀ BỘ LỌC ĐÃ ĐƯỢC GỘP CHUNG VÀ CỐ ĐỊNH CHIỀU CAO */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm relative flex flex-col h-[600px] overflow-hidden">
        {/* 🚨 THANH CÔNG CỤ LỌC & TÌM KIẾM (Ghim dính lên trên) */}
        <div className="sticky top-0 z-20 p-5 border-b border-slate-200 bg-slate-50/95 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center shadow-sm">
          <div className="relative flex-1 w-full">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-3.5 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="relative md:w-72 w-full shrink-0">
            <FontAwesomeIcon
              icon={faFilter}
              className="absolute left-4 top-3.5 text-slate-400"
            />
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer truncate"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 🚨 BẢNG DỮ LIỆU (Cuộn tự do ở giữa) */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm">
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                <th className="p-5 w-1/3">Học viên</th>
                <th className="p-5">Khóa học ghi danh</th>
                <th className="p-5">Tiến độ</th>
                <th className="p-5 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100" ref={dropdownRef}>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 ${student.color}`}
                        >
                          {student.avatar}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate">
                            {student.name}
                          </h4>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-5">
                      <p className="text-sm font-semibold text-slate-700 line-clamp-1">
                        {student.courseName}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400 mt-1">
                        Ghi danh: {student.enrolledDate}
                      </p>
                    </td>

                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${student.progress === 100 ? "bg-emerald-500" : student.progress === 0 ? "bg-slate-300" : "bg-blue-500"}`}
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span
                          className={`text-xs font-bold w-10 text-right ${student.progress === 100 ? "text-emerald-600" : "text-slate-700"}`}
                        >
                          {student.progress}%
                        </span>
                      </div>
                      <p className="text-[10px] font-medium text-slate-400 mt-1.5">
                        Hoạt động: {student.lastActive}
                      </p>
                    </td>

                    <td className="p-5 text-center">
                      <div className="flex items-center justify-center gap-2 relative">
                        <button
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center"
                          title="Gửi tin nhắn"
                        >
                          <FontAwesomeIcon
                            icon={faEnvelope}
                            className="text-sm"
                          />
                        </button>

                        {student.progress === 100 && (
                          <button
                            className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center cursor-default"
                            title="Đã cấp chứng chỉ"
                          >
                            <FontAwesomeIcon
                              icon={faTrophy}
                              className="text-sm"
                            />
                          </button>
                        )}

                        {/* THE 3-DOTS ACTION DROPDOWN MENU */}
                        <div className="relative inline-block text-left">
                          <button
                            onClick={(e) => toggleDropdown(student.id, e)}
                            className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center
                              ${openDropdownId === student.id ? "bg-slate-200 text-slate-800" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}
                            `}
                          >
                            <FontAwesomeIcon
                              icon={faEllipsisV}
                              className="text-sm"
                            />
                          </button>

                          {/* Popup Menu */}
                          {openDropdownId === student.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-[100] py-2 animate-fade-slide-up origin-top-right">
                              <button
                                onClick={() =>
                                  handleAction("view", student.name)
                                }
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3 font-medium"
                              >
                                <FontAwesomeIcon
                                  icon={faEye}
                                  className="text-slate-400 w-4"
                                />{" "}
                                Xem chi tiết tiến độ
                              </button>
                              <button
                                onClick={() =>
                                  handleAction("remind", student.name)
                                }
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3 font-medium"
                              >
                                <FontAwesomeIcon
                                  icon={faBell}
                                  className="text-slate-400 w-4"
                                />{" "}
                                Nhắc nhở học tập
                              </button>
                              {/* <button
                                onClick={() =>
                                  handleAction("reset", student.name)
                                }
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3 font-medium border-b border-slate-100 pb-3 mb-1"
                              >
                                <FontAwesomeIcon
                                  icon={faRotateLeft}
                                  className="text-slate-400 w-4"
                                />{" "}
                                Reset tiến độ (0%)
                              </button> */}
                              <button
                                onClick={() =>
                                  handleAction("ban", student.name)
                                }
                                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 font-bold mt-1"
                              >
                                <FontAwesomeIcon icon={faBan} className="w-4" />{" "}
                                Thu hồi quyền truy cập
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="p-10 text-center text-slate-500 font-medium"
                  >
                    Không tìm thấy học viên nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🚨 PHÂN TRANG (Nằm cố định ở đáy bảng) */}
        <div className="sticky bottom-0 z-20 p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
          <p className="text-slate-500 font-medium">
            Hiển thị{" "}
            <span className="font-bold text-slate-700">
              {filteredStudents.length}
            </span>{" "}
            trên tổng số <span className="font-bold text-slate-700">1,250</span>{" "}
            học viên
          </p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-400 cursor-not-allowed">
              Trang trước
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 font-bold hover:bg-slate-100 transition-colors">
              1
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 font-bold hover:bg-slate-100 transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700 font-bold hover:bg-slate-100 transition-colors">
              Trang sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorStudentsPage;
