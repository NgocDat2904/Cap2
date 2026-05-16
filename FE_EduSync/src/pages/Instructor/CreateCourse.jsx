import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faCloudArrowUp,
  faTimes,
  faVideo,
  faImage,
  faPaperPlane,
  faGraduationCap,
  faChevronDown,
  faSearch,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import toast from "../../utils/toast";

// IMPORT API
import {
  createCourseAPI,
  getPresignedUrlAPI,
  uploadVideoToGCS,
  saveVideoToDBAPI,
  submitCourseAPI,
  uploadCourseThumbnailAPI,
  createLessonAPI,
} from "../../services/courseAPI";

const categories = [
  { id: "frontend", name: "Frontend Web Development" },
  { id: "backend", name: "Backend Web Development" },
  { id: "mobile", name: "Mobile App Development" },
  { id: "ai", name: "AI & Machine Learning" },
  { id: "data_analysis", name: "Data Analysis" },
  { id: "data_engineer", name: "Data Engineering" },
  { id: "uiux", name: "UI/UX Design" },
  { id: "ba", name: "Business Analysis" },
];
// =========================================================================
// COMPONENT: UPLOAD PROGRESS DIALOG
// =========================================================================
const UploadProgressDialog = ({
  isOpen,
  progressText,
  currentVideo,
  totalVideos,
}) => {
  if (!isOpen) return null;

  const progressPercentage =
    totalVideos > 0 ? Math.round(((currentVideo - 1) / totalVideos) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm animate-fade-in pointer-events-none"
      />

      {/* Dialog */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in"
      >
        {/* Icon Loading */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="text-4xl text-blue-600"
              />
            </div>
            {/* Pulse ring effect */}
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-3">
          Đang xử lý khóa học
        </h2>

        {/* Progress Text */}
        <p className="text-blue-600 font-semibold text-center mb-6 min-h-[48px] flex items-center justify-center animate-pulse">
          {progressText}
        </p>

        {/* Progress Bar */}
        {totalVideos > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
              <span>
                Video {currentVideo}/{totalVideos}
              </span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Warning Message */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-amber-600 text-lg mt-0.5 flex-shrink-0"
          />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900 mb-1">
              Vui lòng không đóng trang!
            </p>
            <p className="text-xs text-amber-700">
              Đang tải dữ liệu lên máy chủ. Việc đóng trang sẽ làm gián đoạn quá
              trình và có thể mất dữ liệu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
// =========================================================================
// MAIN COMPONENT
// =========================================================================
const InstructorCreateCourse = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const [courseInfo, setCourseInfo] = useState({
    title: "",
    description: "",
    category: "",
    prerequisites: "",
    enableQA: true,
    visibility: "public",
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploadedVideos, setUploadedVideos] = useState([]);

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const dropdownRef = useRef(null);

  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const MAX_WORDS = 100;

  const countWords = (text) =>
    (text || "").trim().split(/\s+/).filter(Boolean).length;

  const hasInvalidFormat = (text) => {
    const value = (text || "").trim();
    if (!value) return false;
    return (
      /[<>{}`$]/.test(value) || /(script|drop\s+table|select\s+\*)/i.test(value)
    );
  };

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
      setThumbnailFile(file);
      const imageUrl = URL.createObjectURL(file);
      setThumbnailPreview(imageUrl);
    }
    e.target.value = "";
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
    if (field === "title" && countWords(value) > MAX_WORDS) {
      toast.warning(
        `Hệ thống: Tiêu đề video không được vượt quá ${MAX_WORDS} từ.`,
      );
      return;
    }

    setUploadedVideos((prev) =>
      prev.map((video) =>
        video.id === id ? { ...video, [field]: value } : video,
      ),
    );
  };

  const removeVideo = (id) => {
    setUploadedVideos((prev) => prev.filter((video) => video.id !== id));
  };

  // =========================================================================
  // LOGIC TẠO KHÓA -> XIN VÉ -> UP MÂY -> LƯU DB -> GỬI DUYỆT
  // =========================================================================
  const handleSaveCourse = async (actionType) => {
    const title = courseInfo.title.trim();
    const description = courseInfo.description.trim();

    if (!title) {
      toast.warning("Vui lòng nhập tên khóa học.");
      return;
    }
    if (title.length < 5) {
      toast.warning("Tên khóa học phải có tối thiểu 5 ký tự.");
      return;
    }
    if (countWords(title) > MAX_WORDS) {
      toast.warning(`Tên khóa học không được vượt quá ${MAX_WORDS} từ.`);
      return;
    }
    if (hasInvalidFormat(title)) {
      toast.warning("Tên khóa học chứa các ký tự hoặc định dạng không hợp lệ.");
      return;
    }
    if (!courseInfo.category) {
      toast.warning("Vui lòng chọn danh mục khóa học.");
      return;
    }
    if (!description) {
      toast.warning("Vui lòng nhập mô tả khóa học.");
      return;
    }
    if (!thumbnailFile) {
      toast.warning("Vui lòng tải lên ảnh bìa đại diện cho khóa học.");
      return;
    }
    if (uploadedVideos.length === 0) {
      toast.warning("Vui lòng thêm ít nhất 1 video bài giảng.");
      return;
    }
    for (const video of uploadedVideos) {
      const videoTitle = (video.title || "").trim();
      if (!videoTitle) {
        toast.warning(
          "Lỗi kiểm tra: Mỗi video phải có tiêu đề bài học tương ứng.",
        );
        return;
      }
      if (countWords(videoTitle) > MAX_WORDS) {
        toast.warning(
          `Lỗi kiểm tra: Tiêu đề video "${video.originalName}" vượt quá ${MAX_WORDS} từ.`,
        );
        return;
      }
      if (hasInvalidFormat(videoTitle)) {
        toast.warning(
          `Tiêu đề video "${video.originalName}" chứa định dạng không hợp lệ.`,
        );
        return;
      }
    }
    if (actionType === "pending" && uploadedVideos.length === 0) {
      toast.warning(
        "Điều kiện xuất bản: Khóa học phải có ít nhất 1 video bài giảng để gửi yêu cầu phê duyệt.",
      );
      return;
    }

    setIsLoading(true);
    setCurrentVideoIndex(0);

    try {
      const token = localStorage.getItem("access_token");
      if (!token)
        throw new Error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");

      let courseImageUrl = "";
      if (thumbnailFile) {
        setUploadProgressText(
          "Đang tải ảnh bìa lên hệ thống lưu trữ đám mây...",
        );
        const thumbRes = await uploadCourseThumbnailAPI(thumbnailFile, token);
        courseImageUrl = thumbRes.url || "";
      }

      // BƯỚC 1: TẠO KHÓA HỌC
      setUploadProgressText("Đang khởi tạo dữ liệu khóa học mới...");
      const coursePayload = {
        title,
        description,
        category: courseInfo.category,
        image: courseImageUrl,
      };
      const createResponse = await createCourseAPI(coursePayload, token);
      const newCourseId = createResponse.id;

      // BƯỚC 2 + 3 + 4: XỬ LÝ UP TỪNG VIDEO
      if (uploadedVideos.length > 0) {
        for (let i = 0; i < uploadedVideos.length; i++) {
          setCurrentVideoIndex(i + 1);

          const getVideoDuration = (file) => {
            return new Promise((resolve) => {
              const video = document.createElement("video");
              video.preload = "metadata";

              video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);

                const seconds = video.duration;
                const m = Math.floor(seconds / 60);
                const s = Math.floor(seconds % 60);

                const duration = `${m}:${s.toString().padStart(2, "0")}`;
                resolve(duration);
              };

              video.src = URL.createObjectURL(file);
            });
          };
          const video = uploadedVideos[i];
          const duration = await getVideoDuration(video.file);

          setUploadProgressText(
            `Đang xử lý dữ liệu Video ${i + 1}/${uploadedVideos.length}...`,
          );

          // Xin vé thông hành GCS
          const urlData = await getPresignedUrlAPI(
            newCourseId,
            video.file.name,
            video.file.type,
            token,
          );
          if (!urlData?.upload_url || !urlData?.file_url) {
            throw new Error(
              "Lỗi hệ thống: Không thể lấy quyền truy cập để tải video lên máy chủ.",
            );
          }

          // Up thẳng lên mây Google
          setUploadProgressText(
            `Đang truyền tải Video ${i + 1}/${uploadedVideos.length} lên máy chủ...`,
          );
          await uploadVideoToGCS(urlData.upload_url, video.file);

          // Tạo lesson
          const lessonRes = await createLessonAPI(
            {
              course_id: newCourseId,
              title: video.title || `Bài học ${i + 1}`,
              order_index: i + 1,
            },
            token,
          );
          const lessonId = lessonRes?.id;
          if (!lessonId) {
            throw new Error(
              `Không thể tạo hồ sơ bài học cho video số ${i + 1}`,
            );
          }

          // Lưu Video vào Database
          const videoDbPayload = {
            lesson_id: lessonId,
            video_url: urlData.file_url,
            storage_path: urlData.storage_path,
            thumbnail_url: courseImageUrl || undefined,
            title: video.title,
            description: video.description,
            file_name: video.file.name,
            duration: duration,
          };
          await saveVideoToDBAPI(newCourseId, videoDbPayload, token);
        }
      }

      // BƯỚC 5: XỬ LÝ NÚT BẤM KẾT THÚC
      if (actionType === "draft") {
        toast.success(`Lưu bản nháp thành công. (Mã khóa học: ${newCourseId})`);
      } else if (actionType === "pending") {
        setUploadProgressText(
          "Đang hoàn tất và gửi yêu cầu phê duyệt tới hệ thống...",
        );
        await submitCourseAPI(newCourseId, token);

        toast.success(
          "Gửi yêu cầu phê duyệt thành công. Vui lòng chờ Quản trị viên định giá và xuất bản.",
        );

        // Reset form
        setCourseInfo({
          title: "",
          description: "",
          category: "",
          prerequisites: "",
          enableQA: true,
          visibility: "public",
        });
        setUploadedVideos([]);
        if (thumbnailPreview?.startsWith("blob:")) {
          URL.revokeObjectURL(thumbnailPreview);
        }
        setThumbnailPreview(null);
        setThumbnailFile(null);
      }
    } catch (error) {
      toast.error(`Đã xảy ra lỗi: ${error.message}`);
      console.error("Lỗi chi tiết:", error);
    } finally {
      setIsLoading(false);
      setUploadProgressText("");
      setCurrentVideoIndex(0);
    }
  };

  const handleCancelCreate = () => {
    const hasUnsavedData =
      courseInfo.title.trim() ||
      courseInfo.description.trim() ||
      courseInfo.category ||
      thumbnailFile ||
      uploadedVideos.length > 0;

    if (hasUnsavedData) {
      const confirmed = window.confirm(
        "Dữ liệu chưa được lưu. Bạn có chắc chắn muốn hủy bỏ bản nháp và rời khỏi trang này?",
      );
      if (!confirmed) return;
    }
    navigate("/instructor/courses");
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
    if (!courseInfo.category) return "Tìm kiếm và chọn danh mục...";
    const found = categories.find((c) => c.id === courseInfo.category);
    return found ? found.name : "Tìm kiếm và chọn danh mục...";
  };

  return (
    <div className="animate-fade-slide-up flex-1 p-6 sm:p-8 md:p-10 bg-slate-50 font-sans min-h-screen relative">
      {/* UPLOAD PROGRESS DIALOG */}
      <UploadProgressDialog
        isOpen={isLoading}
        progressText={uploadProgressText}
        currentVideo={currentVideoIndex}
        totalVideos={uploadedVideos.length}
      />

      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Tạo Khóa Học Mới
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Cung cấp thông tin chi tiết và tải lên nội dung khóa học của bạn.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex bg-slate-200/70 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("basic")}
              className={`flex-1 sm:w-40 py-2.5 px-4 font-bold rounded-lg text-sm transition-all ${activeTab === "basic" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-slate-200/50"}`}
            >
              Thông tin cơ bản
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-1 sm:w-40 py-2.5 px-4 font-bold rounded-lg text-sm transition-all ${activeTab === "settings" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-slate-200/50"}`}
            >
              Cài đặt khác
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={handleCancelCreate}
              disabled={isLoading}
              className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition duration-300 flex items-center gap-2 disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              onClick={() => handleSaveCourse("draft")}
              disabled={isLoading}
              className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition duration-300 flex items-center gap-2 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faSave} /> Lưu bản nháp
            </button>

            <button
              onClick={() => handleSaveCourse("pending")}
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-900 transition duration-300 shadow-md shadow-blue-700/20 active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faPaperPlane} /> Gửi yêu cầu phê duyệt
            </button>
          </div>
        </div>

        {activeTab === "basic" && (
          <div className="space-y-6 animate-fade-slide-up">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/60">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">
                  1
                </span>{" "}
                Thông tin khóa học
              </h2>
              <div className="space-y-5">
                {/* TÊN KHÓA HỌC */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Tên khóa học <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Ví dụ: Lập trình ReactJS thực chiến từ A-Z..."
                    value={courseInfo.title}
                    onChange={handleCourseInfoChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-slate-700 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* DANH MỤC */}
                  <div
                    ref={dropdownRef}
                    className="relative sm:col-span-2 md:col-span-1"
                  >
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <div
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl flex items-center justify-between cursor-pointer transition-colors ${isCategoryOpen ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 hover:border-blue-300"}`}
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
                              placeholder="Tìm kiếm danh mục..."
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
                                className={`px-3 py-2.5 mb-1 rounded-lg cursor-pointer text-sm font-medium transition-colors ${courseInfo.category === cat.id ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-100"}`}
                              >
                                {cat.name}
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-sm text-slate-500 font-medium">
                              Không tìm thấy danh mục.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* MÔ TẢ KHÓA HỌC */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                    Mô tả khóa học
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    placeholder="Mô tả chi tiết những gì học viên sẽ học được từ khóa học này..."
                    value={courseInfo.description}
                    onChange={handleCourseInfoChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-slate-700 font-medium resize-y"
                  ></textarea>
                </div>

                {/* ẢNH BÌA */}
                <div className="mt-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Ảnh bìa khóa học
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
                          Kéo thả ảnh hoặc nhấn để duyệt tệp
                        </p>
                        <p className="text-slate-500 text-sm">
                          Định dạng hỗ trợ: PNG, JPG. Tỷ lệ chuẩn 16:9.
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
                </span>{" "}
                Nội dung giáo trình (Video)
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
                  Kéo thả tệp video vào đây hoặc nhấn để duyệt tệp
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                  Hỗ trợ định dạng MP4, WebM. Dung lượng tối đa 5GB/tệp.
                </p>
                <button className="px-6 py-2.5 bg-blue-100 text-blue-800 font-bold rounded-xl pointer-events-none group-hover:bg-blue-200 transition-colors">
                  Chọn tệp Video
                </button>
              </div>

              {uploadedVideos.length > 0 && (
                <div className="mt-8 space-y-6">
                  <h3 className="font-bold text-slate-800 text-lg border-b border-slate-200 pb-3">
                    Chi tiết {uploadedVideos.length} bài giảng:
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
                        title="Xóa video"
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
                            Dung lượng: {video.size} MB
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">
                            Tiêu đề bài học
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
                            Mô tả ngắn (Tùy chọn)
                          </label>
                          <textarea
                            rows="2"
                            value={video.description}
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

        {/* Tab Cài đặt */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-fade-slide-up">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/60">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <FontAwesomeIcon
                  icon={faGraduationCap}
                  className="text-blue-600"
                />{" "}
                Điều kiện tiên quyết
              </h2>
              <div>
                <textarea
                  name="prerequisites"
                  rows="3"
                  placeholder="Yêu cầu học viên cần có kiến thức gì trước khi tham gia..."
                  value={courseInfo.prerequisites}
                  onChange={handleCourseInfoChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors text-slate-700 font-medium resize-y"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 sm:hidden flex flex-col gap-3">
          <button
            onClick={handleCancelCreate}
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 px-6 py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition duration-300 disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => handleSaveCourse("pending")}
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-900 transition duration-300 shadow-md shadow-blue-700/20 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} />
            )}{" "}
            Gửi yêu cầu phê duyệt
          </button>
          <button
            onClick={() => handleSaveCourse("draft")}
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 px-6 py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faSave} />
            )}{" "}
            Lưu bản nháp
          </button>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default InstructorCreateCourse;
