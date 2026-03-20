import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlayCircle,
  faBrain,
  faCircleQuestion,
  faCheckCircle,
  faLock,
  faClockRotateLeft,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";

const CourseLearningWorkspace = () => {
  const { courseId, lessonId } = useParams();

  // =========================================================================
  // 1. STATE QUẢN LÝ TABS
  // =========================================================================
  const [activeLeftTab, setActiveLeftTab] = useState("summary");
  const [activeRightTab, setActiveRightTab] = useState("videos"); // Mặc định mở tab Videos

  // =========================================================================
  // 2. DỮ LIỆU GIẢ LẬP (CÓ THÊM ẢNH THUMBNAIL CHO TỪNG BÀI)
  // =========================================================================
  const instructorInfo = {
    name: "Nguyễn Văn A",
    followers: "12.5K người follow",
    avatar: "https://i.pravatar.cc/150?img=11",
  };

  // Danh sách Playlist (Giao diện phẳng, có ảnh thumbnail)
  const playlist = [
    {
      id: "v1",
      title: "01 - Welcome!",
      duration: "05:00",
      description: "Giới thiệu tổng quan về khóa học và các mục tiêu.",
      image:
        "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=300&q=80",
      completed: true,
      locked: false,
      timeline: [],
    },
    {
      id: "v2",
      title: "02 - Cài đặt môi trường (VS Code)",
      duration: "10:25",
      description: "Hướng dẫn cài đặt môi trường lập trình.",
      image:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&q=80",
      completed: true,
      locked: false,
      timeline: [],
    },
    {
      id: "v3",
      title: "03 - Component là gì?",
      duration: "15:30",
      description:
        "Khái niệm cốt lõi của React, cách tạo Functional Component.",
      image:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&q=80",
      completed: false,
      locked: false, // Bài đang học
      timeline: [
        { time: "00:00", label: "Mở đầu khái niệm", seconds: 0 },
        { time: "03:45", label: "Tạo Functional Component", seconds: 225 },
        { time: "08:20", label: "Tái sử dụng Component", seconds: 500 },
      ],
    },
    {
      id: "v4",
      title: "04 - Quản lý State (Khóa)",
      duration: "20:15",
      description: "Tìm hiểu useState Hook - Trái tim của ứng dụng.",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&q=80",
      completed: false,
      locked: true,
      timeline: [],
    },
    {
      id: "v5",
      title: "05 - Vòng đời Component (Khóa)",
      duration: "18:40",
      description: "Hiểu về Effect Hook.",
      image:
        "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=300&q=80",
      completed: false,
      locked: true,
      timeline: [],
    },
  ];

  const [activeLesson, setActiveLesson] = useState(playlist[2]); // Đang chọn bài 3

  const handleSeekVideo = (seconds, label) => {
    alert(`Đã tua video đến: ${label} (${seconds}s)`);
  };

  const handleSelectLesson = (lesson) => {
    if (!lesson.locked) {
      setActiveLesson(lesson);
      setActiveRightTab("timeline"); // Click bài mới tự động nhảy sang tab timeline
    }
  };

  const mindmapMarkdown = `
# ${activeLesson.title}
- Định nghĩa
  - Là khối xây dựng UI
- Phân loại
  - Functional Component
  - Class Component
`;

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 animate-fade-slide-up pb-20">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* ===================================================================== */}
        {/* CỘT TRÁI (WIDER): VIDEO + THÔNG TIN BÀI HỌC CỤ THỂ + TABS */}
        {/* ===================================================================== */}
        <div className="w-full lg:flex-1 flex flex-col min-w-0">
          <div className="w-full bg-slate-900 aspect-video rounded-2xl overflow-hidden shadow-lg relative group border border-slate-800">
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/30 group-hover:bg-slate-900/50 transition-all cursor-pointer z-10">
              <FontAwesomeIcon
                icon={faPlayCircle}
                className="text-white text-7xl opacity-90 group-hover:scale-110 transition-transform shadow-sm rounded-full"
              />
            </div>
            {/* Ảnh video lớn theo bài học đang chọn */}
            <img
              src={activeLesson.image}
              alt="Video cover"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm font-bold z-20">
              Phát video
            </div>
          </div>

          <div className="mt-6 mb-8 px-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug mb-3">
              {activeLesson.title}
            </h1>
            <p className="text-slate-600 text-base leading-relaxed mb-6">
              {activeLesson.description}
            </p>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <img
                  src={instructorInfo.avatar}
                  alt="Instructor"
                  className="w-12 h-12 rounded-full border border-slate-200 object-cover shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {instructorInfo.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {instructorInfo.followers}
                  </p>
                </div>
                <button className="ml-4 px-4 py-1.5 border-[1.5px] border-slate-800 text-slate-800 font-bold text-xs rounded-full hover:bg-slate-800 hover:text-white transition-all active:scale-95">
                  Follow
                </button>
              </div>
            </div>
          </div>

          <div className="w-full mt-2">
            <div className="flex items-center border-b border-slate-200 overflow-x-auto custom-scrollbar">
              {["Summary", "Mindmap", "Quiz", "Chatbot", "Review"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveLeftTab(tab.toLowerCase())}
                    className={`px-6 py-3.5 text-sm font-bold capitalize transition-all border-b-2 whitespace-nowrap
                    ${activeLeftTab === tab.toLowerCase() ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}
                  `}
                  >
                    {tab}
                  </button>
                ),
              )}
            </div>

            <div className="bg-white border border-t-0 border-slate-200 rounded-b-2xl p-6 sm:p-8 min-h-[400px] shadow-sm">
              {activeLeftTab === "summary" && (
                <div className="animate-fade-slide-up text-slate-600">
                  <h3 className="text-lg font-bold text-slate-800 mb-3">
                    Tóm tắt bài học (AI Gen)
                  </h3>
                  <p>
                    Hệ thống AI đang xử lý nội dung cho{" "}
                    <strong>{activeLesson.title}</strong>...
                  </p>
                </div>
              )}
              {activeLeftTab === "mindmap" && (
                <div className="animate-fade-slide-up space-y-6">
                  <div className="w-full h-[350px] bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center">
                    <FontAwesomeIcon
                      icon={faBrain}
                      className="text-slate-300 text-5xl mb-4"
                    />
                    <p className="text-sm font-bold text-slate-600">
                      Sơ đồ tư duy Markmap sẽ hiển thị tại đây
                    </p>
                  </div>
                </div>
              )}
              {(activeLeftTab === "quiz" ||
                activeLeftTab === "chatbot" ||
                activeLeftTab === "review") && (
                <div className="animate-fade-slide-up text-center py-10 text-slate-500 font-medium">
                  Nội dung tab {activeLeftTab} đang được cập nhật...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* CỘT PHẢI (NARROWER): TIMELINE / VIDEOS & CTA BOX */}
        {/* ===================================================================== */}
        <aside className="w-full lg:w-[400px] xl:w-[420px] shrink-0 flex flex-col gap-6 lg:sticky lg:top-8">
          {/* Box 1: Navigator (Timeline / Videos) */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[550px]">
            {/* Header Tabs của Box Phải */}
            <div className="flex items-center border-b border-slate-200 bg-white pt-2">
              <button
                onClick={() => setActiveRightTab("timeline")}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeRightTab === "timeline" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                Timeline
              </button>
              <button
                onClick={() => setActiveRightTab("videos")}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeRightTab === "videos" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                Videos
              </button>
            </div>

            {/* ======================================== */}
            {/* NỘI DUNG RIGHT TAB: TIMELINE */}
            {/* ======================================== */}
            {activeRightTab === "timeline" && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-white animate-fade-slide-up">
                <h4 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faClockRotateLeft}
                    className="text-blue-600"
                  />{" "}
                  Key Moments
                </h4>

                {activeLesson.timeline && activeLesson.timeline.length > 0 ? (
                  <div className="relative border-l-2 border-slate-100 ml-3 space-y-6 mt-6">
                    {activeLesson.timeline.map((point, index) => (
                      <div
                        key={index}
                        className="relative pl-6 cursor-pointer group"
                        onClick={() =>
                          handleSeekVideo(point.seconds, point.label)
                        }
                      >
                        <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-slate-300 rounded-full border-2 border-white group-hover:bg-blue-600 group-hover:scale-125 transition-all"></div>
                        <div className="group-hover:translate-x-1 transition-transform">
                          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-xs rounded mb-1 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {point.time}
                          </span>
                          <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                            {point.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center mt-10 italic">
                    Video này chưa có dữ liệu timeline.
                  </p>
                )}
              </div>
            )}

            {/* ======================================== */}
            {/* NỘI DUNG RIGHT TAB: VIDEOS (CÓ THUMBNAIL) */}
            {/* ======================================== */}
            {activeRightTab === "videos" && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-white animate-fade-slide-up">
                {playlist.map((lesson) => {
                  const isCurrent = activeLesson.id === lesson.id;

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleSelectLesson(lesson)}
                      disabled={lesson.locked}
                      className={`w-full flex items-center gap-3.5 p-3 rounded-xl transition-all text-left group border
                        ${
                          isCurrent
                            ? "bg-blue-50/50 border-blue-200 shadow-sm"
                            : lesson.locked
                              ? "opacity-60 cursor-not-allowed border-transparent"
                              : "hover:bg-slate-50 border-transparent cursor-pointer"
                        }
                      `}
                    >
                      {/* 1. Icon Trạng thái (Giữ nguyên như ảnh của bạn) */}
                      <div className="flex-shrink-0 w-5 flex justify-center">
                        {lesson.locked ? (
                          <FontAwesomeIcon
                            icon={faLock}
                            className="text-slate-300 text-sm"
                          />
                        ) : lesson.completed ? (
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="text-green-500 text-[16px]"
                          />
                        ) : isCurrent ? (
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                            <FontAwesomeIcon
                              icon={faPlay}
                              className="text-blue-600 text-[9px] ml-[1px]"
                            />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-blue-400 transition-colors"></div>
                        )}
                      </div>

                      {/* 2. Ảnh Thumbnail (MỚI) */}
                      <div className="relative w-24 shrink-0 aspect-video rounded-lg overflow-hidden bg-slate-200 shadow-sm border border-slate-200/60">
                        <img
                          src={lesson.image}
                          alt={lesson.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Lớp phủ đen làm nổi bật khi hover */}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                      </div>

                      {/* 3. Nội dung Text */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h5
                          className={`text-[13px] leading-snug line-clamp-2
                          ${isCurrent ? "font-bold text-blue-800" : "font-semibold text-slate-700 group-hover:text-blue-600"}
                        `}
                        >
                          {lesson.title}
                        </h5>
                        <span className="text-[11px] font-medium text-slate-500 mt-1">
                          ({lesson.duration})
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Box 2: CTA (Thanh toán & AI) */}
          <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-slate-700 font-medium leading-relaxed mb-5">
              Thanh toán khóa học ngay để có thể xem nhiều video và sử dụng được
              các tính năng như gen ra mindmap và các câu hỏi trắc nghiệm từ bài
              giảng nhé!
            </p>

            <div className="space-y-3 mb-6">
              <button className="w-full sm:w-[200px] bg-white border border-blue-600 text-blue-800 font-bold text-sm py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-sm">
                <FontAwesomeIcon icon={faBrain} className="text-blue-600" /> AI
                gen Mindmap
              </button>
              <button className="w-full sm:w-[200px] bg-white border border-blue-600 text-blue-800 font-bold text-sm py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-sm">
                <FontAwesomeIcon
                  icon={faCircleQuestion}
                  className="text-blue-600"
                />{" "}
                Quiz
              </button>
            </div>

            <button className="w-full bg-[#2da44e] hover:bg-[#268c41] text-white font-bold py-3.5 rounded-xl shadow-md shadow-green-600/20 transition-all active:scale-95 flex justify-center items-center text-[15px]">
              Thanh toán $10
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CourseLearningWorkspace;
