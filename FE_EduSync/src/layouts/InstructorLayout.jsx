import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import myLogo from "../assets/logo.png";
import {
  faBars,
  faSearch,
  faBell,
  faUserCircle,
  faTableColumns,
  faBookOpen,
  faUsers,
  faChartBar,
  faGear,
  faUser,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

const InstructorLayout = () => {
  const location = useLocation();

  // State quản lý Sidebar. Mặc định mở trên PC, nhưng nên đóng trên Mobile khi vừa vào trang.
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Tự động đóng sidebar nếu màn hình nhỏ (mobile) khi component load lần đầu
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    // Gọi 1 lần lúc render
    handleResize();
    // Lắng nghe khi người dùng xoay ngang/dọc điện thoại hoặc kéo lại size trình duyệt
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarLinks = [
    { name: "Dashboard", icon: faTableColumns, path: "/instructor/dashboard" },
    { name: "My courses", icon: faBookOpen, path: "/instructor/courses" },
    { name: "Students", icon: faUsers, path: "/instructor/students" },
    { name: "Performance", icon: faChartBar, path: "/instructor/performance" },
  ];

  const bottomLinks = [
    { name: "Tài khoản", icon: faUser, path: "/instructor/account" },
    { name: "Cài đặt", icon: faGear, path: "/instructor/settings" },
  ];

  // Hàm xử lý khi click vào Link (Chỉ đóng sidebar trên Mobile)
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden relative">
      {/* OVERLAY: Lớp màng đen mờ đè lên nội dung, chỉ hiện trên mobile khi mở Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:relative z-30 h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out transform
        ${
          isSidebarOpen
            ? "translate-x-0 w-64" // Khi mở: Nằm đúng vị trí, rộng 64
            : "-translate-x-full w-64 md:translate-x-0 md:w-20" // Khi đóng: Mobile bị văng ra ngoài (-translate-x-full), PC thì thu lại w-20
        }`}
      >
        {/* Logo & Toggle Button (Trong Sidebar) */}
        <div
          className={`h-16 flex items-center border-b border-gray-200 transition-all duration-300
          ${isSidebarOpen ? "px-6" : "px-0 justify-center"}`}
        >
          {/* Nút bấm để thay đổi trạng thái (Chỉ nên dùng cho PC, mobile bấm ra ngoài overlay cho lẹ) */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 hover:text-blue-600 transition-colors hidden md:block"
          >
            <FontAwesomeIcon icon={faBars} className="text-xl" />
          </button>

          {/* Logo */}
          <div
            className={`font-bold text-xl text-blue-700 tracking-tight flex items-center gap-2 overflow-hidden whitespace-nowrap transition-all duration-300
            ${isSidebarOpen ? "ml-4 opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}
          >
            <img src={myLogo} alt="Logo" className="w-8 h-8" />
            <span className="font-semibold text-xl text-blue-600 tracking-widest font-irish">
              EduSync
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar">
          <ul className="space-y-1">
            {sidebarLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  onClick={handleLinkClick}
                  className={`flex items-center py-3 text-sm font-medium transition-all duration-200
                    ${
                      location.pathname === link.path
                        ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-r-4 border-transparent"
                    }
                    ${isSidebarOpen ? "px-6 gap-4" : "px-0 justify-center"}
                  `}
                  title={!isSidebarOpen ? link.name : ""}
                >
                  <FontAwesomeIcon
                    icon={link.icon}
                    className="w-5 h-5 min-w-[20px]"
                  />
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

          <div className="my-6 border-t border-gray-200"></div>

          <ul className="space-y-1">
            {bottomLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  onClick={handleLinkClick}
                  className={`flex items-center py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-r-4 border-transparent transition-all duration-200
                    ${isSidebarOpen ? "px-6 gap-4" : "px-0 justify-center"}
                  `}
                  title={!isSidebarOpen ? link.name : ""}
                >
                  <FontAwesomeIcon
                    icon={link.icon}
                    className="w-5 h-5 min-w-[20px]"
                  />
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
          <div className="border-t border-gray-200 mt-6">
            <Link
              to="/logout"
              onClick={handleLinkClick}
              className={`flex items-center py-4 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 mt-6
              ${isSidebarOpen ? "px-6 gap-4" : "px-0 justify-center"}
            `}
              title={!isSidebarOpen ? "Đăng xuất" : ""}
            >
              <FontAwesomeIcon
                icon={faArrowRightFromBracket}
                className="w-5 h-5 min-w-[20px]"
              />
              <span
                className={`whitespace-nowrap transition-all duration-300 
              ${isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 hidden"}`}
              >
                Đăng xuất
              </span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 transition-all relative z-10">
          <div className="flex items-center flex-1">
            {/* Nút Hamburger TRÊN HEADER (Chỉ hiện trên Mobile) để mở Sidebar */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mr-4 text-gray-500 hover:text-blue-600 transition-colors md:hidden"
            >
              <FontAwesomeIcon icon={faBars} className="text-xl" />
            </button>

            {/* Khung tìm kiếm (Responsive: Thu hẹp lại trên màn hình cực nhỏ) */}
            <div className="relative w-full max-w-xs sm:max-w-md lg:max-w-2xl">
              <input
                type="text"
                placeholder="Tìm kiếm ..."
                className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute right-4 top-2.5 text-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 ml-4 text-gray-500">
            <button className="hover:text-blue-600 relative">
              <FontAwesomeIcon icon={faBell} className="text-xl" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button className="hover:text-blue-600">
              <FontAwesomeIcon icon={faUserCircle} className="text-2xl" />
            </button>
          </div>
        </header>

        {/* NỘI DUNG CHÍNH (OUTLET) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout;
