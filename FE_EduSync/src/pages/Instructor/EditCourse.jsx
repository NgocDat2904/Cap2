import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  faClockRotateLeft
} from "@fortawesome/free-solid-svg-icons";
import {
  getInstructorCourseDetailAPI,
  updateInstructorCourseAPI,
} from "../../services/instructorAPI";
import {
  uploadCourseThumbnailAPI,
  createLessonAPI,
  getPresignedUrlAPI,
  uploadVideoToGCS,
  saveVideoToDBAPI,
} from "../../services/courseAPI";

const COURSE_CATEGORIES = [
  { id: "frontend", label: "Phát triển Web Frontend" },
  { id: "backend", label: "Phát triển Web Backend" },
  { id: "mobile", label: "Lập trình Di động" },
  { id: "ai", label: "AI & Học máy" },
  { id: "data_analysis", label: "Phân tích Dữ liệu" },
  { id: "data_engineer", label: "Kỹ thuật Dữ liệu" },
  { id: "uiux", label: "Thiết kế UI/UX" },
  { id: "ba", label: "Phân tích Nghiệp vụ" },
];

const normalizeCategoryValue = (rawCategory) => {
  const category = (rawCategory || "").trim().toLowerCase();
  const byId = COURSE_CATEGORIES.find((item) => item.id === category);
  if (byId) return byId.id;
  const byLabel = COURSE_CATEGORIES.find(
    (item) => item.label.toLowerCase() === category
  );
  return byLabel ? byLabel.id : "";
};

const InstructorCourseEditPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  // =========================================================================
  // 1. QUẢN LÝ STATE
  // =========================================================================
  const [courseData, setCourseData] = useState({
    title: "",
    category: "",
    description: "",
    thumbnail: "",
    status: "DRAFT",
    studentsEnrolled: 0,
    hasNewUpdateForQC: false, 
  });

  const [lessons, setLessons] = useState([]);

  // =========================================================================
  // 2. TẢI DỮ LIỆU KHÓA HỌC
  // =========================================================================
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Không tìm thấy phiên đăng nhập hợp lệ.");
          return;
        }

        if (!courseId) {
          setError("Không tìm thấy mã Id khóa học.");
          return;
        }

        const data = await getInstructorCourseDetailAPI(courseId, token);

        const courseDetail = data.courseDetail || {};
        setCourseData({
          title: courseDetail.title || "",
          category: normalizeCategoryValue(courseDetail.category),
          description: courseDetail.description || "",
          thumbnail: courseDetail.thumbnail || "",
          status: courseDetail.status || "DRAFT",
          studentsEnrolled: courseDetail.students_enrolled || 0,
        });

        const lessonsList = data.lessonsList || [];
        setLessons(
          lessonsList.map((lesson) => ({
            id: lesson._id || lesson.id,
            title: lesson.title || "",
            description: lesson.description || "",
            duration: lesson.duration || "00:00",
            isPublished: lesson.is_published !== false,
            isApproved: lesson.is_approved !== false,
            isNew: false,
          }))
        );

        setIsLoading(false);
      } catch (err) {
        console.error("Lỗi khi tải khóa học:", err);
        setError(
          err.response?.data?.detail || "Không thể tải dữ liệu khóa học."
        );
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // =========================================================================
  // 3. STATE & LOGIC CHO MODAL THÊM BÀI GIẢNG
  // =========================================================================
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonVideoName, setLessonVideoName] = useState("");
  const [lessonVideoFile, setLessonVideoFile] = useState(null);
  const [isUploadingLesson] = useState(false);
  const lessonFileInputRef = useRef(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const openAddLessonModal = () => {
    setLessonTitle("");
    setLessonDescription("");
    setLessonVideoName("");
    setLessonVideoFile(null);
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
      setLessonVideoFile(file);
    }
  };

  const getVideoDuration = (file) =>
    new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const seconds = Math.floor(video.duration || 0);
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        resolve(`${m}:${String(s).padStart(2, "0")}`);
      };
      video.src = URL.createObjectURL(file);
    });

  const handleSubmitLesson = (e) => {
    e.preventDefault();
    if (!lessonTitle.trim()) {
      alert("Vui lòng nhập tiêu đề bài học.");
      return;
    }
    if (!lessonVideoName || !lessonVideoFile) {
      alert("Vui lòng chọn tệp video bài học.");
      return;
    }

    const newLesson = {
      id: `new-${Date.now()}`,
      title: lessonTitle.trim(),
      description: lessonDescription.trim(),
      duration: "00:00",
      isPublished: true,
      isApproved: true,
      isNew: true,
      videoFile: lessonVideoFile,
      videoFileName: lessonVideoFile.name,
    };

    setLessons((prev) => [...prev, newLesson]);

    if (courseData.status === "PUBLISHED") {
      setCourseData((prev) => ({
        ...prev,
        hasNewUpdateForQC: true,
      }));
    }

    setIsLessonModalOpen(false);
    setLessonTitle("");
    setLessonDescription("");
    setLessonVideoName("");
    setLessonVideoFile(null);
  };

  // =========================================================================
  // 4. XỬ LÝ CHÍNH TRANG EDIT
  // =========================================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("access_token");

      if (!token) { setError("Không tìm thấy mã xác thực."); setIsSaving(false); return; }
      if (!courseId) { setError("Không tìm thấy mã khóa học."); setIsSaving(false); return; }

      let thumbnailUrl = courseData.thumbnail;
      if (thumbnailFile) {
        const uploadResult = await uploadCourseThumbnailAPI(thumbnailFile, token);
        thumbnailUrl = uploadResult.url; 
        setThumbnailFile(null);
      }

      const pendingNewLessons = lessons.filter(
        (lesson) => lesson.isNew && lesson.videoFile
      );

      for (let index = 0; index < pendingNewLessons.length; index += 1) {
        const lesson = pendingNewLessons[index];
        const lessonRes = await createLessonAPI(
          {
            course_id: courseId,
            title: lesson.title,
            order_index: lessons.length + index + 1,
          },
          token
        );
        const lessonId = lessonRes?.id;
        if (!lessonId) {
          throw new Error("Không thể khởi tạo bài học mới.");
        }

        const presign = await getPresignedUrlAPI(
          courseId,
          lesson.videoFileName,
          lesson.videoFile.type,
          token
        );

        await uploadVideoToGCS(presign.upload_url, lesson.videoFile);
        const duration = await getVideoDuration(lesson.videoFile);

        await saveVideoToDBAPI(
          courseId,
          {
            lesson_id: lessonId,
            video_url: presign.file_url,
            storage_path: presign.storage_path,
            thumbnail_url: thumbnailUrl || undefined,
            title: lesson.title,
            description: lesson.description,
            file_name: lesson.videoFileName,
            duration,
          },
          token
        );
      }

      const updateData = {
        title: courseData.title,
        category: courseData.category,
        description: courseData.description,
        image: thumbnailUrl,
      };

      await updateInstructorCourseAPI(courseId, updateData, token);

      const shouldShowQCAlert = courseData.hasNewUpdateForQC;

      setIsSaving(false);
      
      alert(
        "Lưu thay đổi thành công.\n" +
          (shouldShowQCAlert
            ? "Lưu ý: Quản trị viên sẽ tiến hành kiểm duyệt chất lượng nội dung cập nhật mới trước khi hệ thống ghi nhận chính thức."
            : "")
      );

      if (shouldShowQCAlert) {
        setCourseData((prev) => ({
          ...prev,
          hasNewUpdateForQC: false,
        }));
      }

    } catch (err) {
      console.error("Lỗi khi lưu khóa học:", err);
      setError(err.response?.data?.detail || "Lưu dữ liệu thất bại.");
      setIsSaving(false);
      alert("" + (err.response?.data?.detail || "Thao tác lưu không thành công."));
    }
  };

  const handleDeleteLesson = (lessonId) => {
    if (courseData.status === "PUBLISHED" && courseData.studentsEnrolled > 0) {
      const confirmHide = window.confirm(
        `CẢNH BÁO BẢO VỆ DỮ LIỆU:\n\n` +
        `Khóa học này hiện đang có ${courseData.studentsEnrolled} học viên tham gia. ` +
        `Việc xóa bài học sẽ làm gián đoạn tiến trình học tập của họ.\n\n` +
        `Hệ thống sẽ chuyển trạng thái bài học thành Ẩn (Ngừng xuất bản) ` +
        `đối với học viên mới thay vì xóa vĩnh viễn.\n\n` +
        `Xác nhận tiếp tục?`
      );

      if (confirmHide) {
        setLessons(
          lessons.map((lesson) =>
            lesson.id === lessonId
              ? { ...lesson, isPublished: false }
              : lesson
          )
        );

        setCourseData((prev) => ({
          ...prev,
          hasNewUpdateForQC: true,
        }));
      }
    }
    else if (courseData.studentsEnrolled === 0 || courseData.status !== "PUBLISHED") {
      const confirmDelete = window.confirm("Xác nhận: Bạn có chắc chắn muốn xóa vĩnh viễn bài học này?");

      if (confirmDelete) {
        setLessons(lessons.filter((lesson) => lesson.id !== lessonId));
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file); 
      const previewUrl = URL.createObjectURL(file); 
      setCourseData({ ...courseData, thumbnail: previewUrl });
    }
  };

  // =========================================================================
  // 5. TABS MENU
  // =========================================================================
  const tabs = [
    { id: "basic", label: "Thông tin cơ bản", icon: faInfoCircle },
    { id: "media", label: "Hình ảnh & Video", icon: faImage },
    { id: "curriculum", label: "Giáo trình khóa học", icon: faList },
    {
      id: "danger",
      label: "Khu vực nguy hiểm",
      icon: faExclamationTriangle,
      isDanger: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-fade-slide-up relative">
      {/*ERROR DISPLAY */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700 font-semibold">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-sm mt-2 font-bold"
          >
            Đóng
          </button>
        </div>
      )}

      {/* LOADING SPINNER */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-600 animate-spin" />
            <p className="text-slate-700 font-semibold">Đang tải dữ liệu khóa học...</p>
          </div>
        </div>
      )}

      {!isLoading && (
        <>
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
                    Lưu lần cuối: Vài giây trước
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
                    Tên khóa học
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
                    <option value="">Chọn danh mục</option>
                    {COURSE_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
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
                Hình ảnh & Đa phương tiện
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Hình ảnh thu hút sẽ giúp khóa học của bạn nổi bật hơn trên nền tảng EduSync.
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
                        Định dạng hỗ trợ: JPG, PNG. Tỷ lệ khuyến nghị: 16:9.
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
                        <FontAwesomeIcon icon={faUpload} /> Tải lên ảnh mới
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GIÁO TRÌNH KHÓA HỌC */}
          {activeTab === "curriculum" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-fade-slide-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
                    Giáo trình khóa học
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Hệ thống hỗ trợ kéo thả để sắp xếp lại thứ tự bài học.
                  </p>
                </div>
                <button
                  onClick={openAddLessonModal}
                  className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2 text-sm active:scale-95"
                >
                  <FontAwesomeIcon icon={faPlus} /> Thêm bài học
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
                        
                        {!lesson.isPublished ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                            <FontAwesomeIcon icon={faEyeSlash} /> Đã ẩn
                          </span>
                        ) : !lesson.isApproved ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                            <FontAwesomeIcon icon={faClockRotateLeft} /> Chờ kiểm duyệt
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            <FontAwesomeIcon icon={faCheckCircle} /> Đã xuất bản
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="w-8 h-8 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Chỉnh sửa tên"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="w-8 h-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Xóa / Ẩn bài học"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: KHU VỰC NGUY HIỂM */}
          {activeTab === "danger" && (
            <div className="bg-white rounded-3xl border border-red-200 shadow-sm p-6 sm:p-8 animate-fade-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                </div>
                <h2 className="text-2xl font-extrabold text-red-700">
                  Khu vực nguy hiểm
                </h2>
              </div>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-red-50/50 border border-red-100 rounded-2xl">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      Ngừng xuất bản khóa học
                    </h4>
                    <p className="text-sm text-slate-600 mt-1 max-w-lg leading-relaxed">
                      Khóa học sẽ bị ẩn khỏi hệ thống tìm kiếm. Học viên mới không thể đăng ký, nhưng học viên cũ vẫn có thể tiếp tục học bình thường.
                    </p>
                  </div>
                  <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm shrink-0">
                    Ngừng xuất bản
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-red-50/50 border border-red-100 rounded-2xl">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      Xóa vĩnh viễn khóa học
                    </h4>
                    <p className="text-sm text-red-600/80 mt-1 max-w-lg leading-relaxed font-medium">
                      Khóa học này hiện có {courseData.studentsEnrolled} học viên. Hệ thống đã KHÓA tính năng xóa vĩnh viễn nhằm bảo vệ dữ liệu người dùng.
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
      {/* MODAL THÊM BÀI HỌC */}
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
                Thêm bài học mới
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
                    Tiêu đề bài học <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="Ví dụ: Bài 1 - Biến và Kiểu dữ liệu..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    disabled={isUploadingLesson}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Mô tả bài học (Tùy chọn)
                  </label>
                  <textarea
                    value={lessonDescription}
                    onChange={(e) => setLessonDescription(e.target.value)}
                    placeholder="Nhập mô tả tóm tắt nội dung bài học..."
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
                      onClick={(e) => e.stopPropagation()}
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
                            setLessonVideoFile(null);
                          }}
                          className="mt-2 text-xs text-red-500 hover:text-red-700 font-semibold underline"
                          disabled={isUploadingLesson}
                        >
                          Chọn video khác
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
                          Nhấp để tải lên video
                        </p>
                        <p className="text-xs mt-1">
                          Định dạng hỗ trợ: MP4, WebM, tối đa 2GB
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
                  "Lưu bài học"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default InstructorCourseEditPage;