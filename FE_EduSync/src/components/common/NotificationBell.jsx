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
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

import { getNotificationsAPI, markNotificationReadAPI, deleteNotificationAPI } from "../../services/notificationAPI";
import { jwtDecode } from "jwt-decode";

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

// =========================================================================
// HELPER: Nội dung thông báo thông minh với chi tiết đầy đủ
// =========================================================================
const formatNotificationText = (notification) => {
  const {
    type,
    title,
    message,
    course_name,
    lesson_name,
    lesson_title,
    instructor_name,
    student_name,
    question_content
  } = notification;

  // Lấy tên thật từ API với fallback mượt mà
  const courseName = course_name || notification.course_title || "này";
  const lessonName = lesson_name || lesson_title || notification.title || "gần đây";
  const instructorFullName = instructor_name || "giảng viên";
  const studentFullName = student_name || "Một học viên";

  // Luôn tạo nội dung tiếng Việt chi tiết dựa trên type và context
  switch (type) {
    case "question_reply":
    case "qna_reply": {
      // Tạo message mượt mà với hoặc không có tên cụ thể
      const instructorPart = instructor_name ? instructor_name : "giảng viên";
      const lessonPart = lesson_name || lesson_title ? `tại bài học "${lessonName}"` : "trong một bài học";
      const coursePart = course_name ? ` thuộc khóa học "${courseName}"` : "";

      return {
        title: "💬 Phản hồi mới từ Giảng viên",
        message: `${instructorPart} đã trả lời bình luận của bạn ${lessonPart}${coursePart}. Nhấn để xem chi tiết.`,
      };
    }

    case "qa":
    case "qna": {
      const lessonPart = lesson_name || lesson_title ? `tại bài học "${lessonName}"` : "";
      const coursePart = course_name ? ` trong khóa học "${courseName}"` : "";

      return {
        title: "💬 Có câu hỏi mới",
        message: `${studentFullName} vừa đặt câu hỏi ${lessonPart}${coursePart}. Hãy phản hồi để hỗ trợ họ.`,
      };
    }

    case "course_approved":
    case "approval": {
      const coursePart = course_name ? `Khóa học "${courseName}"` : "Khóa học của bạn";
      return {
        title: "✅ Khóa học đã được duyệt!",
        message: `Chúc mừng! ${coursePart} đã được phê duyệt và đang được xuất bản trên hệ thống. Học viên giờ có thể tìm thấy và đăng ký.`,
      };
    }

    case "course_rejected":
    case "rejection": {
      const coursePart = course_name ? `Khóa học "${courseName}"` : "Khóa học của bạn";
      const reason = notification.rejection_reason || "chưa đáp ứng yêu cầu";
      return {
        title: "❌ Khóa học cần chỉnh sửa",
        message: `${coursePart} ${reason}. Vui lòng xem chi tiết phản hồi và chỉnh sửa lại để gửi phê duyệt.`,
      };
    }

    case "new_course": {
      const coursePart = course_name ? `"${courseName}"` : "Khóa học mới";
      const instructorPart = instructor_name ? ` bởi ${instructorFullName}` : "";
      return {
        title: "🎉 Khóa học mới ra mắt!",
        message: `${coursePart}${instructorPart} vừa được thêm vào danh mục. Khám phá ngay để không bỏ lỡ kiến thức mới.`,
      };
    }

    case "new_enroll": {
      const coursePart = course_name ? ` khóa học "${courseName}"` : " khóa học của bạn";
      return {
        title: "Có học viên mới ghi danh",
        message: `${studentFullName} vừa đăng ký học${coursePart}. Chào đón và hỗ trợ họ trong hành trình học tập nhé!`,
      };
    }

    case "course_update": {
      const coursePart = course_name ? `Khóa học "${courseName}"` : "Khóa học bạn đang theo dõi";
      return {
        title: "📢 Khóa học được cập nhật",
        message: `${coursePart} vừa có nội dung mới hoặc cập nhật quan trọng. Hãy xem thử để không bỏ lỡ nhé!`,
      };
    }

    case "achievement":
      return {
        title: "🏆 Bạn đạt thành tích mới!",
        message: "Chúc mừng! Bạn vừa hoàn thành một cột mốc quan trọng trong hành trình học tập.",
      };

    case "gamification":
      return {
        title: "⭐ Phần thưởng mới!",
        message: "Bạn vừa nhận được huy hiệu hoặc điểm thưởng. Xem ngay trong hồ sơ của bạn.",
      };

    case "system":
      return {
        title: "🔔 Thông báo hệ thống",
        message: "EduSync có thông báo quan trọng dành cho bạn. Vui lòng kiểm tra.",
      };

    case "payment_success":
      return {
        title: "💳 Thanh toán thành công!",
        message: "Giao dịch của bạn đã được xử lý. Giờ bạn có thể truy cập khóa học đã mua.",
      };

    case "payment_failed":
      return {
        title: "⚠️ Thanh toán thất bại",
        message: "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
      };

    case "reminder":
      return {
        title: "⏰ Nhắc nhở học tập",
        message: "Đã lâu bạn chưa học bài! Hãy tiếp tục hành trình của mình nhé.",
      };

    default:
      // Nếu không match type nào, trả về placeholder tiếng Việt
      return {
        title: "📬 Thông báo mới",
        message: "Bạn có một thông báo mới từ EduSync. Nhấn để xem chi tiết.",
      };
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

  // Gọi API lấy thông báo khi component mount (để hiển thị badge)
  // và refresh khi mở dropdown
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

    // Fetch ngay khi mount để hiển thị badge
    fetchNotifs();

    // Refresh mỗi 60 giây để cập nhật real-time
    const interval = setInterval(fetchNotifs, 60000);

    return () => clearInterval(interval);
  }, []);

  // Refresh lại khi mở dropdown để đảm bảo dữ liệu mới nhất
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

  // Lấy role của user hiện tại
  const getUserRole = () => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        const decoded = jwtDecode(token);
        return decoded.role || "learner";
      }
    } catch (error) {
      console.error("Lỗi decode token:", error);
    }
    return "learner";
  };

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

  // Xử lý Xóa thông báo
  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) {
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          await deleteNotificationAPI(notificationId, token);
          // Cập nhật local state
          setNotifications(notifications.filter((n) => n.id !== notificationId));
        }
      } catch (e) {
        console.error("Lỗi hệ thống: Không thể xóa thông báo.");
      }
    }
  };

  // Xử lý click vào thông báo với điều hướng chính xác (Deep Linking)
  const handleNotificationClick = async (notification) => {
    const userRole = getUserRole();

    // B1: Đánh dấu đã đọc nếu chưa đọc
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // B2: Đóng dropdown
    setIsOpen(false);

    // B3: Điều hướng dựa trên type và role với deep linking chính xác
    const { type, course_id, question_id, lesson_id, url } = notification;

    // 1. Thông báo Q&A / Reply - Deep linking với scrollToQuestionId
    if (type === "question_reply" || type === "qna_reply" || type === "qa" || type === "qna") {
      if (userRole === "instructor" && course_id) {
        // Instructor: đến trang quản lý khóa học với tab Q&A
        // Nếu có lesson_id, điều hướng đến chi tiết lesson với question highlight
        if (lesson_id && question_id) {
          navigate(`/instructor/courses/${course_id}`, {
            state: {
              activeTab: "qa",
              scrollToQuestionId: question_id,
              lessonId: lesson_id
            }
          });
        } else {
          navigate(`/instructor/courses/${course_id}`, { state: { activeTab: "qa" } });
        }
      } else if (userRole === "learner" && course_id) {
        // Learner: điều hướng đến workspace học tập với scroll to question
        if (lesson_id) {
          // Deep linking: truyền question_id qua state để tự động scroll
          navigate(`/courses/${course_id}/lessons/${lesson_id}`, {
            state: {
              activeLeftTab: "q&a",
              scrollToQuestionId: question_id,
              highlightQuestion: true
            }
          });
        } else {
          // Fallback: chỉ có course_id, chuyển đến trang khóa học
          navigate(`/courses/${course_id}`, { state: { activeLeftTab: "q&a" } });
        }
      }
      return;
    }

    // 2. Thông báo phê duyệt khóa học (Instructor)
    if (type === "course_approved" || type === "approval") {
      if (userRole === "instructor" && course_id) {
        // Instructor: xem chi tiết khóa học đã được duyệt
        navigate(`/instructor/courses/${course_id}`, {
          state: { notificationType: "approved" }
        });
      } else if (userRole === "learner" && course_id) {
        // Learner: xem khóa học mới được publish
        navigate(`/courses/${course_id}`);
      }
      return;
    }

    // 3. Thông báo từ chối khóa học (Instructor)
    if (type === "course_rejected" || type === "rejection") {
      if (userRole === "instructor" && course_id) {
        // Instructor: đến trang edit để sửa với highlight rejection reason
        navigate(`/instructor/courses/${course_id}/edit`, {
          state: {
            notificationType: "rejected",
            showRejectionReason: true,
            rejectionReason: notification.rejection_reason
          }
        });
      }
      return;
    }

    // 4. Khóa học mới / Enrollment / Update
    if (type === "new_course" || type === "new_enroll" || type === "course_update") {
      if (course_id) {
        if (userRole === "instructor") {
          // Instructor: xem students nếu là new_enroll
          if (type === "new_enroll") {
            navigate(`/instructor/courses/${course_id}`, {
              state: { activeTab: "students", highlightNewStudent: notification.student_id }
            });
          } else {
            navigate(`/instructor/courses/${course_id}`);
          }
        } else {
          // Learner: xem chi tiết khóa học
          navigate(`/courses/${course_id}`);
        }
      }
      return;
    }

    // 5. Achievement / Gamification
    if (type === "achievement" || type === "gamification") {
      if (userRole === "learner") {
        // Điều hướng đến profile với tab achievements
        navigate("/profile", {
          state: {
            activeTab: "achievements",
            highlightAchievement: notification.achievement_id
          }
        });
      }
      return;
    }

    // 6. Payment Success
    if (type === "payment_success") {
      if (course_id) {
        // Chuyển đến khóa học vừa mua
        navigate(`/courses/${course_id}`, {
          state: { showWelcomeMessage: true }
        });
      } else {
        navigate("/my-courses");
      }
      return;
    }

    // 7. Payment Failed
    if (type === "payment_failed") {
      if (course_id) {
        // Quay lại trang checkout
        navigate(`/courses/${course_id}`, {
          state: { showPaymentError: true }
        });
      }
      return;
    }

    // 8. System notification
    if (type === "system") {
      // Có thể điều hướng đến trang thông báo đầy đủ hoặc URL custom
      if (url) {
        navigate(url);
      } else {
        navigate(notificationsPageUrl);
      }
      return;
    }

    // 9. Fallback: nếu có URL tùy chỉnh
    if (url) {
      navigate(url);
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
              displayedNotifications.map((notif) => {
                const { title, message } = formatNotificationText(notif);

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`group p-4 border-b border-slate-50 flex gap-3 cursor-pointer transition-all hover:bg-blue-50/50 hover:shadow-sm active:bg-blue-100/50 relative ${
                      !notif.is_read ? "bg-blue-50/30" : "bg-white"
                    }`}
                  >
                    {/* Icon loại thông báo */}
                    {renderNotificationIcon(notif.type)}

                    {/* Nội dung */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p
                          className={`text-sm ${!notif.is_read ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}
                        >
                          {title}
                        </p>
                        <button
                          onClick={(e) => handleDeleteNotification(e, notif.id)}
                          className="w-6 h-6 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                          title="Xóa thông báo"
                        >
                          <FontAwesomeIcon icon={faTrashCan} className="text-xs" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {message}
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
                );
              })
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
