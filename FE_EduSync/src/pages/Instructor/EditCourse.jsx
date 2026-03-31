import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSave,
  faInfoCircle,
  faImage,
  faList,
  faTag,
  faExclamationTriangle,
  faUpload,
  faPlus,
  faEdit,
  faTrashAlt,
  faEyeSlash,
  faGripLines,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

const InstructorCourseEditPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);

  // Tham chiếu (Ref) đến thẻ input file bị ẩn
  const fileInputRef = useRef(null);

  // =========================================================================
  // 1. MOCK DATA
  // =========================================================================
  const [courseData, setCourseData] = useState({
    title: "Master Python from basics to advanced",
    category: "Lập trình Python",
    description:
      "Khóa học toàn diện giúp bạn làm chủ Python từ con số 0. Cập nhật mới nhất 2026 với các module về AI và Data Science.",
    price: 10,
    thumbnail:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=800&q=80",
    status: "published",
    studentsEnrolled: 1250,
  });

  const [lessons, setLessons] = useState([
    {
      id: 1,
      title: "01 - Welcome to Python!",
      duration: "05:00",
      isPublished: true,
    },
    {
      id: 2,
      title: "02 - Cài đặt môi trường",
      duration: "10:25",
      isPublished: true,
    },
    {
      id: 3,
      title: "03 - Biến và Kiểu dữ liệu",
      duration: "15:30",
      isPublished: true,
    },
  ]);

  // =========================================================================
  // 2. CÁC HÀM XỬ LÝ
  // =========================================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Đã lưu các thay đổi thành công!");
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

  // LOGIC MỚI: Xử lý khi người dùng chọn file ảnh
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Tạo một URL tạm thời từ file ảnh vừa chọn trên máy để hiển thị Preview ngay lập tức
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
    { id: "pricing", label: "Giá bán", icon: faTag },
    {
      id: "danger",
      label: "Vùng nguy hiểm",
      icon: faExclamationTriangle,
      isDanger: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-fade-slide-up">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
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

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-28">
            <ul className="flex flex-col">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-bold transition-all border-l-4
                      ${
                        activeTab === tab.id
                          ? tab.isDanger
                            ? "bg-red-50 border-red-500 text-red-700"
                            : "bg-blue-50 border-blue-600 text-blue-700"
                          : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `}
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
                    {/* Khung hiển thị ảnh */}
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

                      {/* Thẻ input THẬT để chọn file (bị ẩn đi bằng class 'hidden') */}
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                      />

                      {/* Nút bấm ĐẸP - Khi bấm sẽ gọi lệnh click() của thẻ input ẩn */}
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
                <button className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2 text-sm">
                  <FontAwesomeIcon icon={faPlus} /> Thêm bài giảng
                </button>
              </div>

              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`flex items-center gap-4 p-4 border rounded-xl transition-all group
                    ${lesson.isPublished ? "bg-white border-slate-200 hover:border-blue-300" : "bg-slate-50 border-slate-200 opacity-60"}
                  `}
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

          {/* TAB 4: GIÁ BÁN */}
          {activeTab === "pricing" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-fade-slide-up">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                Giá bán khóa học
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Mức giá mới sẽ chỉ áp dụng cho các học viên đăng ký sau thời
                điểm cập nhật.
              </p>

              <div className="max-w-md">
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Giá niêm yết (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-bold text-lg">$</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    value={courseData.price}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 font-black text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                  />
                </div>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="text-blue-600 mt-0.5"
                  />
                  <p className="text-xs text-blue-800 leading-relaxed font-medium">
                    Học viên cũ (1,250 người) đã mua khóa học với giá trước đó
                    vẫn sẽ có quyền truy cập trọn đời và nhận các bản cập nhật
                    mới miễn phí.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: VÙNG NGUY HIỂM */}
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
    </div>
  );
};

export default InstructorCourseEditPage;
