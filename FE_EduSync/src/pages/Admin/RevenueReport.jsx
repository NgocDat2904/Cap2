import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faChartSimple,
  faArrowTrendUp,
  faDownload,
  faCalendarDays,
  faTrophy,
  faUsersLine,
  faGraduationCap,
  faSpinner,
  faArrowTrendDown,
} from "@fortawesome/free-solid-svg-icons";
import {
  getRevenueStatsAPI,
  getRevenueChartAPI,
  getTopCoursesAPI,
  getStudentsChartAPI,
} from "../../services/revenueAPI";
import toast from "../../utils/toast";

const AdminRevenueReport = () => {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(2026);
  const [loading, setLoading] = useState(true);

  // States for data
  const [revenueStats, setRevenueStats] = useState({
    total_revenue: 0,
    total_sales: 0,
    active_learners: 0,
    growth: 0,
  });
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [studentsChartData, setStudentsChartData] = useState([]);
  const [topCourses, setTopCourses] = useState([]);

  // Fetch data khi component mount hoặc selectedYear thay đổi
  useEffect(() => {
    fetchAllData();
  }, [selectedYear]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để xem báo cáo.");
        navigate("/admin/login");
        return;
      }

      // Fetch tất cả data song song
      const [stats, revenueChart, studentsChart, courses] = await Promise.all([
        getRevenueStatsAPI(selectedYear, token),
        getRevenueChartAPI(selectedYear, token),
        getStudentsChartAPI(selectedYear, token),
        getTopCoursesAPI(4, token),
      ]);

      setRevenueStats(stats);
      setRevenueChartData(revenueChart);
      setStudentsChartData(studentsChart);
      setTopCourses(courses);
    } catch (error) {
      console.error("Lỗi khi tải báo cáo doanh thu:", error);
      toast.error("Không thể tải báo cáo doanh thu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const maxRevenueValue =
    revenueChartData.length > 0 ? Math.max(...revenueChartData.map((d) => d.revenue)) : 1;
  const maxStudentsValue = 100;

  return (
    <div className="flex-1 p-6 sm:p-8 bg-slate-50 min-h-screen font-sans animate-fade-slide-up">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Báo cáo Doanh thu
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Theo dõi tổng doanh thu nền tảng và hiệu suất của các khóa học.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <FontAwesomeIcon
              icon={faCalendarDays}
              className="absolute left-4 top-3 text-slate-400"
            />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
            >
              <option value={2026}>Năm 2026</option>
              <option value={2025}>Năm 2025</option>
              <option value={2024}>Năm 2024</option>
              <option value={2023}>Năm 2023</option>
              <option value={2022}>Năm 2022</option>
              <option value={2021}>Năm 2021</option>
              <option value={2020}>Năm 2020</option>
            </select>
          </div>
          <button className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-sm shadow-blue-600/20 flex items-center gap-2 shrink-0 active:scale-95">
            <FontAwesomeIcon icon={faDownload} /> Xuất báo cáo Excel
          </button>
        </div>
      </div>

      {/* WIDGETS TỔNG QUAN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {/* Tổng Doanh thu Trung tâm */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-6 rounded-3xl shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl group-hover:bg-emerald-300/30 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center text-xl backdrop-blur-sm border border-white/20">
              <FontAwesomeIcon icon={faWallet} />
            </div>
            <span className="px-2.5 py-1 bg-white/20 text-emerald-100 text-xs font-bold rounded-lg flex items-center gap-1 border border-white/20 backdrop-blur-md">
              <FontAwesomeIcon icon={faArrowTrendUp} /> +{revenueStats.growth}%
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-emerald-100 mb-1">
              Tổng doanh thu nền tảng
            </p>
            <h3 className="text-3xl sm:text-4xl font-black text-white">
              {formatMoney(revenueStats.total_revenue)}
            </h3>
          </div>
        </div>

        {/* Tổng lượt bán */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-blue-100 text-blue-600">
              <FontAwesomeIcon icon={faChartSimple} />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">
              Tổng lượt bán khóa học
            </p>
            <h3 className="text-3xl font-black text-slate-800">
              {revenueStats.total_sales.toLocaleString()}{" "}
              <span className="text-lg text-slate-500 font-bold">lượt</span>
            </h3>
          </div>
        </div>

        {/* Học viên đang Active */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-purple-100 text-purple-600">
              <FontAwesomeIcon icon={faUsersLine} />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">
              Học viên đang hoạt động
            </p>
            <h3 className="text-3xl font-black text-slate-800">
              {revenueStats.active_learners.toLocaleString()}{" "}
              <span className="text-lg text-slate-500 font-bold">học viên</span>
            </h3>
          </div>
        </div>
      </div>

      {/* BỐ CỤC 2 CỘT: BIỂU ĐỒ & BẢNG XẾP HẠNG */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* CỘT TRÁI (Biểu đồ - Chiếm 2/3) */}
        <div className="xl:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">
                Biểu đồ doanh thu
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Xu hướng doanh thu trong năm {selectedYear}
              </p>
            </div>
          </div>

          {/* KHU VỰC BIỂU ĐỒ CỘT BẰNG TAILWIND */}
          {loading ? (
            <div className="h-72 w-full flex items-center justify-center">
              <FontAwesomeIcon icon={faSpinner} className="text-4xl text-slate-400 animate-spin" />
            </div>
          ) : (
            <div className="h-72 w-full flex items-end justify-between gap-4 sm:gap-8 pt-6 border-b border-slate-200 relative">
              <div className="absolute w-full h-full flex flex-col justify-between pb-6 pointer-events-none">
                {[100, 75, 50, 25, 0].map((percent) => (
                  <div
                    key={percent}
                    className="w-full border-t border-slate-100/80 border-dashed flex items-center"
                  >
                    <span className="text-[10px] font-bold text-slate-400 -translate-y-1/2 bg-white pr-2">
                      {formatMoney((maxRevenueValue * percent) / 100).replace(
                        ".00",
                        "",
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {revenueChartData.map((data, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col justify-end items-center group relative z-10 h-full pb-0.5"
                >
                  <div className="absolute -top-10 bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-20">
                    Doanh thu:{" "}
                    <span className="text-emerald-400">
                      {formatMoney(data.revenue)}
                    </span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                  </div>

                  <div className="w-full max-w-[40px] flex items-end h-full pt-6">
                    {/* Cột Tổng doanh thu duy nhất */}
                    <div
                      className="w-full bg-emerald-500 rounded-t-md group-hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      style={{ height: `${(data.revenue / maxRevenueValue) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 mt-3">
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CỘT PHẢI (Top Khóa học - Chiếm 1/3) */}
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <FontAwesomeIcon icon={faTrophy} className="text-amber-500" />{" "}
              Top Khóa học Doanh thu Cao
            </h2>
          </div>

          <div className="p-6 space-y-5 flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <FontAwesomeIcon icon={faSpinner} className="text-3xl text-slate-400 animate-spin" />
              </div>
            ) : (
              topCourses.map((course, index) => (
                <div
                  key={course.id}
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <div className="relative shrink-0">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-16 h-12 object-cover rounded-lg border border-slate-200"
                    />
                    <div
                      className={`absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm
                      ${index === 0 ? "bg-amber-400" : index === 1 ? "bg-slate-400" : index === 2 ? "bg-amber-700" : "bg-slate-800"}
                    `}
                    >
                      {index + 1}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors"
                      title={course.title}
                    >
                      {course.title}
                    </p>
                    <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                      <FontAwesomeIcon icon={faGraduationCap} className="w-3" />{" "}
                      Giảng viên: {course.instructor}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-slate-500">
                        {course.sales} lượt bán
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="text-xs font-black text-emerald-600">
                        {formatMoney(course.total_revenue)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* BIỂU ĐỒ HỌC VIÊN THEO THÁNG */}
      <div className="mt-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">
              Biểu đồ học viên
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Số lượng học viên tham gia trong năm {selectedYear}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="h-72 w-full flex items-center justify-center">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-slate-400 animate-spin" />
          </div>
        ) : (
          <div className="h-72 w-full flex items-end justify-between gap-4 sm:gap-8 pt-6 border-b border-slate-200 relative">
            <div className="absolute w-full h-full flex flex-col justify-between pb-6 pointer-events-none">
              {[100, 75, 50, 25, 0].map((percent) => (
                <div
                  key={percent}
                  className="w-full border-t border-slate-100/80 border-dashed flex items-center"
                >
                  <span className="text-[10px] font-bold text-slate-400 -translate-y-1/2 bg-white pr-2">
                    {Math.round((maxStudentsValue * percent) / 100)}
                  </span>
                </div>
              ))}
            </div>

            {studentsChartData.map((data, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col justify-end items-center group relative z-10 h-full pb-0.5"
              >
                <div className="absolute -top-10 bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-20">
                  Học viên:{" "}
                  <span className="text-purple-400">
                    {data.students} học viên
                  </span>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>

                <div className="w-full max-w-[40px] flex items-end h-full pt-6">
                  <div
                    className="w-full bg-purple-500 rounded-t-md group-hover:bg-purple-400 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                    style={{ height: `${(data.students / maxStudentsValue) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-slate-500 mt-3">
                  {data.month}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRevenueReport;