import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

  // 1. Tạo state để quản lý trạng thái đóng/mở của Sidebar (Mặc định là true: Đang mở)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      {/* SIDEBAR: Thêm hiệu ứng transition và thay đổi độ rộng w-64 (mở) / w-20 (đóng) */}
      <aside
        className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "w-64" : "w-20"}`}
      >
        {/* Logo & Toggle Button */}
        <div
          className={`h-16 flex items-center border-b border-gray-200 transition-all duration-300
          ${isSidebarOpen ? "px-6" : "px-0 justify-center"}`}
        >
          {/* Nút bấm để thay đổi trạng thái isSidebarOpen */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            <FontAwesomeIcon icon={faBars} className="text-xl" />
          </button>

          {/* Chỉ hiển thị Logo và chữ EduSync khi Sidebar đang mở */}
          {isSidebarOpen && (
            <div className="font-bold text-xl text-blue-700 tracking-tight flex items-center gap-2 ml-4 overflow-hidden whitespace-nowrap">
              <span className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-600">
                Logo
              </span>
              EduSync
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          <ul className="space-y-1">
            {sidebarLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`flex items-center py-3 text-sm font-medium transition-all duration-200
                    ${
                      location.pathname === link.path
                        ? "text-blue-600 bg-blue-50 border-r-4 border-blue-600"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-r-4 border-transparent"
                    }
                    ${isSidebarOpen ? "px-6 gap-4" : "px-0 justify-center"}
                  `}
                  title={!isSidebarOpen ? link.name : ""} // Hiển thị tooltip khi thu gọn
                >
                  <FontAwesomeIcon
                    icon={link.icon}
                    className="w-5 h-5 min-w-[20px]"
                  />
                  {/* Căn chỉnh text và chỉ hiện khi Sidebar mở */}
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
              to="/logout" // Bạn có thể sửa path này sau tùy logic đăng xuất
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 transition-all">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm ..."
                className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute right-4 top-3 text-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 ml-4 text-gray-500">
            <button className="hover:text-blue-600 relative">
              <FontAwesomeIcon icon={faBell} className="text-xl" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button className="hover:text-blue-600">
              <FontAwesomeIcon icon={faUserCircle} className="text-2xl" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout;
