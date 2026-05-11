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
  faCheckCircle,
  faCommentDots,
  faBullhorn,
  faTimesCircle,
  faCheckDouble
} from "@fortawesome/free-solid-svg-icons";

// =========================================================================
// MOCK DATA: Giả lập danh sách thông báo
// =========================================================================
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "approval", // course_approved
    title: "Course Approved! 🎉",
    message: 'Your course "Master ReactJS 2026" has been approved and published by the Admin.',
    timeAgo: "10 mins ago",
    isRead: false,
  },
  {
    id: 2,
    type: "qna", // learner_question
    title: "New Q&A Question",
    message: 'Hoang Nguyen asked a question in the lesson "JSX and Rendering Elements".',
    timeAgo: "2 hours ago",
    isRead: false,
  },
  {
    id: 3,
    type: "system", // system_alert
    title: "Scheduled Maintenance",
    message: "EduSync will undergo a brief system maintenance this Sunday at 2:00 AM UTC.",
    timeAgo: "1 day ago",
    isRead: true,
  },
  {
    id: 4,
    type: "rejection", // course_rejected
    title: "Course Revision Required",
    message: 'Your course "Advanced Python" requires changes before approval. Please check feedback.',
    timeAgo: "2 days ago",
    isRead: true,
  }
];

const InstructorLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 1. STATE LƯU THÔNG TIN PROFILE CỦA GIẢNG VIÊN
  const [instructorProfile, setInstructorProfile] = useState({
    fullName: "",
    role: "",
    avatarUrl: "",
  });

  // 2. STATE CHO THÔNG BÁO (NOTIFICATIONS)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // =========================================================================
  // GỌI API LẤY THÔNG TIN GIẢNG VIÊN KHI MỞ TRANG
  // =========================================================================
  useEffect(() => {
    const fetchInstructorProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const data = await getInstructorProfileAPI(token);
        setInstructorProfile(data);
      } catch (error) {
        console.error("Error loading instructor profile from Layout:", error);
      }
    };
    fetchInstructorProfile();
  }, []);
  
  // =========================================================================
  // XỬ LÝ CLICK OUTSIDE ĐỂ ĐÓNG DROPDOWN THÔNG BÁO
  // =========================================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    { name: "Account", icon: faUser, path: "/instructor/account" },
    { name: "Settings", icon: faGear, path: "/instructor/settings" },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    handleLinkClick();

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
      navigate("/instructor/login");
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  // Hàm render Icon cho từng loại thông báo
  const renderNotifIcon = (type) => {
    switch (type) {
      case "approval":
        return <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><FontAwesomeIcon icon={faCheckCircle} /></div>;
      case "qna":
        return <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><FontAwesomeIcon icon={faCommentDots} /></div>;
      case "system":
        return <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><FontAwesomeIcon icon={faBullhorn} /></div>;
      case "rejection":
        return <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0"><FontAwesomeIcon icon={faTimesCircle} /></div>;
      default:
        return <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0"><FontAwesomeIcon icon={faBell} /></div>;
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
              title={!isSidebarOpen ? "Sign out" : ""}
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
                Sign out
              </span>
            </button>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        
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
                placeholder="Search courses, learners..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-100 border-transparent focus:bg-white focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium transition-all text-slate-700"
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-3.5 text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5 ml-4">
            
            {/* ✅ KHU VỰC THÔNG BÁO (NOTIFICATION DROPDOWN) */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`text-slate-400 hover:text-blue-600 hover:bg-blue-50 w-10 h-10 rounded-xl relative transition-all flex items-center justify-center ${isNotifOpen ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                <FontAwesomeIcon icon={faBell} className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {/* DROPDOWN MENU */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-[320px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-slide-up origin-top-right">
                  {/* Dropdown Header */}
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-extrabold text-slate-800 text-base">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5"
                      >
                        <FontAwesomeIcon icon={faCheckDouble} />
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Dropdown Body (List) */}
                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                    {notifications.length > 0 ? (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-4 flex gap-4 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                          onClick={() => {
                            // Logic mark read từng cái (nếu cần)
                            setNotifications(notifications.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                          }}
                        >
                          {renderNotifIcon(notif.type)}
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm mb-0.5 truncate ${!notif.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                              {notif.title}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-1.5">
                              {notif.message}
                            </p>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {notif.timeAgo}
                            </span>
                          </div>
                          {!notif.isRead && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5"></div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                        <FontAwesomeIcon icon={faBell} className="text-3xl text-slate-300" />
                        <p className="text-sm font-medium">You have no notifications.</p>
                      </div>
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                    <button className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors w-full py-1">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>

            <button
              onClick={() => navigate("/instructor/account")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              {/* BINDING DỮ LIỆU STATE VÀO GIAO DIỆN Ở ĐÂY */}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">
                  {instructorProfile.fullName ||
                    instructorProfile.full_name ||
                    instructorProfile.name ||
                    "Instructor"}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {instructorProfile.role || "Instructor"}
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto relative">
          <Outlet />
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
};

export default InstructorLayout;