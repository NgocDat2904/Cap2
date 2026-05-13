import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import {
  faBell,
  faCheckDouble,
  faCommentDots,
  faBullhorn,
  faBookOpen,
  faTrophy,
  faCircle,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

import { getNotificationsAPI, markNotificationReadAPI } from "../../services/notificationAPI";

// =========================================================================
// HELPER: Format thời gian thông báo
// =========================================================================
const formatNotificationTime = (isoDateString) => {
  if (!isoDateString) return "Vừa xong";
  try {
    const date = new Date(isoDateString);
    if (isNaN(date)) return "Vừa xong";

    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMs / 3600000);
    const diffD = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffH < 24) return `${diffH} giờ trước`;
    if (diffD === 1) return "Hôm qua";
    if (diffD < 7) return `${diffD} ngày trước`;
    if (diffD < 30) return `${Math.floor(diffD / 7)} tuần trước`;
    return `${Math.floor(diffD / 30)} tháng trước`;
  } catch {
    return "Vừa xong";
  }
};

/**
 * NotificationBell Component - Shared notification dropdown for all roles
 * @param {string} notificationsPageUrl - URL to full notifications page (e.g., "/notifications", "/admin/notifications")
 */
const NotificationBell = ({ notificationsPageUrl = "/notifications" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Đếm số thông báo chưa đọc (API trả về is_read)
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Lọc thông báo theo Tab (API trả về is_read)
  const displayedNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => !n.is_read);

  // Xử lý Click ra ngoài để đóng Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Gọi API lấy thông báo
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          const data = await getNotificationsAPI(token);
          setNotifications(data || []);
        }
      } catch (error) {
        console.error("Lỗi truy xuất danh sách thông báo:", error);
      }
    };
    if (isOpen) fetchNotifs();
  }, [isOpen]);

  // Xử lý Đánh dấu đã đọc 1 thông báo
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        await markNotificationReadAPI(id, token);

        // Cập nhật local state (API trả về is_read)
        setNotifications(
          notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      }
    } catch (e) {
      console.error("Lỗi hệ thống: Không thể cập nhật trạng thái thông báo.");
    }
  };

  // Xử lý Đánh dấu đọc tất cả
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token");

      // Gọi API đánh dấu đọc từng thông báo chưa đọc
      const unreadNotifs = notifications.filter((n) => !n.is_read);
      for (const notif of unreadNotifs) {
        await markNotificationReadAPI(notif.id, token);
      }

      // Cập nhật local state
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error("Lỗi hệ thống: Không thể cập nhật trạng thái thông báo.");
    }
  };

  // Render Icon tùy theo loại thông báo (theo API: type = "question_reply", "course_approved", etc.)
  const renderNotificationIcon = (type) => {
    switch (type) {
      case "question_reply":
      case "qna_reply":
      case "qa":
      case "qna":
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faCommentDots} />
          </div>
        );
      case "course_approved":
      case "approval":
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
        );
      case "course_rejected":
      case "rejection":
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faTimesCircle} />
          </div>
        );
      case "system":
        return (
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faBullhorn} />
          </div>
        );
      case "new_course":
      case "new_enroll":
      case "course_update":
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faBookOpen} />
          </div>
        );
      case "achievement":
      case "gamification":
        return (
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faTrophy} />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faBell} />
          </div>
        );
    }
  };

  return (
    <div className="relative inline-block font-sans" ref={dropdownRef}>
      {/* 1. NÚT CHUÔNG */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-blue-600 transition-colors flex items-center justify-center"
      >
        <FontAwesomeIcon icon={faBell} className="text-lg" />

        {/* Chấm đỏ báo Chưa đọc */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-black text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* 2. KHUNG THẢ XUỐNG (DROPDOWN PANEL) */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-slide-up">
          {/* Header của Dropdown */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-extrabold text-slate-800 text-lg">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5"
                title="Đánh dấu tất cả đã đọc"
              >
                <FontAwesomeIcon icon={faCheckDouble} /> Đánh dấu đã đọc
              </button>
            )}
          </div>

          {/* Thanh Tabs */}
          <div className="flex border-b border-slate-100 px-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-2.5 text-sm font-bold border-b-2 transition-colors ${
                activeTab === "all"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`flex-1 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === "unread"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Chưa đọc{" "}
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded-md text-[10px]">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Danh sách thông báo */}
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
            {displayedNotifications.length > 0 ? (
              displayedNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markAsRead(notif.id);
                    setIsOpen(false);
                    // Điều hướng theo type (API trả về: question_reply, course_approved, etc.)
                    if (notif.type === "question_reply" || notif.type === "qna_reply") {
                      // Nếu có question_id, điều hướng đến trang Q&A của lesson
                      if (notif.course_id && notif.question_id) {
                        navigate(`/courses/${notif.course_id}`, { state: { activeLeftTab: "q&a" } });
                      }
                    } else if (notif.type === "new_course" || notif.type === "new_enroll" || notif.type === "course_approved") {
                      if (notif.course_id) {
                        navigate(`/courses/${notif.course_id}`);
                      }
                    } else if (notif.url) {
                      navigate(notif.url);
                    }
                  }}
                  className={`p-4 border-b border-slate-50 flex gap-3 cursor-pointer transition-colors hover:bg-slate-50 relative ${
                    !notif.is_read ? "bg-blue-50/30" : "bg-white"
                  }`}
                >
                  {/* Icon loại thông báo */}
                  {renderNotificationIcon(notif.type)}

                  {/* Nội dung */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${!notif.is_read ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}
                    >
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <p
                      className={`text-[11px] font-bold mt-2 ${!notif.is_read ? "text-blue-600" : "text-slate-400"}`}
                    >
                      {formatNotificationTime(notif.created_at)}
                    </p>
                  </div>

                  {/* Chấm xanh báo chưa đọc */}
                  {!notif.is_read && (
                    <div className="flex items-center justify-center shrink-0 w-3">
                      <FontAwesomeIcon
                        icon={faCircle}
                        className="text-[8px] text-blue-600"
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 px-4 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300 text-2xl">
                  <FontAwesomeIcon icon={faBell} />
                </div>
                <p className="text-sm font-bold text-slate-600">
                  Hộp thư trống
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Các thông báo mới từ hệ thống sẽ xuất hiện tại đây.
                </p>
              </div>
            )}
          </div>

          {/* Footer - Nút xem tất cả */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(notificationsPageUrl);
              }}
              className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors w-full"
            >
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
