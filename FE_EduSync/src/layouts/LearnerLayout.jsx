import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import myLogo from "../assets/logo.png";
import Footer from "../components/LearnerFooter";
import { logoutAPI } from "../services/authService";
import NotificationDropdown from "../components/NotificationDropdown";
import {
  faSearch,
  faUserCircle,
  faHouse,
  faBook,
  faBookOpen,
  faHeart,
  faUser,
  faGear,
  faArrowRightFromBracket,
  faRobot,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const LearnerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Trang chủ", icon: faHouse, path: "/home" },
    { name: "Khóa học", icon: faBook, path: "/courses" },
    { name: "Khóa học của tôi", icon: faBookOpen, path: "/my-courses" },
    { name: "Video yêu thích", icon: faHeart, path: "/favorites" },
  ];

  // =========================================================================
  // HÀM XỬ LÝ ĐĂNG XUẤT CHUẨN BẢO MẬT
  // =========================================================================
  const handleLogout = async (e) => {
    e.preventDefault();
    setIsDropdownOpen(false); // Đóng menu dropdown cho mượt

    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        // Báo Backend cho token này vào "danh sách đen"
        await logoutAPI(token);
      }
    } catch (error) {
      console.error("Lỗi khi đăng xuất API:", error);
    } finally {
      // Dọn dẹp bộ nhớ và đá văng ra ngoài
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_id");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        {/* TẦNG 1: Logo + Search + Actions */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 max-w-7xl mx-auto w-full gap-2 sm:gap-4">
          {/* Logo */}
          <Link
            to="/home"
            className="flex items-center gap-2 sm:gap-3 shrink-0"
          >
            <img
              src={myLogo}
              alt="EduSync Logo"
              className="h-8 sm:h-12 w-auto object-contain"
            />
            <div className="hidden md:block font-semibold text-2xl sm:text-3xl tracking-widest font-irish text-blue-900">
              EduSync
            </div>
          </Link>

          {/* Thanh tìm kiếm */}
          <div className="flex-1 max-w-3xl mx-2 sm:mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm ..."
                className="w-full pl-4 sm:pl-6 pr-10 py-2 rounded-full border border-blue-900 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 text-sm text-gray-700"
              />
              <button className="absolute right-3 sm:right-4 top-2 text-gray-500 hover:text-blue-900 transition-colors">
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4 sm:gap-6 text-gray-600 shrink-0">
            <NotificationDropdown />

            {/* BỘ PHẬN AVATAR VÀ DROPDOWN CHUYÊN NGHIỆP */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="hover:text-blue-900 transition-colors flex items-center focus:outline-none relative"
              >
                <FontAwesomeIcon
                  icon={faUserCircle}
                  className="text-3xl text-slate-700"
                />
                {/* Chấm đỏ ở Avatar */}
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                </span>
              </button>

              {/* Overlay cho Mobile */}
              {isDropdownOpen && (
                <div
                  className="fixed inset-0 z-40 md:hidden"
                  onClick={() => setIsDropdownOpen(false)}
                ></div>
              )}

              {/* Menu thả xuống */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 transition-all origin-top-right animate-fade-slide-up">
                  {/* Widget Gamification */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 mx-2 mb-2 rounded-xl border border-blue-100/50 shadow-sm">
                    <div className="flex justify-between items-end mb-2">
                      <h4 className="font-bold text-gray-800 text-sm">
                        Hồ sơ của bạn
                      </h4>
                      <span className="text-blue-600 font-black text-sm">
                        60%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-blue-200/50 rounded-full overflow-hidden mb-2.5">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: "60%" }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                      Hoàn thiện{" "}
                      <span className="font-bold text-gray-800">Hồ sơ</span> để
                      EduSync cá nhân hóa lộ trình học tập cho riêng bạn nhé!{" "}
                      <FontAwesomeIcon
                        icon={faRobot}
                        className="text-blue-600 ml-0.5"
                      />
                    </p>
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Cập nhật ngay{" "}
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-[10px]"
                      />
                    </Link>
                  </div>

                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faUser}
                      className="w-4 h-4 text-slate-400"
                    />{" "}
                    Hồ sơ cá nhân
                  </Link>

                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FontAwesomeIcon
                      icon={faGear}
                      className="w-4 h-4 text-slate-400"
                    />{" "}
                    Cài đặt
                  </Link>

                  <div className="border-t border-gray-100 my-1"></div>

                  {/* NÚT ĐĂNG XUẤT ĐÃ ĐƯỢC GẮN HÀM XỬ LÝ */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left focus:outline-none"
                  >
                    <FontAwesomeIcon
                      icon={faArrowRightFromBracket}
                      className="w-4 h-4"
                    />{" "}
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TẦNG 2: Navbar */}
        <div className="border-t border-gray-100">
          <nav className="flex items-center justify-start gap-6 sm:gap-12 px-4 sm:px-8 max-w-7xl mx-auto w-full py-3 overflow-x-auto scrollbar-hide">
            {navLinks.map((link) => {
              const isActive = location.pathname.includes(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-2 sm:gap-3 text-sm font-medium transition-colors shrink-0 whitespace-nowrap
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
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-8">
        <Outlet />
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default LearnerLayout;
