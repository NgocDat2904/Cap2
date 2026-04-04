import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSave,
  faInfoCircle,
  faImage,
  faList,
  faExclamationTriangle,
  faUpload,
  faPlus,
  faEdit,
  faTrashAlt,
  faEyeSlash,
  faGripLines,
  faCheckCircle,
  faXmark,
  faFilm,
  faCloudUploadAlt,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const InstructorCourseEditPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef(null);

  // =========================================================================
  // 1. MOCK DATA
  // =========================================================================
  const [courseData, setCourseData] = useState({
    title: "Master Python from basics to advanced",
    category: "Lập trình Python",
    description:
      "Khóa học toàn diện giúp bạn làm chủ Python từ con số 0. Cập nhật mới nhất 2026 với các module về AI và Data Science.",
    thumbnail:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=800&q=80",
    status: "published",
    studentsEnrolled: 1250,
  });

  const [lessons, setLessons] = useState([
    {
      id: 1,
      title: "01 - Welcome to Python!",
      description: "Cài đặt và làm quen với Python",
      duration: "05:00",
      isPublished: true,
    },
    {
      id: 2,
      title: "02 - Cài đặt môi trường",
      description: "Cài đặt VS Code và Extensions",
      duration: "10:25",
      isPublished: true,
    },
    {
      id: 3,
      title: "03 - Biến và Kiểu dữ liệu",
      description: "Các kiểu dữ liệu cơ bản trong Python",
      duration: "15:30",
      isPublished: true,
    },
  ]);

  // =========================================================================
  // STATE & LOGIC CHO MODAL THÊM BÀI GIẢNG
  // =========================================================================
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  // 🚨 THÊM STATE CHO MÔ TẢ
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonVideoName, setLessonVideoName] = useState("");
  const [isUploadingLesson, setIsUploadingLesson] = useState(false);
  const lessonFileInputRef = useRef(null);

  const openAddLessonModal = () => {
    setLessonTitle("");
    setLessonDescription(""); // Xóa trắng mô tả khi mở modal thêm mới
    setLessonVideoName("");
    setIsLessonModalOpen(true);
  };

  const closeLessonModal = () => {
    if (!isUploadingLesson) {
      setIsLessonModalOpen(false);
    }
  };

  const handleLessonVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLessonVideoName(file.name);
    }
  };

  const handleSubmitLesson = (e) => {
    e.preventDefault();
    if (!lessonTitle.trim()) {
      alert("Vui lòng nhập tiêu đề bài giảng!");
      return;
    }
    if (!lessonVideoName) {
      alert("Vui lòng chọn video bài giảng!");
      return;
    }

    setIsUploadingLesson(true);

    // Giả lập thời gian upload video (1.5 giây)
    setTimeout(() => {
      const newLesson = {
        id: Date.now(),
        title: lessonTitle,
        description: lessonDescription, // 🚨 Lưu mô tả vào data
        duration: "12:00",
        isPublished: true,
      };

      setLessons([...lessons, newLesson]);

      setIsUploadingLesson(false);
      setIsLessonModalOpen(false);
      setLessonTitle("");
      setLessonDescription(""); // Reset mô tả
      setLessonVideoName("");
    }, 1500);
  };

  // =========================================================================
  // 2. CÁC HÀM XỬ LÝ CHÍNH TRANG EDIT
  // =========================================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert(
        "Đã lưu thành công! Hệ thống đã ghi nhận bản cập nhật nội dung của bạn và báo cáo lên Admin.",
      );
    }, 1000);
  };

  const handleDeleteLesson = (lessonId) => {
    if (courseData.studentsEnrolled > 0) {
      const confirmHide = window.confirm(
        "CẢNH BÁO BẢO VỆ DỮ LIỆU:\nKhóa học này đã có 1,250 học viên. Việc xóa bài giảng sẽ làm hỏng tiến độ học tập của họ.\n\nHệ thống sẽ chuyển bài giảng này sang trạng thái ẨN (Unpublished) thay vì xóa vĩnh viễn. Bạn có đồng ý không?",
      );
      if (confirmHide) {
        setLessons(
          lessons.map((l) =>
            l.id === lessonId
              ? { ...l, isPublished: false, title: l.title + " (Đã ẩn)" }
              : l,
          ),
        );
      }
    } else {
      if (window.confirm("Bạn có chắc chắn muốn xóa bài giảng này?")) {
        setLessons(lessons.filter((l) => l.id !== lessonId));
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCourseData({ ...courseData, thumbnail: imageUrl });
    }
  };

  // =========================================================================
  // 3. TABS MENU
  // =========================================================================
  const tabs = [
    { id: "basic", label: "Thông tin cơ bản", icon: faInfoCircle },
    { id: "media", label: "Hình ảnh & Video", icon: faImage },
    { id: "curriculum", label: "Chương trình học", icon: faList },
    {
      id: "danger",
      label: "Vùng nguy hiểm",
      icon: faExclamationTriangle,
      isDanger: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-fade-slide-up relative">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-extrabold text-slate-900 line-clamp-1">
                  Chỉnh sửa: {courseData.title}
                </h1>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-200">
                  Đang xuất bản
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Lần lưu cuối: Vài giây trước
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 ${isSaving ? "opacity-70 cursor-not-allowed" : "active:scale-95"}`}
          >
            <FontAwesomeIcon icon={faSave} />{" "}
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col md:flex-row gap-8 relative z-10">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-28">
            <ul className="flex flex-col">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-bold transition-all border-l-4 ${activeTab === tab.id ? (tab.isDanger ? "bg-red-50 border-red-500 text-red-700" : "bg-blue-50 border-blue-600 text-blue-700") : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                  >
                    <FontAwesomeIcon
                      icon={tab.icon}
                      className={`text-lg w-5 ${activeTab === tab.id ? "" : "text-slate-400"}`}
                    />
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          {/* TAB 1: THÔNG TIN CƠ BẢN */}
          {activeTab === "basic" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-fade-slide-up">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
                Thông tin cơ bản
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Tiêu đề khóa học
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={courseData.title}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Danh mục
                  </label>
                  <select
                    name="category"
                    value={courseData.category}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"
                  >
                    <option>Lập trình Python</option>
                    <option>Lập trình Web</option>
                    <option>Trí tuệ nhân tạo (AI)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    name="description"
                    value={courseData.description}
                    onChange={handleChange}
                    rows="5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HÌNH ẢNH & VIDEO */}
          {activeTab === "media" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-fade-slide-up">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                Hình ảnh & Video
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Hình ảnh hấp dẫn sẽ giúp khóa học của bạn nổi bật hơn trên
                EduSync.
              </p>
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Ảnh bìa khóa học (Thumbnail)
                  </label>
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="w-full sm:w-1/2 aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 relative group">
                      <img
                        src={courseData.thumbnail}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <FontAwesomeIcon
                          icon={faEyeSlash}
                          className="text-white text-3xl"
                        />
                      </div>
                    </div>
                    <div className="flex-1 w-full flex flex-col justify-center">
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                        Định dạng hỗ trợ: JPG, PNG. Tỉ lệ khuyên dùng: 16:9.
                        Kích thước tối thiểu 1280x720px.
                      </p>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                      />
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="w-full py-3 bg-white border-2 border-dashed border-blue-400 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 active:scale-95"
                      >
                        <FontAwesomeIcon icon={faUpload} /> Tải ảnh mới lên
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHƯƠNG TRÌNH HỌC */}
          {activeTab === "curriculum" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-fade-slide-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
                    Chương trình học
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Kéo thả để sắp xếp lại vị trí các bài giảng.
                  </p>
                </div>
                <button
                  onClick={openAddLessonModal}
                  className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2 text-sm active:scale-95"
                >
                  <FontAwesomeIcon icon={faPlus} /> Thêm bài giảng
                </button>
              </div>

              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-4 p-4 border rounded-xl transition-all group ${lesson.isPublished ? "bg-white border-slate-200 hover:border-blue-300" : "bg-slate-50 border-slate-200 opacity-60"}`}
                  >
                    <div className="cursor-grab text-slate-300 hover:text-slate-500 py-2">
                      <FontAwesomeIcon icon={faGripLines} />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate">
                        {lesson.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-medium text-slate-500">
                          {lesson.duration}
                        </span>
                        {lesson.isPublished ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            <FontAwesomeIcon icon={faCheckCircle} /> Đã xuất bản
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                            <FontAwesomeIcon icon={faEyeSlash} /> Đã ẩn
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="w-8 h-8 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Sửa tên"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="w-8 h-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Xóa / Ẩn bài giảng"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: VÙNG NGUY HIỂM */}
          {activeTab === "danger" && (
            <div className="bg-white rounded-3xl border border-red-200 shadow-sm p-6 sm:p-8 animate-fade-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                </div>
                <h2 className="text-2xl font-extrabold text-red-700">
                  Vùng nguy hiểm
                </h2>
              </div>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-red-50/50 border border-red-100 rounded-2xl">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      Hủy xuất bản khóa học (Unpublish)
                    </h4>
                    <p className="text-sm text-slate-600 mt-1 max-w-lg leading-relaxed">
                      Khóa học sẽ bị ẩn khỏi danh mục tìm kiếm. Học viên mới
                      không thể mua, nhưng học viên cũ vẫn có thể tiếp tục học
                      bình thường.
                    </p>
                  </div>
                  <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm shrink-0">
                    Hủy xuất bản
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-red-50/50 border border-red-100 rounded-2xl">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      Xóa vĩnh viễn khóa học
                    </h4>
                    <p className="text-sm text-red-600/80 mt-1 max-w-lg leading-relaxed font-medium">
                      Khóa học này đã có 1,250 học viên đăng ký. Hệ thống đã
                      KHÓA chức năng xóa vĩnh viễn để bảo vệ dữ liệu người dùng.
                    </p>
                  </div>
                  <button
                    disabled
                    className="px-5 py-2.5 bg-slate-200 text-slate-400 font-bold rounded-xl cursor-not-allowed shrink-0"
                  >
                    Xóa khóa học
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL THÊM BÀI GIẢNG (Hiển thị nổi lơ lửng trên cùng) */}
      {/* ========================================================================= */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={closeLessonModal}
          ></div>

          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fade-slide-up flex flex-col z-50">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                  <FontAwesomeIcon icon={faFilm} />
                </div>
                Thêm bài giảng mới
              </h3>
              <button
                onClick={closeLessonModal}
                disabled={isUploadingLesson}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} className="text-lg" />
              </button>
            </div>

            <div className="p-6">
              <form
                id="add-lesson-form"
                onSubmit={handleSubmitLesson}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Tiêu đề bài giảng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="VD: Bài 1 - Biến và kiểu dữ liệu..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    disabled={isUploadingLesson}
                  />
                </div>

                {/* 🚨 Ô NHẬP MÔ TẢ MỚI ĐƯỢC THÊM VÀO 🚨 */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Mô tả bài giảng (Tùy chọn)
                  </label>
                  <textarea
                    value={lessonDescription}
                    onChange={(e) => setLessonDescription(e.target.value)}
                    placeholder="Nhập mô tả ngắn gọn về nội dung bài giảng..."
                    rows="3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-none"
                    disabled={isUploadingLesson}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Video bài giảng <span className="text-red-500">*</span>
                  </label>
                  <div
                    onClick={() =>
                      !isUploadingLesson && lessonFileInputRef.current.click()
                    }
                    className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${lessonVideoName ? "border-blue-400 bg-blue-50/50 cursor-default" : "border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer hover:border-blue-400"} ${isUploadingLesson ? "opacity-50 cursor-wait" : ""}`}
                  >
                    <input
                      type="file"
                      accept="video/mp4,video/x-m4v,video/*"
                      className="hidden"
                      ref={lessonFileInputRef}
                      onChange={handleLessonVideoChange}
                      disabled={isUploadingLesson}
                    />
                    {lessonVideoName ? (
                      <div className="flex flex-col items-center text-blue-600">
                        <FontAwesomeIcon
                          icon={faFilm}
                          className="text-4xl mb-3"
                        />
                        <p className="font-bold text-sm line-clamp-1 px-4">
                          {lessonVideoName}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLessonVideoName("");
                          }}
                          className="mt-2 text-xs text-red-500 hover:text-red-700 font-semibold underline"
                          disabled={isUploadingLesson}
                        >
                          Thay video khác
                        </button>
                      </div>
                    ) : (
                      <div className="text-slate-500">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-3 text-blue-500">
                          <FontAwesomeIcon
                            icon={faCloudUploadAlt}
                            className="text-xl"
                          />
                        </div>
                        <p className="font-bold text-sm text-slate-700">
                          Bấm để tải video lên
                        </p>
                        <p className="text-xs mt-1">
                          Hỗ trợ định dạng MP4, tối đa 2GB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl">
              <button
                type="button"
                onClick={closeLessonModal}
                disabled={isUploadingLesson}
                className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                form="add-lesson-form"
                disabled={isUploadingLesson}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-wait"
              >
                {isUploadingLesson ? (
                  <>
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin"
                    />{" "}
                    Đang tải lên...
                  </>
                ) : (
                  "Lưu bài giảng"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCourseEditPage;
