import React, { useState } from "react"; // Bổ sung useState
import { Outlet, Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import myLogo from "../assets/logo.png";
import {
  faSearch,
  faBell,
  faUserCircle,
  faHouse,
  faBook,
  faBookOpen,
  faHeart,
  faUser,
  faGear,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

const LearnerLayout = () => {
  const location = useLocation();

  // State quản lý việc Đóng/Mở dropdown của Avatar (Mặc định là false - Đóng)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Trang chủ", icon: faHouse, path: "/home" },
    { name: "Khóa học", icon: faBook, path: "/courses" },
    { name: "Khóa học của tôi", icon: faBookOpen, path: "/my-courses" },
    { name: "Video yêu thích", icon: faHeart, path: "/favorites" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        {/* TẦNG 1 */}
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto w-full">
          <Link to="/learner/home" className="flex items-center gap-3">
            <img
              src={myLogo}
              alt="EduSync Logo"
              className=" h-12 w-auto object-contain "
            />
            <div className="font-semibold text-3xl  tracking-widest font-irish text-blue-900 ">
              EduSync
            </div>
          </Link>

          <div className="flex-1 max-w-3xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm ..."
                className="w-full pl-6 pr-12 py-2 rounded-full border border-blue-900 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 text-sm text-gray-700"
              />
              <button className="absolute right-4 top-2 text-gray-500 hover:text-blue-900">
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>
          </div>

          {/* User Actions (Bao gồm Chuông và Avatar) */}
          <div className="flex items-center gap-6 text-gray-600">
            <button className="hover:text-blue-900 relative transition-colors">
              <FontAwesomeIcon icon={faBell} className="text-xl" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            {/* BỘ PHẬN AVATAR VÀ DROPDOWN */}
            <div className="relative">
              {/* Nút Avatar */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="hover:text-blue-900 transition-colors flex items-center focus:outline-none"
              >
                <FontAwesomeIcon icon={faUserCircle} className="text-3xl" />
              </button>

              {/* Hộp thoại Dropdown (Chỉ hiện khi isDropdownOpen = true) */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 transition-all">
                  {/* Link Profile */}
                  <Link
                    to="/learner/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors "
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FontAwesomeIcon icon={faUser} className="w-4 h-4" />
                    Hồ sơ cá nhân
                  </Link>

                  {/* Link Settings */}
                  <Link
                    to="/learner/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FontAwesomeIcon icon={faGear} className="w-4 h-4" />
                    Cài đặt
                  </Link>

                  {/* Đường kẻ ngang phân cách */}
                  <div className="border-t border-gray-100 my-1"></div>

                  {/* Link Logout */}
                  <Link
                    to="/logout"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faArrowRightFromBracket}
                      className="w-4 h-4"
                    />
                    Đăng xuất
                  </Link>
                </div>
              )}
            </div>
            {/* KẾT THÚC BỘ PHẬN AVATAR */}
          </div>
        </div>

        {/* TẦNG 2: Navbar */}
        <div className="border-t border-gray-100">
          <nav className="flex items-center justify-start gap-12 px-8 max-w-7xl mx-auto w-full py-3">
            {navLinks.map((link) => {
              const isActive = location.pathname.includes(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-3 text-sm font-medium transition-colors
                    ${isActive ? "text-blue-700 font-bold" : "text-gray-600 hover:text-blue-700 font-bold"}
                  `}
                >
                  <FontAwesomeIcon icon={link.icon} className="text-lg" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default LearnerLayout;
