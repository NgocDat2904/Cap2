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
  faEllipsisV,
  faChartPie,
  faBullhorn,
  faEdit,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { getInstructorDashboardAPI } from "../../services/instructorAPI";

// Component con cho Thẻ KPI
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

// Mock data replaced by API state. Month map for labels:
const monthMap = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Component Dropdown Thời gian
const TimeFilterDropdown = ({ currentFilter, onFilterChange }) => {
  const options = ["Year 2026", "Year 2025", "Year 2024"];
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
  const [timeFilter, setTimeFilter] = useState("Year 2026");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quản lý Action Dropdown của bảng Khóa học
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
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-6 lg:p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-bold">Loading dashboard...</p>
      </div>
    );
  }

  const data = dashboardData || {};

  const currentKpiData = [
    { icon: faChalkboardTeacher,  title: "Active Courses",      value: data.active_courses || 0,   change: "Up to date",   changeType: "increase",    bgColor: "bg-amber-100",   iconColor: "text-amber-600" },
    { icon: faPlayCircle,      title: "Total Lessons",       value: data.total_lessons || 0,  change: "Up to date",  changeType: "increase",   bgColor: "bg-emerald-100", iconColor: "text-emerald-600" },
    { icon: faUserGraduate,       title: "Enrolled Students",   value: data.enrolled_students || 0,  change: "Up to date",  changeType: "increase",   bgColor: "bg-blue-100",    iconColor: "text-blue-600" },
    { icon: faQuestionCircle,     title: "Total Q&A Questions", value: data.total_questions || 0, change: "Up to date", changeType: "increase",  bgColor: "bg-purple-100",  iconColor: "text-purple-600" },
  ];

  // Tính toán dữ liệu trục tung cho biểu đồ học viên
  const chartDataApi = data.student_chart || [];
  const chartLabelsYear = chartDataApi.map((item) => monthMap[item.month - 1] || item.month);
  const chartValuesYear = chartDataApi.map((item) => item.students);
  const maxChartValue = 100; 
  const chartStep = 20; // Chia làm 5 khoảng (0, 20, 40, 60, 80, 100)

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
            Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Overview and quick actions.
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
        {/* Biểu đồ số lượng học viên hàng tháng */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-fade-slide-up overflow-visible relative z-10">
          <div className="flex items-center justify-between mb-8 overflow-visible">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Students Chart
            </h2>
          </div>

          {/* Biểu đồ Bar Chart */}
          <div className="relative w-full h-[320px] flex gap-4 overflow-visible">
            {/* Trục Y labels */}
            <div className="flex flex-col justify-between items-end text-xs text-slate-400 h-[280px] w-12 shrink-0 font-medium relative -top-2">
              {yAxisLabelsYear.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            {/* Khu vực vẽ biểu đồ */}
            <div className="flex-1 flex flex-col justify-between overflow-visible relative">
              {/* Lưới nền (Grid lines) */}
              <div className="absolute inset-0 flex flex-col justify-between h-[280px] pointer-events-none">
                {yAxisLabelsYear.map((_, i) => (
                  <div
                    key={i}
                    className="border-t border-slate-100 w-full h-0"
                  ></div>
                ))}
              </div>

              {/* Cột dữ liệu (Bars) */}
              <div className="absolute left-0 right-0 top-0 h-[280px] flex justify-between items-end px-2 z-10">
                {chartValuesYear.map((value, index) => {
                  const heightPercent = (value / maxChartValue) * 100;
                  return (
                    <div
                      key={index}
                      className="w-[6%] h-full flex flex-col justify-end group relative cursor-pointer"
                    >
                      {/* Cột */}
                      <div
                        className="w-full rounded-t-sm transition-all duration-500 bg-emerald-400 group-hover:bg-emerald-500"
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                      {/* Tooltip khi hover */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-40 pointer-events-none">
                        {value.toLocaleString()} students
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trục X labels (Tháng) */}
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
              Latest Q&A
            </h2>
            <Link
              to="/instructor/qna"
              className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {qnaList.length > 0 ? (
              qnaList.map((qna, idx) => (
                <div
                  key={qna.id || idx}
                  className="flex gap-4 p-4 border border-slate-100 rounded-xl group transition-all hover:border-blue-200 hover:bg-slate-50 hover:shadow-sm"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 border border-slate-300 bg-emerald-600`}
                  >
                    {qna.name ? qna.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-800">
                      {qna.name || "Learner"}
                    </h4>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      Course: {qna.course}
                    </p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                      {qna.question}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 mt-2">
                      {qna.date || new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No recent Q&A.</p>
            )}
          </div>
        </div>
      </div>

      {/* DÒNG 3: KHÓA HỌC PHỔ BIẾN VÀ HÀNH ĐỘNG NHANH */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Bảng khóa học */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-fade-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Most Popular Courses
            </h2>
            <Link
              to="/instructor/courses"
              className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto min-h-[250px] custom-scrollbar">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="p-4 w-1/2">Course</th>
                  <th className="p-4">Students</th>
                  <th className="p-4">Revenue</th>
                  {/* <th className="p-4 text-center">Actions</th> */}
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

                    {/* CỘT HÀNH ĐỘNG */}
                    {/* <td className="p-4 text-center">
                      <div className="flex justify-center items-center gap-1.5 relative">
                        <button
                          className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center"
                          title="Gửi thông báo lớp học"
                        >
                          <FontAwesomeIcon
                            icon={faBullhorn}
                            className="text-sm"
                          />
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center"
                          title="Thống kê khóa học"
                        >
                          <FontAwesomeIcon
                            icon={faChartPie}
                            className="text-sm"
                          />
                        </button>

                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setOpenActionId(
                                openActionId === course.id ? null : course.id,
                              )
                            }
                            className={`w-8 h-8 rounded-lg transition-colors flex items-center justify-center ${openActionId === course.id ? "bg-slate-200 text-slate-800" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
                          >
                            <FontAwesomeIcon
                              icon={faEllipsisV}
                              className="text-sm"
                            />
                          </button>

                   
                          {openActionId === course.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-[100] py-2 animate-fade-slide-up origin-top-right">
                              <button
                                onClick={() =>
                                  navigate("/instructor/courses/" + course.id)
                                }
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3 font-medium"
                              >
                                <FontAwesomeIcon
                                  icon={faEdit}
                                  className="text-slate-400 w-4"
                                />{" "}
                                Chỉnh sửa khóa học
                              </button>
                              <button
                                onClick={() => navigate("/instructor/students")}
                                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-3 font-medium"
                              >
                                <FontAwesomeIcon
                                  icon={faUsers}
                                  className="text-slate-400 w-4"
                                />{" "}
                                Quản lý học viên
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center p-4 text-slate-500">
                    No popular courses yet.
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hành động nhanh */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-fade-slide-up h-fit">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6 border-b border-slate-100 pb-6">
            Quick Actions
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
                Create new course
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
                Answer Q&A
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboardPage;