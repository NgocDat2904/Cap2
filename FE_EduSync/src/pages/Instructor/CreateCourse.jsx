import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faCloudArrowUp,
  faTimes,
  faVideo,
  faImage,
  faPaperPlane,
  faComments,
  faGraduationCap,
  faEarthAmericas,
  faLock,
  faChevronDown,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

// =========================================================================
// MOCK DATA: DANH MỤC PHẲNG (Lấy từ Backend)
// =========================================================================
const categories = [
  { id: "frontend", name: "Frontend Web Development" },
  { id: "backend", name: "Backend Web Development" },
  { id: "mobile", name: "Mobile Programming" },
  { id: "ai", name: "AI & Machine Learning" },
  { id: "data_analysis", name: "Data Analysis" },
  { id: "data_engineer", name: "Data Engineering" },
  { id: "uiux", name: "UI/UX Design" },
  { id: "ba", name: "Business Analysis" },
];

const InstructorCreateCourse = () => {
  const [activeTab, setActiveTab] = useState("basic");

  const [courseInfo, setCourseInfo] = useState({
    title: "",
    description: "",
    category: "",
    prerequisites: "",
    enableQA: true,
    visibility: "public",
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploadedVideos, setUploadedVideos] = useState([]);

  // --- STATE DÀNH RIÊNG CHO DROPDOWN CHUYÊN NGÀNH ---
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const dropdownRef = useRef(null);

  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  // =========================================================================
  // XỬ LÝ SỰ KIỆN CHUNG
  // =========================================================================
  const handleCourseInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourseInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setThumbnailPreview(imageUrl);
    }
  };

  const handleVideoUploadClick = () => fileInputRef.current.click();

  const handleVideoFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newVideos = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      originalName: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
      title: file.name.split(".").slice(0, -1).join("."),
      description: "",
    }));

    setUploadedVideos((prev) => [...prev, ...newVideos]);
    e.target.value = null;
  };

  const handleVideoDetailChange = (id, field, value) => {
    setUploadedVideos((prev) =>
      prev.map((video) =>
        video.id === id ? { ...video, [field]: value } : video,
      ),
    );
  };

  const removeVideo = (id) => {
    setUploadedVideos((prev) => prev.filter((video) => video.id !== id));
  };

  // 🚨 ĐÃ SỬA LOGIC LƯU: Trạng thái bây giờ là "pending" (Chờ duyệt) 🚨
  const handleSaveCourse = (status) => {
    const finalCourseData = {
      ...courseInfo,
      status: status, // Sẽ là "draft" hoặc "pending"
      thumbnail: thumbnailPreview ? "Có ảnh bìa" : "Chưa có ảnh bìa",
      videos: uploadedVideos,
    };
    console.log(`Dữ liệu Khóa học (${status}):`, finalCourseData);

    if (status === "pending") {
      alert(
        "🎉 Đã gửi khóa học lên Trung tâm! Vui lòng chờ Admin định giá và xuất bản.",
      );
    } else {
      alert("Đã lưu bản nháp thành công!");
    }
  };

  // =========================================================================
  // LOGIC DROPDOWN CHUYÊN NGÀNH
  // =========================================================================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  const getSelectedCategoryName = () => {
    if (!courseInfo.category) return "Tìm và chọn chuyên ngành...";
    const found = categories.find((c) => c.id === courseInfo.category);
    return found ? found.name : "Tìm và chọn chuyên ngành...";
  };

  return (
    <div className="animate-fade-slide-up flex-1 p-6 sm:p-8 md:p-10 bg-slate-50 font-sans min-h-screen">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Tạo Khóa Học Mới
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Cung cấp thông tin chi tiết và tải lên nội dung bài giảng của bạn.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* NÚT ĐIỀU HƯỚNG TAB & NÚT LƯU */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex bg-slate-200/70 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("basic")}
              className={`flex-1 sm:w-40 py-2.5 px-4 font-bold rounded-lg text-sm transition-all ${
                activeTab === "basic"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/50"
              }`}
            >
              Thông tin cơ bản
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 sm:w-40 py-2.5 px-4 font-bold rounded-lg text-sm transition-all ${
                activeTab === "settings"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/50"
              }`}
            >
              Cài đặt (Setting)
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => handleSaveCourse("draft")}
              className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition duration-300 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faSave} />
              Lưu nháp
            </button>

            {/* 🚨 ĐỔI NÚT THÀNH "GỬI DUYỆT" 🚨 */}
            <button
              onClick={() => handleSaveCourse("pending")}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-900 transition duration-300 shadow-md shadow-blue-700/20 active:scale-95 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
              Gửi duyệt
            </button>
          </div>
        </div>

        {activeTab === "basic" && (
          <div className="space-y-6 animate-fade-slide-up">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/60">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">
                  1
                </span>
                Thông tin Khóa học
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Tiêu đề khóa học <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Vd: Lập trình ReactJS từ cơ bản đến nâng cao..."
                    value={courseInfo.title}
                    onChange={handleCourseInfoChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-slate-700 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div
                    ref={dropdownRef}
                    className="relative sm:col-span-2 md:col-span-1"
                  >
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Chuyên ngành <span className="text-red-500">*</span>
                    </label>
                    <div
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                        isCategoryOpen
                          ? "border-blue-500 ring-2 ring-blue-500/20"
                          : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <span
                        className={`font-medium truncate ${courseInfo.category ? "text-slate-800" : "text-slate-400"}`}
                      >
                        {getSelectedCategoryName()}
                      </span>
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`text-slate-400 transition-transform duration-300 ml-2 ${isCategoryOpen ? "rotate-180" : ""}`}
                      />
                    </div>

                    {isCategoryOpen && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fade-slide-up">
                        <div className="p-3 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                          <div className="relative">
                            <FontAwesomeIcon
                              icon={faSearch}
                              className="absolute left-3 top-3 text-slate-400 text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Tìm chuyên ngành..."
                              value={categorySearch}
                              onChange={(e) =>
                                setCategorySearch(e.target.value)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            />
                          </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto p-2 scrollbar-hide">
                          {filteredCategories.length > 0 ? (
                            filteredCategories.map((cat) => (
                              <div
                                key={cat.id}
                                onClick={() => {
                                  setCourseInfo({
                                    ...courseInfo,
                                    category: cat.id,
                                  });
                                  setIsCategoryOpen(false);
                                  setCategorySearch("");
                                }}
                                className={`px-3 py-2.5 mb-1 rounded-lg cursor-pointer text-sm font-medium transition-colors ${
                                  courseInfo.category === cat.id
                                    ? "bg-blue-50 text-blue-700 font-bold"
                                    : "text-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                {cat.name}
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-sm text-slate-500 font-medium">
                              Không tìm thấy chuyên ngành nào.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Ảnh bìa khóa học (Thumbnail)
                  </label>
                  <div
                    className="relative group border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => thumbnailInputRef.current.click()}
                  >
                    <input
                      type="file"
                      ref={thumbnailInputRef}
                      onChange={handleThumbnailChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {thumbnailPreview ? (
                      <div className="relative aspect-video w-full sm:w-1/2 mx-auto">
                        <img
                          src={thumbnailPreview}
                          alt="Course Thumbnail"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-semibold flex items-center gap-2">
                            <FontAwesomeIcon icon={faImage} /> Thay đổi ảnh bìa
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 px-6 text-center">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FontAwesomeIcon
                            icon={faImage}
                            className="text-2xl"
                          />
                        </div>
                        <p className="text-slate-700 font-bold mb-1">
                          Kéo thả ảnh hoặc click để duyệt
                        </p>
                        <p className="text-slate-500 text-sm">
                          Định dạng PNG, JPG. Tỉ lệ chuẩn 16:9 (750x422 pixel).
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* KHỐI 2: UPLOAD VIDEO */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/60">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">
                  2
                </span>
                Nội dung Bài giảng (Video)
              </h2>
              <div
                onClick={handleVideoUploadClick}
                className="border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400 rounded-2xl p-10 text-center cursor-pointer transition-all group"
              >
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleVideoFileChange}
                />
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-105 transition-transform group-hover:shadow-md">
                  <FontAwesomeIcon
                    icon={faCloudArrowUp}
                    className="text-4xl text-blue-600"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  Kéo thả các video vào đây hoặc click để duyệt file
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                  Hỗ trợ MP4, WebM, MKV tối đa 5GB/file. Bạn có thể chọn nhiều
                  file cùng lúc!
                </p>
                <button className="px-6 py-2.5 bg-blue-100 text-blue-800 font-bold rounded-xl pointer-events-none group-hover:bg-blue-200 transition-colors">
                  Chọn file Video
                </button>
              </div>

              {uploadedVideos.length > 0 && (
                <div className="mt-8 space-y-6">
                  <h3 className="font-bold text-slate-800 text-lg border-b border-slate-200 pb-3">
                    Chi tiết {uploadedVideos.length} bài giảng đã tải lên:
                  </h3>
                  {uploadedVideos.map((video, index) => (
                    <div
                      key={video.id}
                      className="relative bg-slate-50 border border-slate-200 rounded-xl p-5 pt-8 shadow-sm animate-fade-slide-up"
                    >
                      <div className="absolute top-0 left-0 bg-blue-600 text-white font-bold text-xs px-3 py-1 rounded-br-lg rounded-tl-xl">
                        Bài {index + 1}
                      </div>
                      <button
                        onClick={() => removeVideo(video.id)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-red-600 hover:bg-red-50 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        title="Xóa video này"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>

                      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200/60">
                        <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                          <FontAwesomeIcon icon={faVideo} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {video.originalName}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            Kích thước: {video.size} MB
                          </p>
                        </div>
                        <div className="shrink-0 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>{" "}
                          Đã tải lên
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Tiêu đề bài giảng
                          </label>
                          <input
                            type="text"
                            value={video.title}
                            onChange={(e) =>
                              handleVideoDetailChange(
                                video.id,
                                "title",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-slate-700 font-medium text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Mô tả ngắn gọn (Tùy chọn)
                          </label>
                          <textarea
                            rows="2"
                            value={video.description}
                            placeholder="Bài giảng này bao gồm các nội dung..."
                            onChange={(e) =>
                              handleVideoDetailChange(
                                video.id,
                                "description",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-slate-700 font-medium text-sm resize-y"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6 animate-fade-slide-up">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/60">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <FontAwesomeIcon
                  icon={faGraduationCap}
                  className="text-blue-600"
                />
                Yêu cầu đầu vào (Prerequisites)
              </h2>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Học viên cần trang bị những kiến thức/công cụ gì trước khi học
                  khóa này?
                </label>
                <textarea
                  name="prerequisites"
                  rows="3"
                  placeholder="Ví dụ: Máy tính có kết nối Internet, kiến thức cơ bản về HTML/CSS..."
                  value={courseInfo.prerequisites}
                  onChange={handleCourseInfoChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-slate-700 font-medium resize-y"
                ></textarea>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/60">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <FontAwesomeIcon
                  icon={faEarthAmericas}
                  className="text-blue-600"
                />
                Hiển thị & Tương tác
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Mức độ hiển thị
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label
                      className={`border rounded-xl p-4 cursor-pointer transition-all ${courseInfo.visibility === "public" ? "border-blue-600 bg-blue-50/50" : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="visibility"
                          value="public"
                          checked={courseInfo.visibility === "public"}
                          onChange={handleCourseInfoChange}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <FontAwesomeIcon
                          icon={faEarthAmericas}
                          className={
                            courseInfo.visibility === "public"
                              ? "text-blue-600"
                              : "text-slate-400"
                          }
                        />
                        <span className="font-bold text-slate-800">
                          Công khai (Public)
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1 ml-7">
                        Học viên có thể tìm thấy khóa học này trên hệ thống.
                      </p>
                    </label>

                    <label
                      className={`border rounded-xl p-4 cursor-pointer transition-all ${courseInfo.visibility === "private" ? "border-blue-600 bg-blue-50/50" : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="visibility"
                          value="private"
                          checked={courseInfo.visibility === "private"}
                          onChange={handleCourseInfoChange}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <FontAwesomeIcon
                          icon={faLock}
                          className={
                            courseInfo.visibility === "private"
                              ? "text-blue-600"
                              : "text-slate-400"
                          }
                        />
                        <span className="font-bold text-slate-800">
                          Riêng tư (Private)
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1 ml-7">
                        Chỉ những học viên có Link chia sẻ mới truy cập được.
                      </p>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faComments} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">
                        Bật khu vực Hỏi & Đáp (Q&A)
                      </h4>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Cho phép học viên bình luận và đặt câu hỏi dưới mỗi bài
                        giảng.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      name="enableQA"
                      checked={courseInfo.enableQA}
                      onChange={handleCourseInfoChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 sm:hidden flex flex-col gap-3">
          <button
            onClick={() => handleSaveCourse("pending")}
            className="w-full flex justify-center items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-900 transition duration-300 shadow-md shadow-blue-700/20 active:scale-95"
          >
            <FontAwesomeIcon icon={faPaperPlane} /> Gửi duyệt
          </button>
          <button
            onClick={() => handleSaveCourse("draft")}
            className="w-full flex justify-center items-center gap-2 px-6 py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition duration-300"
          >
            <FontAwesomeIcon icon={faSave} /> Lưu nháp
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorCreateCourse;
