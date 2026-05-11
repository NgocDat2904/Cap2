import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import myLogo from "../assets/logo.png";
import Footer from "../components/LearnerFooter";
import { logoutAPI } from "../services/authService";
import NotificationDropdown from "../components/NotificationDropdown";
import { getProfileAPI } from "../services/userAPI";
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
  faRightToBracket,
} from "@fortawesome/free-solid-svg-icons";

const LearnerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const [userProfile, setUserProfile] = useState(null);
  const isLoggedIn = Boolean(localStorage.getItem("access_token"));

  // Gọi API lấy thông tin User ngay khi Layout load lên
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const data = await getProfileAPI(token);
        setUserProfile(data); // Lưu data vào state
      } catch (error) {
        console.error("Error loading user profile on Layout:", error);
      }
    };
    fetchUserData();
  }, []);

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
    { name: "Home", icon: faHouse, path: "/home" },
    { name: "Courses", icon: faBook, path: "/courses" },
    {
      name: "My Courses",
      icon: faBookOpen,
      path: isLoggedIn ? "/my-courses" : "/login",
    },
    {
      name: "Favorites",
      icon: faHeart,
      path: isLoggedIn ? "/favorites" : "/login",
    },
  ];

  const handleLogout = async (e) => {
    e.preventDefault();
    setIsDropdownOpen(false);

    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        await logoutAPI(token);
      }
    } catch (error) {
      console.error("Error during logout API:", error);
    } finally {
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
            <div
              className={`relative ${!isLoggedIn ? "cursor-pointer" : ""}`}
              onClick={
                !isLoggedIn
                  ? () => navigate("/login", { state: { from: location.pathname } })
                  : undefined
              }
              role={!isLoggedIn ? "button" : undefined}
              tabIndex={!isLoggedIn ? 0 : undefined}
              onKeyDown={
                !isLoggedIn
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ")
                        navigate("/login", { state: { from: location.pathname } });
                    }
                  : undefined
              }
            >
              <input
                type="text"
                readOnly={!isLoggedIn}
                placeholder={
                  isLoggedIn ? "Search..." : "Sign in to search courses..."
                }
                className={`w-full pl-4 sm:pl-6 pr-10 py-2 rounded-full border border-blue-900 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 text-sm text-gray-700 ${!isLoggedIn ? "bg-slate-50 text-slate-500" : ""}`}
              />
              <span className="absolute right-3 sm:right-4 top-2 text-gray-500 pointer-events-none">
                <FontAwesomeIcon icon={faSearch} />
              </span>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4 sm:gap-6 text-gray-600 shrink-0">
            {isLoggedIn ? (
              <>
                <NotificationDropdown />

                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="hover:opacity-80 transition-opacity flex items-center focus:outline-none relative"
                  >
                    {userProfile && userProfile.avatarUrl ? (
                      <img
                        src={userProfile.avatarUrl}
                        alt="User Avatar"
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-slate-200 shadow-sm"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faUserCircle}
                        className="text-3xl text-slate-700"
                      />
                    )}

                    {/* <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white">
                      <span className="absolute inline-flex w-full h-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                    </span> */}
                  </button>

                  {isDropdownOpen && (
                    <div
                      className="fixed inset-0 z-40 md:hidden"
                      onClick={() => setIsDropdownOpen(false)}
                    ></div>
                  )}

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 transition-all origin-top-right animate-fade-slide-up">

                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FontAwesomeIcon
                          icon={faUser}
                          className="w-4 h-4 text-slate-400"
                        />{" "}
                        My Profile
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
                        Settings
                      </Link>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left focus:outline-none"
                      >
                        <FontAwesomeIcon
                          icon={faArrowRightFromBracket}
                          className="w-4 h-4"
                        />{" "}
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  state={{ from: location.pathname }}
                  className="inline-flex items-center gap-2 rounded-lg border border-blue-700 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  <FontAwesomeIcon icon={faRightToBracket} />
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
                >
                  Create account
                </Link>
              </div>
            )}
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
