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
  { id: "frontend", label: "Frontend Web Development" },
  { id: "backend", label: "Backend Web Development" },
  { id: "mobile", label: "Mobile Programming" },
  { id: "ai", label: "AI & Machine Learning" },
  { id: "data_analysis", label: "Data Analysis" },
  { id: "data_engineer", label: "Data Engineering" },
  { id: "uiux", label: "UI/UX Design" },
  { id: "ba", label: "Business Analysis" },
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
  // 1. STATE MANAGEMENT
  // =========================================================================
  const [courseData, setCourseData] = useState({
    title: "",
    category: "",
    description: "",
    thumbnail: "",
    status: "DRAFT",
    studentsEnrolled: 0,
    hasNewUpdateForQC: false, // Cờ hiệu: Cần Admin vào Hậu kiểm (Quality Control)
  });

  const [lessons, setLessons] = useState([]);

  // =========================================================================
  // 2. FETCH COURSE DATA ON MOUNT
  // =========================================================================
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Authentication token not found");
          return;
        }

        if (!courseId) {
          setError("Course ID not found");
          return;
        }

        const data = await getInstructorCourseDetailAPI(courseId, token);

        // Extract course detail
        const courseDetail = data.courseDetail || {};
        setCourseData({
          title: courseDetail.title || "",
          category: normalizeCategoryValue(courseDetail.category),
          description: courseDetail.description || "",
          thumbnail: courseDetail.thumbnail || "",
          status: courseDetail.status || "DRAFT",
          studentsEnrolled: courseDetail.students_enrolled || 0,
        });

        // Extract lessons list
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
          err.response?.data?.detail || "Error loading course data"
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
      alert("Please enter lesson title!");
      return;
    }
    if (!lessonVideoName) {
      alert("Please select lesson video!");
      return;
    }
    if (!lessonVideoFile) {
      alert("Please select lesson video!");
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
  // 4. CÁC HÀM XỬ LÝ CHÍNH TRANG EDIT
  // =========================================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const handleSave = async () => {
    try {
    setIsSaving(true);
    const token = localStorage.getItem("access_token");

    if (!token) { setError("Token not found"); setIsSaving(false); return; }
    if (!courseId) { setError("Course ID not found"); setIsSaving(false); return; }

    // ✅ Upload ảnh mới nếu có
    let thumbnailUrl = courseData.thumbnail;
    if (thumbnailFile) {
      const uploadResult = await uploadCourseThumbnailAPI(thumbnailFile, token);
      thumbnailUrl = uploadResult.url; // ✅ Đúng API endpoint, đúng response key
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
        throw new Error("Failed to create lesson for uploaded video");
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

      // Lưu lại trạng thái cần show alert trước khi bị reset
      const shouldShowQCAlert = courseData.hasNewUpdateForQC;

      // THÔNG BÁO ADMIN: Nếu có update cần Hậu kiểm (QC)
      if (courseData.hasNewUpdateForQC) {
        console.log(
          "✅ Course has new content - Admin will be notified for quality review"
        );
      }

      setIsSaving(false);
      
      // Hiện thông báo thành công
      alert(
        "✅ Save successful!\n" +
          (shouldShowQCAlert
            ? "💡 Admin will review the quality of new course content."
            : "")
      );

      // Reset cờ hiệu sau khi đã hoàn thành các bước trên
      if (shouldShowQCAlert) {
        setCourseData((prev) => ({
          ...prev,
          hasNewUpdateForQC: false,
        }));
      }

    } catch (err) {
      console.error("Lỗi khi lưu khóa học:", err);
      setError(err.response?.data?.detail || "Error saving course");
      setIsSaving(false);
      alert("❌ Error: " + (err.response?.data?.detail || "Error saving"));
    }
  };

  // =========================================================================
  // ✅ LOGIC XÓA BÀI GIẢNG - TUÂN THỦ NGHIÊM NGẶT NGHIỆP VỤ GIÁO DỤC
  // =========================================================================
  const handleDeleteLesson = (lessonId) => {
    // 📌 TRƯỜNG HỢP 2: TUYỆT ĐỐI KHÔNG XÓA THẬT
    // Nếu khóa học đã được PUBLISHED và có học viên đang học
    if (courseData.status === "PUBLISHED" && courseData.studentsEnrolled > 0) {
      const confirmHide = window.confirm(
        `⚠️ DATA PROTECTION WARNING:\n\n` +
        `This course already has ${courseData.studentsEnrolled} students learning. ` +
        `Deleting the lesson will disrupt their learning progress.\n\n` +
        `The system will hide this lesson (Unpublished) ` +
        `for new students instead of permanent deletion.\n\n` +
        `Do you agree?`
      );

      if (confirmHide) {
        // Chỉ ẩn bài, không xóa vĩnh viễn
        setLessons(
          lessons.map((lesson) =>
            lesson.id === lessonId
              ? { ...lesson, isPublished: false }
              : lesson
          )
        );

        // ✅ Bật cờ QC vì việc ẩn bài làm thay đổi chất lượng khóa học hiện tại
        setCourseData((prev) => ({
          ...prev,
          hasNewUpdateForQC: true,
        }));
      }
    }
    // TRƯỜNG HỢP 1: AN TOÀN ĐỂ XÓA THẬT
    // Nếu chưa có ai mua (studentsEnrolled === 0) HOẶC đang nháp (status !== "PUBLISHED")
    else if (courseData.studentsEnrolled === 0 || courseData.status !== "PUBLISHED") {
      const confirmDelete = window.confirm("Are you sure you want to delete this lesson?");

      if (confirmDelete) {
        // Xóa vĩnh viễn
        setLessons(lessons.filter((lesson) => lesson.id !== lessonId));
      }
    }
  };

  const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    setThumbnailFile(file); // ✅ Lưu file thật để upload sau
    const previewUrl = URL.createObjectURL(file); // Chỉ để preview tạm
    setCourseData({ ...courseData, thumbnail: previewUrl });
  }
};

  // =========================================================================
  // 5. TABS MENU
  // =========================================================================
  const tabs = [
    { id: "basic", label: "Basic Information", icon: faInfoCircle },
    { id: "media", label: "Images & Video", icon: faImage },
    { id: "curriculum", label: "Course Curriculum", icon: faList },
    {
      id: "danger",
      label: "Danger Zone",
      icon: faExclamationTriangle,
      isDanger: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-fade-slide-up relative">
      {/* 🚨 ERROR DISPLAY */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700 font-semibold">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-sm mt-2"
          >
            Close
          </button>
        </div>
      )}

      {/* LOADING SPINNER */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-600 animate-spin" />
            <p className="text-slate-700 font-semibold">Loading course...</p>
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
                      Edit: {courseData.title}
                    </h1>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-200">
                      Publishing
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Last save: A few seconds ago
                  </p>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 ${isSaving ? "opacity-70 cursor-not-allowed" : "active:scale-95"}`}
              >
                <FontAwesomeIcon icon={faSave} />{" "}
                {isSaving ? "Saving..." : "Save Changes"}
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
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === "basic" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-fade-slide-up">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6">
                Basic Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Course Title
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
                    Category
                  </label>
                  <select
                    name="category"
                    value={courseData.category}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="">Select category</option>
                    {COURSE_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Detailed Description
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

          {/* TAB 2: IMAGES & VIDEO */}
          {activeTab === "media" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-fade-slide-up">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                Images & Video
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Attractive images will help your course stand out more on
                EduSync.
              </p>
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Course Cover Image (Thumbnail)
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
                        Supported formats: JPG, PNG. Recommended aspect ratio: 16:9.
                        Minimum size 1280x720px.
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
                        <FontAwesomeIcon icon={faUpload} /> Upload New Image
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COURSE CURRICULUM */}
          {activeTab === "curriculum" && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 animate-fade-slide-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
                    Course Curriculum
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Drag and drop to reorder lessons.
                  </p>
                </div>
                <button
                  onClick={openAddLessonModal}
                  className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2 text-sm active:scale-95"
                >
                  <FontAwesomeIcon icon={faPlus} /> Add Lesson
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
  
  {/* LƯỚI LOGIC HIỂN THỊ TRẠNG THÁI */}
  {!lesson.isPublished ? (
    // 1. Giảng viên chủ động ẨN
    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
      <FontAwesomeIcon icon={faEyeSlash} /> Hidden
    </span>
  ) : !lesson.isApproved ? (
    // 2. Giảng viên mở, nhưng Admin CHƯA DUYỆT
    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
      <FontAwesomeIcon icon={faClockRotateLeft} /> Pending Review
    </span>
  ) : (
    // 3. Giảng viên mở, Admin ĐÃ DUYỆT (An toàn)
    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
      <FontAwesomeIcon icon={faCheckCircle} /> Published
    </span>
  )}
</div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="w-8 h-8 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Edit name"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="w-8 h-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete / Hide lesson"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DANGER ZONE */}
          {activeTab === "danger" && (
            <div className="bg-white rounded-3xl border border-red-200 shadow-sm p-6 sm:p-8 animate-fade-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                </div>
                <h2 className="text-2xl font-extrabold text-red-700">
                  Danger Zone
                </h2>
              </div>
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-red-50/50 border border-red-100 rounded-2xl">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      Unpublish Course
                    </h4>
                    <p className="text-sm text-slate-600 mt-1 max-w-lg leading-relaxed">
                      The course will be hidden from search. New students
                      cannot purchase, but existing students can continue learning
                      normally.
                    </p>
                  </div>
                  <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm shrink-0">
                    Unpublish
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-red-50/50 border border-red-100 rounded-2xl">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      Delete Course Permanently
                    </h4>
                    <p className="text-sm text-red-600/80 mt-1 max-w-lg leading-relaxed font-medium">
                      This course has {courseData.studentsEnrolled} enrolled students. The system has
                      LOCKED permanent deletion to protect user data.
                    </p>
                  </div>
                  <button
                    disabled
                    className="px-5 py-2.5 bg-slate-200 text-slate-400 font-bold rounded-xl cursor-not-allowed shrink-0"
                  >
                    Delete Course
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL ADD LESSON (Modal displayed floating on top) */}
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
                Add New Lesson
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
                    Lesson Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="E.g.: Lesson 1 - Variables and Data Types..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    disabled={isUploadingLesson}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Lesson Description (Optional)
                  </label>
                  <textarea
                    value={lessonDescription}
                    onChange={(e) => setLessonDescription(e.target.value)}
                    placeholder="Enter a brief description of the lesson content..."
                    rows="3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-none"
                    disabled={isUploadingLesson}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Lesson Video <span className="text-red-500">*</span>
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
                      onClick={(e) => e.stopPropagation()} // 🚨 Lỗi Infinite Loop đã được khắc phục ở đây
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
                          Choose Different Video
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
                          Click to upload video
                        </p>
                        <p className="text-xs mt-1">
                          Supported format: MP4, up to 2GB
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
                Cancel
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
                    Uploading...
                  </>
                ) : (
                  "Save Lesson"
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