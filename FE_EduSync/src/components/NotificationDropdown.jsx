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
} from "@fortawesome/free-solid-svg-icons";

// =========================================================================
// MOCK DATA: 4 LOẠI THÔNG BÁO CHO LEARNER
// =========================================================================
const initialNotifications = [
  {
    id: 1,
    type: "qa", // Tương tác Q&A
    title: "Giảng viên đã trả lời bạn",
    content:
      "Thầy Trần Việt Anh đã trả lời câu hỏi của bạn trong bài 'React Hooks'.",
    time: "10 phút trước",
    isRead: false,
    link: "/course/reactjs/lesson-5",
  },
  {
    id: 2,
    type: "system", // Admin gửi
    title: "Cấp quyền khóa học mới",
    content:
      "Admin Trung tâm vừa cấp cho bạn quyền truy cập khóa 'Kỹ năng mềm 101'.",
    time: "2 giờ trước",
    isRead: false,
    link: "/course/soft-skills",
  },
  {
    id: 3,
    type: "course_update", // Cập nhật khóa học
    title: "Bài giảng mới được thêm",
    content: "Khóa học 'Java Backend' vừa cập nhật thêm 2 video thực hành API.",
    time: "Hôm qua",
    isRead: true,
    link: "/course/java-backend",
  },
  {
    id: 4,
    type: "gamification", // Động lực/Nhắc nhở
    title: "Đừng bỏ cuộc nhé! 🔥",
    content:
      "Đã 3 ngày bạn chưa vào học. Tiếp tục bài học đang dang dở ngay thôi!",
    time: "3 ngày trước",
    isRead: true,
    link: "/dashboard",
  },
];

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all' hoặc 'unread'
  const [notifications, setNotifications] = useState(initialNotifications);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Đếm số thông báo chưa đọc
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Lọc thông báo theo Tab
  const displayedNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => !n.isRead);

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

  // Xử lý Đánh dấu đã đọc 1 thông báo
  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  // Xử lý Đánh dấu đọc tất cả
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  // Render Icon tùy theo loại thông báo
  const renderNotificationIcon = (type) => {
    switch (type) {
      case "qa":
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faCommentDots} />
          </div>
        );
      case "system":
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faBullhorn} />
          </div>
        );
      case "course_update":
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faBookOpen} />
          </div>
        );
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
      {/* 1. NÚT CHUÔNG (BEL ICON) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-blue-600 transition-colors flex items-center justify-center"
      >
        <FontAwesomeIcon icon={faBell} className="text-lg" />

        {/* Chấm đỏ báo Unread (Chỉ hiện khi có thông báo chưa đọc) */}
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
                <FontAwesomeIcon icon={faCheckDouble} /> Đã đọc tất cả
              </button>
            )}
          </div>

          {/* Thanh Tabs (Tất cả / Chưa đọc) */}
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
                    // navigate(notif.link); // Chuyển hướng khi click (Cần import useNavigate)
                    setIsOpen(false);
                  }}
                  className={`p-4 border-b border-slate-50 flex gap-3 cursor-pointer transition-colors hover:bg-slate-50 relative ${
                    !notif.isRead ? "bg-blue-50/30" : "bg-white"
                  }`}
                >
                  {/* Icon loại thông báo */}
                  {renderNotificationIcon(notif.type)}

                  {/* Nội dung */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${!notif.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}
                    >
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {notif.content}
                    </p>
                    <p
                      className={`text-[11px] font-bold mt-2 ${!notif.isRead ? "text-blue-600" : "text-slate-400"}`}
                    >
                      {notif.time}
                    </p>
                  </div>

                  {/* Chấm xanh báo chưa đọc ở góc phải */}
                  {!notif.isRead && (
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
              // Trạng thái Trống (Empty State)
              <div className="py-12 px-4 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300 text-2xl">
                  <FontAwesomeIcon icon={faBell} />
                </div>
                <p className="text-sm font-bold text-slate-600">
                  Bạn không có thông báo nào!
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Khi có cập nhật mới, chúng sẽ xuất hiện ở đây.
                </p>
              </div>
            )}
          </div>

          {/* Footer - Nút xem tất cả */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/notifications");
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

export default NotificationDropdown;
