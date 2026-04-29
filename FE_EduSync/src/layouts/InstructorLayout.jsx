import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import myLogo from "../assets/logo.png";
import DashboardFooter from "../components/InstructorAndAdminFooter";
import { logoutAPI } from "../services/authService";
import { getInstructorProfileAPI } from "../services/instructorAPI";
import {
  faBars,
  faSearch,
  faBell,
  faUserCircle,
  faTableColumns,
  faBookOpen,
  faUsers,
  faGear,
  faUser,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

const InstructorLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  //  1. STATE LƯU THÔNG TIN PROFILE CỦA GIẢNG VIÊN
  const [instructorProfile, setInstructorProfile] = useState({
    fullName: "",
    role: "",
    avatarUrl: "",
  });

  // =========================================================================
  //  2. GỌI API LẤY THÔNG TIN GIẢNG VIÊN KHI MỞ TRANG
  // =========================================================================
  useEffect(() => {
    const fetchInstructorProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return; // ✅ Chỉ cần token, backend tự xác định user từ JWT

      try {
        const data = await getInstructorProfileAPI(token);
        setInstructorProfile(data);
      } catch (error) {
        console.error("Lỗi lấy thông tin Giảng viên trên Layout:", error);
      }
    };
    fetchInstructorProfile();
  }, []);
  

  // =========================================================================
  // XỬ LÝ RESIZE WINDOW
  // =========================================================================
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarLinks = [
    { name: "Dashboard", icon: faTableColumns, path: "/instructor/dashboard" },
    { name: "My courses", icon: faBookOpen, path: "/instructor/courses" },
    { name: "Students", icon: faUsers, path: "/instructor/students" },
  ];

  const bottomLinks = [
    { name: "Tài khoản", icon: faUser, path: "/instructor/account" },
    { name: "Cài đặt", icon: faGear, path: "/instructor/settings" },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // =========================================================================
  // HÀM XỬ LÝ ĐĂNG XUẤT
  // =========================================================================
  const handleLogout = async (e) => {
    e.preventDefault();
    handleLinkClick();

    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        await logoutAPI(token);
      }
    } catch (error) {
      console.error("Lỗi khi đăng xuất API:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_id");
      navigate("/instructor/login");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden relative">
      {/* OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 md:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:relative z-30 h-full bg-white border-r border-slate-200/60 flex flex-col transition-all duration-300 ease-in-out transform shadow-[4px_0_24px_rgba(0,0,0,0.02)]
        ${
          isSidebarOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full w-64 md:translate-x-0 md:w-20"
        }`}
      >
        {/* LOGO AREA */}
        <div
          className={`h-20 flex items-center border-b border-slate-100 transition-all duration-300
          ${isSidebarOpen ? "px-6" : "px-0 justify-center"}`}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hidden md:flex"
          >
            <FontAwesomeIcon
              icon={faBars}
              className="text-lg hover:text-blue-600"
            />
          </button>

          <div
            className={`flex items-center gap-3 overflow-hidden whitespace-nowrap transition-all duration-300
            ${isSidebarOpen ? "ml-4 opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}
          >
            <img
              src={myLogo}
              alt="Logo"
              className="w-9 h-9 object-contain drop-shadow-sm"
            />
            <div className="flex flex-col">
              <span className="font-bold text-xl text-slate-900 tracking-tight leading-none">
                EduSync
              </span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">
                Instructor
              </span>
            </div>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 custom-scrollbar px-3 flex flex-col">
          <ul className="space-y-1.5 flex-1">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname.includes(link.path);
              return (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={handleLinkClick}
                    className={`group flex items-center py-3 text-sm font-semibold rounded-xl transition-all duration-200
                      ${isActive ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50" : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"}
                      ${isSidebarOpen ? "px-4 gap-3.5" : "px-0 justify-center"}
                    `}
                    title={!isSidebarOpen ? link.name : ""}
                  >
                    <div
                      className={`group-hover:text-blue-600 flex items-center justify-center ${isSidebarOpen ? "w-6" : "w-auto"}`}
                    >
                      <FontAwesomeIcon
                        icon={link.icon}
                        className={`group-hover:text-blue-600 transition-all duration-200 text-lg ${isActive ? "text-blue-600 " : "text-slate-400 "}`}
                      />
                    </div>
                    <span
                      className={`whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}
                    >
                      {link.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="my-6 border-t border-slate-100 mx-2"></div>

          <ul className="space-y-1.5">
            {bottomLinks.map((link) => {
              const isActive = location.pathname.includes(link.path);
              return (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={handleLinkClick}
                    className={`group flex items-center py-3 text-sm font-semibold rounded-xl transition-all duration-200
                      ${isActive ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50" : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"}
                      ${isSidebarOpen ? "px-4 gap-3.5" : "px-0 justify-center"}
                    `}
                    title={!isSidebarOpen ? link.name : ""}
                  >
                    <div
                      className={`group-hover:text-blue-600 flex items-center justify-center ${isSidebarOpen ? "w-6" : "w-auto"}`}
                    >
                      <FontAwesomeIcon
                        icon={link.icon}
                        className={`group-hover:text-blue-600 transition-all duration-200 text-lg ${isActive ? "text-blue-600" : "text-slate-400"}`}
                      />
                    </div>
                    <span
                      className={`whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}
                    >
                      {link.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* NÚT ĐĂNG XUẤT */}
          <div className="mt-4">
            <button
              onClick={handleLogout}
              className={`w-full group flex items-center py-3 text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 focus:outline-none
              ${isSidebarOpen ? "px-4 gap-3.5" : "px-0 justify-center"}
            `}
              title={!isSidebarOpen ? "Đăng xuất" : ""}
            >
              <div
                className={`group-hover:text-red-600 flex items-center justify-center ${isSidebarOpen ? "w-6" : "w-auto"}`}
              >
                <FontAwesomeIcon
                  icon={faArrowRightFromBracket}
                  className="text-lg text-red-500 transition-all duration-200"
                />
              </div>
              <span
                className={`whitespace-nowrap transition-all duration-300 ${isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}
              >
                Đăng xuất
              </span>
            </button>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* HEADER TOP CỦA LAYOUT */}
        {/* HEADER TOP CỦA LAYOUT */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-8 transition-all relative z-10 sticky top-0 shadow-sm">
          <div className="flex items-center flex-1">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mr-4 text-slate-500 hover:text-blue-600 hover:bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center transition-colors md:hidden"
            >
              <FontAwesomeIcon icon={faBars} className="text-xl" />
            </button>

            <div className="relative w-full max-w-xs sm:max-w-md lg:max-w-xl">
              <input
                type="text"
                placeholder="Tìm kiếm khóa học, học viên..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-100 border-transparent focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all text-slate-700"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-3.5 text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 ml-4">
            <button className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 w-10 h-10 rounded-xl relative transition-all flex items-center justify-center">
              <FontAwesomeIcon icon={faBell} className="text-xl" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>

            <button
              onClick={() => navigate("/instructor/account")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              {/* 3. BINDING DỮ LIỆU STATE VÀO GIAO DIỆN Ở ĐÂY */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">
                  {/* Bắt bao trọn các trường hợp tên biến Backend có thể trả về */}
                  {instructorProfile.fullName ||
                    instructorProfile.full_name ||
                    instructorProfile.name ||
                    "Giảng viên"}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {instructorProfile.role || "Giảng viên"}
                </p>
              </div>

              {/* Logic Check Ảnh Đại Diện siêu thông minh */}
              {instructorProfile.avatarUrl ||
              instructorProfile.avatar ||
              instructorProfile.avatar_url ? (
                <img
                  src={
                    instructorProfile.avatarUrl ||
                    instructorProfile.avatar ||
                    instructorProfile.avatar_url
                  }
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md bg-slate-100"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center shadow-md border-2 border-white">
                  <FontAwesomeIcon icon={faUserCircle} className="text-xl" />
                </div>
              )}
            </button>
          </div>
        </header>

        {/* PHẦN CHỨA CÁC TRANG CON */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
};

export default InstructorLayout;
