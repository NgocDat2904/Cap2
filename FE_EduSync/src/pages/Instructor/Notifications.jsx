import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCheckDouble,
  faCommentDots,
  faBullhorn,
  faBookOpen,
  faUserPlus,
  faCircle,
  faTrashCan,
  faFilter,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { getNotificationsAPI, markNotificationReadAPI, deleteNotificationAPI } from "../../services/notificationAPI";

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

// Helper format full date and time
const formatFullDateTime = (isoDateString) => {
  if (!isoDateString) return "";
  try {
    const date = new Date(isoDateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return "";
  }
};

const InstructorNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =========================================================================
  // FETCH NOTIFICATIONS FROM API
  // =========================================================================
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/instructor/login");
          return;
        }

        const data = await getNotificationsAPI(token);
        setNotifications(data || []);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setError(err.message || "Không thể tải danh sách thông báo");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [navigate]);

  // =========================================================================
  // LOGIC XỬ LÝ
  // =========================================================================
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "all") return true;
    if (filterType === "unread") return !n.is_read;
    return n.type === filterType;
  });

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        await markNotificationReadAPI(id, token);
        // Cập nhật local state
        setNotifications(
          notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      // Gọi API đánh dấu đọc từng thông báo chưa đọc
      const unreadNotifs = notifications.filter((n) => !n.is_read);
      for (const notif of unreadNotifs) {
        await markNotificationReadAPI(notif.id, token);
      }

      // Cập nhật local state
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Xác nhận: Bạn có chắc chắn muốn xóa thông báo này khỏi hộp thư?")) {
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          await deleteNotificationAPI(id, token);
          // Cập nhật local state
          setNotifications(notifications.filter((n) => n.id !== id));
        }
      } catch (err) {
        console.error("Failed to delete notification:", err);
        alert("Không thể xóa thông báo. Vui lòng thử lại.");
      }
    }
  };

  const renderNotificationIcon = (type) => {
    switch (type) {
      case "qa":
      case "qna":
        return (
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-xl">
            <FontAwesomeIcon icon={faCommentDots} />
          </div>
        );
      case "course_approved":
      case "approval":
        return (
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xl">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
        );
      case "course_rejected":
      case "rejection":
        return (
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-xl">
            <FontAwesomeIcon icon={faTimesCircle} />
          </div>
        );
      case "system":
        return (
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 text-xl">
            <FontAwesomeIcon icon={faBullhorn} />
          </div>
        );
      case "new_enroll":
        return (
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xl">
            <FontAwesomeIcon icon={faUserPlus} />
          </div>
        );
      case "course_update":
        return (
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-xl">
            <FontAwesomeIcon icon={faBookOpen} />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 text-xl">
            <FontAwesomeIcon icon={faBell} />
          </div>
        );
    }
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);

    // Điều hướng dựa trên type
    if ((notif.type === "qa" || notif.type === "qna") && notif.course_id) {
      navigate(`/instructor/courses/${notif.course_id}`, { state: { activeTab: "qa" } });
    } else if ((notif.type === "course_approved" || notif.type === "approval") && notif.course_id) {
      navigate(`/instructor/courses/${notif.course_id}`);
    } else if ((notif.type === "course_rejected" || notif.type === "rejection") && notif.course_id) {
      navigate(`/instructor/courses/${notif.course_id}/edit`, {
        state: {
          notificationType: "rejected",
          showRejectionReason: true,
          rejectionReason: notif.rejection_reason
        }
      });
    } else if (notif.type === "new_enroll" && notif.course_id) {
      navigate(`/instructor/courses/${notif.course_id}`, {
        state: { activeTab: "students", highlightNewStudent: notif.student_id }
      });
    } else if (notif.course_id) {
      navigate(`/instructor/courses/${notif.course_id}`);
    }
  };

  return (
    <div className="animate-fade-slide-up max-w-4xl mx-auto w-full pb-20">
      {/* HEADER TRANG */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FontAwesomeIcon icon={faBell} className="text-blue-600" />
            Hộp thư thông báo
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Cập nhật những tin tức mới nhất từ học viên và hệ thống EduSync.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition shadow-sm flex items-center gap-2 active:scale-95"
          >
            <FontAwesomeIcon icon={faCheckDouble} className="text-blue-600" />
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* BỐ CỤC CHÍNH */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* CỘT TRÁI: BỘ LỌC */}
        <div className="w-full md:w-64 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100 p-6 shrink-0">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faFilter} /> Lọc thông báo
          </h3>
          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto scrollbar-hide">
            {[
              { id: "all", label: "Tất cả", count: notifications.length },
              {
                id: "unread",
                label: "Chưa đọc",
                count: unreadCount,
                isRed: true,
              },
              { id: "qa", label: "Câu hỏi học viên" },
              { id: "new_enroll", label: "Học viên mới" },
              { id: "approval", label: "Phê duyệt khóa học" },
              { id: "system", label: "Hệ thống" },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors whitespace-nowrap md:whitespace-normal ${
                  filterType === filter.id
                    ? "bg-blue-100 text-blue-700 shadow-sm shadow-blue-200/50"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{filter.label}</span>
                {filter.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] ${filter.isRed && filter.count > 0 ? "bg-red-500 text-white" : "bg-slate-200 text-slate-600"}`}
                  >
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: DANH SÁCH THÔNG BÁO */}
        <div className="flex-1 min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-20">
              <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-blue-500 mb-4" />
              <p className="text-slate-500 font-semibold">Đang tải thông báo...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full py-20 px-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500 text-2xl">
                <FontAwesomeIcon icon={faBell} />
              </div>
              <p className="text-red-600 font-bold mb-2">Không thể tải thông báo</p>
              <p className="text-slate-500 text-sm">{error}</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group p-5 sm:p-6 flex gap-4 sm:gap-5 cursor-pointer transition-all ${
                    !notif.is_read
                      ? "bg-blue-50/40 hover:bg-blue-50/80"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  {renderNotificationIcon(notif.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4
                        className={`text-base sm:text-lg pr-6 relative ${!notif.is_read ? "font-black text-slate-900" : "font-bold text-slate-700"}`}
                      >
                        {notif.title}
                        {!notif.is_read && (
                          <FontAwesomeIcon
                            icon={faCircle}
                            className="absolute -right-1 top-2 text-[8px] text-blue-600"
                          />
                        )}
                      </h4>

                      <button
                        onClick={(e) => deleteNotification(e, notif.id)}
                        className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors shrink-0 opacity-100 sm:opacity-0 group-hover:opacity-100"
                        title="Xóa thông báo này"
                      >
                        <FontAwesomeIcon
                          icon={faTrashCan}
                          className="text-sm"
                        />
                      </button>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-3">
                      {notif.message}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-400">
                          {formatFullDateTime(notif.created_at)}
                        </span>
                        <span className="text-blue-600 font-semibold">
                          • {formatNotificationTime(notif.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // TRẠNG THÁI TRỐNG (EMPTY STATE)
            <div className="flex flex-col items-center justify-center h-full py-20 px-4 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner text-slate-300 text-4xl">
                <FontAwesomeIcon icon={faBell} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                Không có thông báo nào
              </h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                Hộp thư của bạn hiện đang trống. Các thông báo cập nhật từ hệ thống hoặc học viên sẽ xuất hiện tại đây.
              </p>
            </div>
          )}

          {/* PHÂN TRANG */}
          {filteredNotifications.length > 0 && (
            <div className="p-6 border-t border-slate-100 text-center bg-slate-50/50">
              <button className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition shadow-sm">
                Tải thêm thông báo cũ hơn...
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorNotifications;
