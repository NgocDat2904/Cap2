import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import myLogo from "../assets/logo.png";
import DashboardFooter from "../components/InstructorAndAdminFooter";
import { logoutAPI } from "../services/authService";
import {
  faBars,
  faSearch,
  faBell,
  faUserShield,
  faChartPie,
  faUsersCog,
  faBook,
  faMoneyBillWave,
  faTags,
  faGears,
  faArrowRightFromBracket,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";

const AdminLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

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
    { name: "Tổng quan", icon: faChartPie, path: "/admin/dashboard" },
    { name: "Quản lý Người dùng", icon: faUsersCog, path: "/admin/users" },
    { name: "Quản lý Khóa học", icon: faBook, path: "/admin/courses" },
    {
      name: "Báo cáo Doanh thu",
      icon: faMoneyBillWave,
      path: "/admin/revenue",
    },
    { name: "Danh mục đào tạo", icon: faTags, path: "/admin/categories" },
    { name: "Duyệt khóa học", icon: faListCheck, path: "/admin/approvals" },
  ];

  const bottomLinks = [
    { name: "Hồ sơ Admin", icon: faUserShield, path: "/admin/profile" },
    { name: "Cài đặt hệ thống", icon: faGears, path: "/admin/settings" },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };
  const handleLogout = async (e) => {
    e.preventDefault();
    handleLinkClick(); // Đóng sidebar trên mobile nếu đang mở

    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        // Gọi API báo Backend vô hiệu hóa token này
        await logoutAPI(token);
      }
    } catch (error) {
      console.error("Lỗi khi đăng xuất API:", error);
    } finally {
      // Dù API có lỗi hay không, cứ dọn sạch túi và đá văng ra Login
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_id");
      navigate("/admin/login");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden relative">
      {/* OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR: Đổi sang màu Slate 950 (Xanh đá cực đậm, gần như đen) */}
      <aside
        className={`fixed md:relative z-30 h-full bg-slate-950 text-slate-300 flex flex-col transition-all duration-300 ease-in-out transform shadow-2xl md:shadow-none border-r border-slate-900
        ${
          isSidebarOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full w-64 md:translate-x-0 md:w-20"
        }`}
      >
        {/* Ánh sáng Gradient phía trên Sidebar */}
        <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none"></div>

        {/* LOGO & TOGGLE */}
        <div
          className={`h-20 flex items-center border-b border-slate-800/80 transition-all duration-300 relative z-10
          ${isSidebarOpen ? "px-6" : "px-0 justify-center"}`}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-400 hover:text-white hover:bg-slate-800 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hidden md:flex"
          >
            <FontAwesomeIcon icon={faBars} className="text-lg" />
          </button>

          <div
            className={`font-bold text-xl text-white tracking-tight flex items-center gap-3 overflow-hidden whitespace-nowrap transition-all duration-300
            ${isSidebarOpen ? "ml-4 opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}
          >
            {/* Giữ nguyên invert để logo hiện màu trắng trên nền tối */}
            <img
              src={myLogo}
              alt="Logo"
              className="w-8 h-8 brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
            />
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight leading-none">
                EduSync
              </span>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 custom-scrollbar px-3 relative z-10">
          <ul className="space-y-1.5">
            {sidebarLinks.map((link) => {
              const isActive = location.pathname.includes(link.path);
              return (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={handleLinkClick}
                    className={`flex items-center py-3 text-sm font-semibold rounded-xl transition-all duration-300
                      ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                      }
                      ${isSidebarOpen ? "px-4 gap-3.5" : "px-0 justify-center"}
                    `}
                    title={!isSidebarOpen ? link.name : ""}
                  >
                    <div
                      className={`flex items-center justify-center ${isSidebarOpen ? "w-6" : "w-auto"}`}
                    >
                      <FontAwesomeIcon
                        icon={link.icon}
                        className={`text-lg ${isActive ? "text-white" : "text-slate-500"}`}
                      />
                    </div>
                    <span
                      className={`whitespace-nowrap transition-all duration-300 
                      ${isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}
                    >
                      {link.name}
                    </span>
                    {link.pendingCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md animate-pulse">
                        {link.pendingCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="my-6 border-t border-slate-800/80 mx-2"></div>

          <ul className="space-y-1.5">
            {bottomLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  onClick={handleLinkClick}
                  className={`flex items-center py-3 text-sm font-semibold rounded-xl transition-all duration-300 text-slate-400 hover:text-slate-100 hover:bg-slate-800/50
                    ${isSidebarOpen ? "px-4 gap-3.5" : "px-0 justify-center"}
                  `}
                  title={!isSidebarOpen ? link.name : ""}
                >
                  <div
                    className={`flex items-center justify-center ${isSidebarOpen ? "w-6" : "w-auto"}`}
                  >
                    <FontAwesomeIcon
                      icon={link.icon}
                      className="text-lg text-slate-500"
                    />
                  </div>
                  <span
                    className={`whitespace-nowrap transition-all duration-300 
                    ${isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}
                  >
                    {link.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Đăng xuất */}
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100/50">
        {/* HEADER: Kính mờ sang trọng */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 sm:px-8 transition-all relative z-10 sticky top-0 shadow-sm">
          <div className="flex items-center flex-1">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mr-4 text-slate-500 hover:text-blue-600 hover:bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center transition-colors md:hidden"
            >
              <FontAwesomeIcon icon={faBars} className="text-xl" />
            </button>

            {/* Khung tìm kiếm Toàn cầu (Global Search) */}
            <div className="relative w-full max-w-xs sm:max-w-md lg:max-w-xl hidden sm:block">
              <input
                type="text"
                placeholder="Tìm kiếm người dùng, ID thanh toán, khóa học..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all shadow-sm"
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
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>

            {/* Admin Profile Area */}
            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">
                  Trần Văn Sếp
                </p>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                  Super Admin
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                <FontAwesomeIcon icon={faUserShield} className="text-lg" />
              </div>
            </button>
          </div>
        </header>

        {/* NỘI DUNG CHÍNH (OUTLET) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
};

export default AdminLayout;
