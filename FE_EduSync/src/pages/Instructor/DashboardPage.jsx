import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlayCircle,
  faChalkboardTeacher,
  faCalendarAlt,
  faPlus,
  faQuestionCircle,
  faUserGraduate,
  faCircleCheck,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { getInstructorDashboardAPI } from "../../services/instructorAPI";

// Component Thẻ thống kê (KPI Card)
const KpiCard = ({
  icon,
  title,
  value,
  change,
  changeType,
  iconColor,
  bgColor,
}) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 ${bgColor} ${iconColor}`}
      >
        <FontAwesomeIcon icon={icon} />
      </div>
      <div
        className={`px-3 py-1 text-xs font-bold rounded-full ${changeType === "increase" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
      >
        {changeType === "increase" ? "+" : ""}
        {change}
      </div>
    </div>
    <div>
      <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">
        {title}
      </p>
      <h3 className="text-3xl font-black text-slate-900">{value}</h3>
    </div>
  </div>
);

// Map dữ liệu tháng sang tiếng Việt
const monthMap = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];

// Component Bộ lọc thời gian (Dropdown)
const TimeFilterDropdown = ({ currentFilter, onFilterChange }) => {
  const options = ["Năm 2026", "Năm 2025", "Năm 2024"];
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm active:scale-95"
      >
        <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600" />
        <span>{currentFilter}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`text-xs ml-1 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-[100] py-2 animate-fade-slide-up origin-top-right">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onFilterChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-3 ${currentFilter === option ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}
            >
              {option}
              {currentFilter === option && (
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="text-blue-600 ml-auto text-xs"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const InstructorDashboardPage = () => {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState("Năm 2026");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openActionId, setOpenActionId] = useState(null);
  const actionDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        actionDropdownRef.current &&
        !actionDropdownRef.current.contains(event.target)
      ) {
        setOpenActionId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        const data = await getInstructorDashboardAPI(token);
        
        console.log("Dữ liệu biểu đồ từ máy chủ:", JSON.stringify(data.student_chart, null, 2));
        setDashboardData(data);
      } catch (err) {
        console.error("Lỗi truy xuất dữ liệu tổng quan:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-6 lg:p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-bold">Đang tải dữ liệu tổng quan...</p>
      </div>
    );
  }

  const data = dashboardData || {};

  const currentKpiData = [
    { icon: faChalkboardTeacher, title: "Khóa học hiện hành", value: data.active_courses || 0, change: "Đã cập nhật", changeType: "increase", bgColor: "bg-amber-100", iconColor: "text-amber-600" },
    { icon: faPlayCircle, title: "Tổng số bài học", value: data.total_lessons || 0, change: "Đã cập nhật", changeType: "increase", bgColor: "bg-emerald-100", iconColor: "text-emerald-600" },
    { icon: faUserGraduate, title: "Học viên đăng ký", value: data.enrolled_students || 0, change: "Đã cập nhật", changeType: "increase", bgColor: "bg-blue-100", iconColor: "text-blue-600" },
    { icon: faQuestionCircle, title: "Tổng số câu hỏi Q&A", value: data.total_questions || 0, change: "Đã cập nhật", changeType: "increase", bgColor: "bg-purple-100", iconColor: "text-purple-600" },
  ];

  // Tính toán dữ liệu trục tung cho biểu đồ
  const chartDataApi = data.student_chart || [];
  const chartLabelsYear = chartDataApi.map((item) => monthMap[item.month - 1] || item.month);
  const chartValuesYear = chartDataApi.map((item) => item.students);
  const maxChartValue = 100; 
  const chartStep = 20;

  const yAxisLabelsYear = [];
  for (let i = 0; i <= maxChartValue; i += chartStep) {
    yAxisLabelsYear.push(i.toString());
  }
  yAxisLabelsYear.reverse();

  const qnaList = data.latest_qa || [];
  const popularCoursesData = data.popular_courses || [];

  return (
    <div className="flex-1 p-6 lg:p-8 bg-slate-50 min-h-screen animate-fade-slide-up pb-20 overflow-visible">
      {/* HEADER TỔNG QUAN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Bảng điều khiển
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Tổng quan dữ liệu giảng dạy và thao tác nhanh.
          </p>
        </div>
        <TimeFilterDropdown
          currentFilter={timeFilter}
          onFilterChange={setTimeFilter}
        />
      </div>

      {/* DÒNG 1: KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {currentKpiData.map((kpi, index) => (
          <KpiCard key={index} {...kpi} />
        ))}
      </div>

      {/* DÒNG 2: BIỂU ĐỒ VÀ Q&A TÓM TẮT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8 overflow-visible">
        {/* Biểu đồ số lượng học viên */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-fade-slide-up overflow-visible relative z-10">
          <div className="flex items-center justify-between mb-8 overflow-visible">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Biểu đồ tăng trưởng học viên
            </h2>
          </div>

          <div className="relative w-full h-[320px] flex gap-4 overflow-visible">
            <div className="flex flex-col justify-between items-end text-xs text-slate-400 h-[280px] w-12 shrink-0 font-medium relative -top-2">
              {yAxisLabelsYear.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <div className="flex-1 flex flex-col justify-between overflow-visible relative">
              {/* Lưới nền */}
              <div className="absolute inset-0 flex flex-col justify-between h-[280px] pointer-events-none">
                {yAxisLabelsYear.map((_, i) => (
                  <div
                    key={i}
                    className="border-t border-slate-100 w-full h-0"
                  ></div>
                ))}
              </div>

              {/* Cột dữ liệu */}
              <div className="absolute left-0 right-0 top-0 h-[280px] flex justify-between items-end px-2 z-10">
                {chartValuesYear.map((value, index) => {
                  const heightPercent = (value / maxChartValue) * 100;
                  return (
                    <div
                      key={index}
                      className="w-[6%] h-full flex flex-col justify-end group relative cursor-pointer"
                    >
                      <div
                        className="w-full rounded-t-sm transition-all duration-500 bg-emerald-400 group-hover:bg-emerald-500"
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-40 pointer-events-none">
                        {value.toLocaleString()} học viên
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trục X */}
              <div className="absolute bottom-0 translate-y-full left-0 right-0 flex justify-between text-[11px] text-slate-400 pt-3 font-bold px-2">
                {chartLabelsYear.map((label) => (
                  <span key={label} className="w-[6%] text-center">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Q&A Mới nhất */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-fade-slide-up">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-6">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Q&A Mới nhất
            </h2>
            <Link
              to="/instructor/qna"
              className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all"
            >
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-4">
            {qnaList.length > 0 ? (
              qnaList.map((qna, idx) => (
                <div
                  key={qna.id || idx}
                  className="flex gap-4 p-4 border border-slate-100 rounded-xl group transition-all hover:border-blue-200 hover:bg-slate-50 hover:shadow-sm cursor-pointer"
                >
                  {qna.avatar ? (
                    <img
                      src={qna.avatar}
                      alt={qna.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-slate-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 border-2 border-slate-200 bg-gradient-to-br from-blue-500 to-purple-600 ${qna.avatar ? 'hidden' : ''}`}
                  >
                    {qna.name ? qna.name.charAt(0).toUpperCase() : "H"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-800">
                      {qna.name || "Học viên ẩn danh"}
                    </h4>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      📚 {qna.course}
                    </p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                      {qna.question}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 mt-2 flex items-center gap-1">
                      <span>🕒</span>
                      {qna.date ? new Date(qna.date).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : "Không rõ"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FontAwesomeIcon icon={faQuestionCircle} className="text-3xl text-slate-300" />
                </div>
                <p className="text-sm text-slate-500 font-medium">Chưa có câu hỏi nào từ học viên</p>
                <p className="text-xs text-slate-400 mt-1">Học viên sẽ đặt câu hỏi trong các bài học của bạn</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DÒNG 3: KHÓA HỌC TIÊU BIỂU VÀ THAO TÁC NHANH */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-fade-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Khóa học tiêu biểu
            </h2>
            <Link
              to="/instructor/courses"
              className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="overflow-x-auto min-h-[250px] custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="p-4 w-1/2">Khóa học</th>
                  <th className="p-4">Học viên</th>
                  <th className="p-4">Doanh thu</th>
                </tr>
              </thead>
              <tbody
                className="divide-y divide-slate-100"
                ref={actionDropdownRef}
              >
                {popularCoursesData.length > 0 ? (
                  popularCoursesData.map((course) => (
                    <tr
                      key={course.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="p-4 flex items-center gap-4 min-w-0">
                        <img
                          src={course.thumbnail || course.image || "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=300&q=80"}
                          alt={course.title}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                        <h4 className="font-bold text-slate-800 line-clamp-2 group-hover:text-blue-800">
                          {course.title}
                        </h4>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">
                        {course.students ? course.students.toLocaleString() : 0}
                      </td>
                      <td className="p-4 font-semibold text-slate-700">
                        ${course.revenue ? course.revenue.toLocaleString() : "0.00"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center p-4 text-slate-500">
                      Chưa có dữ liệu thống kê khóa học.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Thao tác nhanh */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-fade-slide-up h-fit">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6 border-b border-slate-100 pb-6">
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/instructor/courses/create"
              className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col items-center justify-center text-center group transition-all hover:bg-blue-600 hover:border-blue-600 hover:shadow-md active:scale-95"
            >
              <FontAwesomeIcon
                icon={faPlus}
                className="text-blue-600 text-2xl mb-4 group-hover:text-white transition-colors"
              />
              <p className="text-sm font-bold text-slate-800 group-hover:text-white transition-colors leading-relaxed">
                Tạo khóa học mới
              </p>
            </Link>
            <Link
              to="/instructor/qna"
              className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex flex-col items-center justify-center text-center group transition-all hover:bg-blue-600 hover:border-blue-600 hover:shadow-md active:scale-95"
            >
              <FontAwesomeIcon
                icon={faQuestionCircle}
                className="text-blue-600 text-2xl mb-4 group-hover:text-white transition-colors"
              />
              <p className="text-sm font-bold text-slate-800 group-hover:text-white transition-colors leading-relaxed">
                Phản hồi Q&A
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboardPage;