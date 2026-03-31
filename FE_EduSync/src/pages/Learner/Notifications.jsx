import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCheckDouble,
  faCommentDots,
  faBullhorn,
  faBookOpen,
  faTrophy,
  faCircle,
  faTrashCan,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";

// =========================================================================
// MOCK DATA: DANH SÁCH THÔNG BÁO ĐẦY ĐỦ
// =========================================================================
const initialNotifications = [
  {
    id: 1,
    type: "qa",
    title: "Giảng viên đã trả lời bình luận của bạn",
    content:
      "Thầy Trần Việt Anh đã trả lời câu hỏi của bạn trong bài 'React Hooks cơ bản'. Hãy vào xem ngay!",
    time: "10 phút trước",
    date: "27/03/2026",
    isRead: false,
    link: "/course/reactjs/lesson-5",
  },
  {
    id: 2,
    type: "system",
    title: "Cấp quyền khóa học mới thành công",
    content:
      "Admin Trung tâm vừa cấp cho bạn quyền truy cập khóa 'Kỹ năng mềm 101'. Chúc bạn học tập thật tốt!",
    time: "2 giờ trước",
    date: "27/03/2026",
    isRead: false,
    link: "/course/soft-skills",
  },
  {
    id: 3,
    type: "course_update",
    title: "Bài giảng mới vừa được thêm vào",
    content:
      "Khóa học 'Java Backend' vừa cập nhật thêm 2 video thực hành API. Tiến độ của bạn đã bị lùi lại, hãy vào học bù nhé.",
    time: "Hôm qua lúc 15:30",
    date: "26/03/2026",
    isRead: true,
    link: "/course/java-backend",
  },
  {
    id: 4,
    type: "gamification",
    title: "Đừng bỏ cuộc nhé! Hào quang đang chờ đón 🔥",
    content:
      "Đã 3 ngày bạn chưa vào hệ thống học tập. Tiếp tục bài học đang dang dở ngay thôi nào!",
    time: "3 ngày trước",
    date: "24/03/2026",
    isRead: true,
    link: "/dashboard",
  },
  {
    id: 5,
    type: "system",
    title: "Thông báo bảo trì hệ thống định kỳ",
    content:
      "Hệ thống EduSync sẽ tiến hành bảo trì nâng cấp máy chủ từ 23h00 ngày 28/03 đến 02h00 ngày 29/03. Vui lòng sắp xếp thời gian học hợp lý.",
    time: "1 tuần trước",
    date: "20/03/2026",
    isRead: true,
    link: "#",
  },
];

const LearnerNotifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filterType, setFilterType] = useState("all"); // all, unread, qa, system, course_update

  // =========================================================================
  // LOGIC XỬ LÝ
  // =========================================================================
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === "all") return true;
    if (filterType === "unread") return !n.isRead;
    return n.type === filterType;
  });

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (e, id) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra thẻ div ngoài (tránh bị nhảy link)
    if (window.confirm("Bạn có chắc chắn muốn xóa thông báo này?")) {
      setNotifications(notifications.filter((n) => n.id !== id));
    }
  };

  // Render Icon tùy theo loại thông báo
  const renderNotificationIcon = (type) => {
    switch (type) {
      case "qa":
        return (
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-xl">
            <FontAwesomeIcon icon={faCommentDots} />
          </div>
        );
      case "system":
        return (
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 text-xl">
            <FontAwesomeIcon icon={faBullhorn} />
          </div>
        );
      case "course_update":
        return (
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xl">
            <FontAwesomeIcon icon={faBookOpen} />
          </div>
        );
      case "gamification":
        return (
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 text-xl">
            <FontAwesomeIcon icon={faTrophy} />
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

  return (
    <div className="animate-fade-slide-up max-w-4xl mx-auto w-full pb-20">
      {/* HEADER TRANG */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FontAwesomeIcon icon={faBell} className="text-blue-600" />
            Tất cả thông báo
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Cập nhật những tin tức mới nhất từ giảng viên và hệ thống EduSync.
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
        {/* CỘT TRÁI: BỘ LỌC (SIDEBAR) */}
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
              { id: "qa", label: "Hỏi & Đáp (Q&A)" },
              { id: "course_update", label: "Cập nhật khóa học" },
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
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-5 sm:p-6 flex gap-4 sm:gap-5 cursor-pointer transition-all group ${
                    !notif.isRead
                      ? "bg-blue-50/40 hover:bg-blue-50/80"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  {/* Icon loại thông báo */}
                  {renderNotificationIcon(notif.type)}

                  {/* Nội dung */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <h4
                        className={`text-base sm:text-lg mb-1 pr-6 relative ${!notif.isRead ? "font-black text-slate-900" : "font-bold text-slate-700"}`}
                      >
                        {notif.title}
                        {!notif.isRead && (
                          <FontAwesomeIcon
                            icon={faCircle}
                            className="absolute -right-1 top-2 text-[8px] text-blue-600"
                          />
                        )}
                      </h4>
                      <p className="text-xs font-bold text-slate-400 shrink-0 hidden sm:block whitespace-nowrap">
                        {notif.date}
                      </p>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-3">
                      {notif.content}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg inline-block">
                        {notif.time}
                      </p>

                      {/* Nút thao tác (Chỉ hiện khi Hover) */}
                      <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => deleteNotification(e, notif.id)}
                          className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors"
                          title="Xóa thông báo này"
                        >
                          <FontAwesomeIcon
                            icon={faTrashCan}
                            className="text-sm"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Trạng thái trống
            <div className="flex flex-col items-center justify-center h-full py-20 px-4 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-inner text-slate-300 text-4xl">
                <FontAwesomeIcon icon={faBell} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-2">
                Không có thông báo nào
              </h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                Thật yên tĩnh! Hiện tại bạn không có thông báo nào trong mục
                này. Khi có cập nhật mới, chúng sẽ xuất hiện ở đây.
              </p>
            </div>
          )}

          {/* Phân trang (Giả lập) */}
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

export default LearnerNotifications;
