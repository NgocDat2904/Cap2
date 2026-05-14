import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faGraduationCap,
  faChartLine,
  faUserCheck,
  faSpinner,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { getInstructorStudentsAPI } from "../../services/instructorAPI";

const InstructorStudentsPage = () => {
  // =========================================================================
  // 1. QUẢN LÝ TRẠNG THÁI DỮ LIỆU TỪ API
  // =========================================================================
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    total_students: 0,
    active_learners: 0,
    avg_completion_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Trạng thái bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");

  // =========================================================================
  // 2. TRUY XUẤT DỮ LIỆU KHỞI TẠO
  // =========================================================================
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Lỗi xác thực: Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
          setLoading(false);
          return;
        }

        const data = await getInstructorStudentsAPI(token);
        
        setStats(data.stats || { total_students: 0, active_learners: 0, avg_completion_rate: 0 });
        setStudents(data.students || []);

      } catch (err) {
        console.error("Lỗi khi tải dữ liệu học viên:", err);
        setError("Lỗi hệ thống: Không thể tải dữ liệu học viên.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // =========================================================================
  // 3. XỬ LÝ LỌC VÀ TÌM KIẾM DỮ LIỆU
  // =========================================================================
  // Trích xuất danh sách khóa học duy nhất để tạo bộ lọc
  const coursesList = useMemo(() => {
    const uniqueCourses = [];
    const courseIds = new Set();
    
    students.forEach((s) => {
      if (!courseIds.has(s.course_id)) {
        courseIds.add(s.course_id);
        uniqueCourses.push({ id: s.course_id, name: s.course_name });
      }
    });
    
    return [{ id: "all", name: "Tất cả khóa học" }, ...uniqueCourses];
  }, [students]);

  // Bộ lọc dữ liệu hiển thị
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchCourse = filterCourse === "all" || student.course_id === filterCourse;
      const matchSearch =
        (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchCourse && matchSearch;
    });
  }, [students, filterCourse, searchTerm]);

  // Hàm tạo ký tự đại diện cho ảnh đại diện (Avatar)
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 h-full animate-fade-slide-up">
      {/* HEADER TỔNG QUAN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Học viên
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Theo dõi tiến độ học tập và quản lý sinh viên trong các khóa học của bạn.
          </p>
        </div>
        {/* <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm active:scale-95">
          <FontAwesomeIcon icon={faDownload} /> Xuất báo cáo CSV
        </button> */}
      </div>

      {/* THẺ THỐNG KÊ (KPI CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl shrink-0">
            <FontAwesomeIcon icon={faGraduationCap} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">
              Tổng số học viên
            </p>
            <h3 className="text-3xl font-black text-slate-900">{stats.total_students.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl shrink-0">
            <FontAwesomeIcon icon={faUserCheck} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">
              Học viên đang hoạt động
            </p>
            <h3 className="text-3xl font-black text-slate-900">{stats.active_learners.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-2xl shrink-0">
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">
              Tỉ lệ hoàn thành (TB)
            </p>
            <h3 className="text-3xl font-black text-slate-900">{Math.round(stats.avg_completion_rate)}%</h3>
          </div>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU & BỘ LỌC */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm relative flex flex-col h-[600px] overflow-hidden">
        
        {/* THANH CÔNG CỤ */}
        <div className="sticky top-0 z-20 p-5 border-b border-slate-200 bg-slate-50/95 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center shadow-sm">
          <div className="relative flex-1 w-full">
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="relative md:w-72 w-full shrink-0">
            <FontAwesomeIcon icon={faFilter} className="absolute left-4 top-3.5 text-slate-400" />
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer truncate"
            >
              {coursesList.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* NỘI DUNG BẢNG */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
              <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-blue-500" />
              <p className="font-semibold">Đang truy xuất dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-500 gap-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl" />
              <p className="font-bold">{error}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm">
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="p-5 w-1/3">Học viên</th>
                  <th className="p-5">Khóa học đăng ký</th>
                  <th className="p-5">Tiến độ học tập</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.student_id} className="hover:bg-slate-50/80 transition-colors group">
                      
                      {/* Cột 1: Thông tin Học viên */}
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          {student.avatar && !student.avatar.includes("null") ? (
                            <img 
                              src={student.avatar} 
                              alt={student.name} 
                              className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0 border border-slate-200"
                              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            />
                          ) : null}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 bg-blue-600 ${(!student.avatar || student.avatar.includes("null")) ? "" : "hidden"}`}
                          >
                            {getInitials(student.name)}
                          </div>
                          
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm truncate">
                              {student.name || "Học viên ẩn danh"}
                            </h4>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Khóa học */}
                      <td className="p-5">
                        <p className="text-sm font-semibold text-slate-700 line-clamp-1">
                          {student.course_name}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400 mt-1">
                          Ngày tham gia: {student.enrolled_at || "Không xác định"}
                        </p>
                      </td>

                      {/* Cột 3: Tiến độ */}
                      <td className="p-5 pr-8">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${student.progress === 100 ? "bg-emerald-500" : student.progress === 0 ? "bg-slate-300" : "bg-blue-500"}`}
                              style={{ width: `${student.progress || 0}%` }}
                            ></div>
                          </div>
                          <span
                            className={`text-xs font-bold w-10 text-right ${student.progress === 100 ? "text-emerald-600" : "text-slate-700"}`}
                          >
                            {student.progress || 0}%
                          </span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 mt-1.5 flex justify-between">
                          <span>Hoạt động gần nhất: {student.last_active || "Chưa từng"}</span>
                          <span>{student.progress_summary?.completed_lessons || 0} / {student.progress_summary?.total_lessons || 0} bài học</span>
                        </p>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-10 text-center text-slate-500 font-medium">
                      Không tìm thấy dữ liệu học viên nào phù hợp với điều kiện lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* PHÂN TRANG */}
        <div className="sticky bottom-0 z-20 p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
          <p className="text-slate-500 font-medium">
            Đang hiển thị <span className="font-bold text-slate-700">{filteredStudents.length}</span> học viên
          </p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-400 cursor-not-allowed">
              Trước
            </button>
            <button className="px-3 py-1.5 border border-blue-600 rounded-md bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors">
              1
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-md bg-white text-slate-400 cursor-not-allowed">
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorStudentsPage;