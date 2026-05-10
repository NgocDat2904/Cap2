import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave, faCloudArrowUp, faTimes, faVideo, faImage, faPaperPlane,
  faGraduationCap, faChevronDown, faSearch, faSpinner, faAlignLeft
} from "@fortawesome/free-solid-svg-icons";

// IMPORT 5 API SIÊU CẤP TỪ SERVICE 
import {
  createCourseAPI,
  getPresignedUrlAPI,
  uploadVideoToGCS,
  saveVideoToDBAPI,
  submitCourseAPI,
  uploadCourseThumbnailAPI,
  // createSectionAPI,
  createLessonAPI,
} from "../../services/courseAPI";

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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState(""); // Hiển thị trạng thái cho GV xem

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
    return /[<>{}`$]/.test(value) || /(script|drop\s+table|select\s+\*)/i.test(value);
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
      alert(`Video title must not exceed ${MAX_WORDS} words.`);
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
  // LOGIC ĐỈNH CAO: TẠO KHÓA -> XIN VÉ -> UP MÂY -> LƯU DB -> GỬI DUYỆT
  // =========================================================================
  const handleSaveCourse = async (actionType) => {
    const title = courseInfo.title.trim();
    const description = courseInfo.description.trim();

    if (!title) {
      alert("Course title is required.");
      return;
    }
    if (title.length < 5) {
      alert("Course title must be at least 5 characters long.");
      return;
    }
    if (countWords(title) > MAX_WORDS) {
      alert(`Course title must not exceed ${MAX_WORDS} words.`);
      return;
    }
    if (hasInvalidFormat(title)) {
      alert("Course title contains invalid format.");
      return;
    }
    if (!courseInfo.category) {
      alert("Please select a category.");
      return;
    }
    if (!description) {
      alert("Course description is required.");
      return;
    }
    if (!thumbnailFile) {
      alert("Course thumbnail is required.");
      return;
    }
    if (uploadedVideos.length === 0) {
      alert("Please add at least 1 video.");
      return;
    }
    for (const video of uploadedVideos) {
      const videoTitle = (video.title || "").trim();
      if (!videoTitle) {
        alert("Each video must have a title.");
        return;
      }
      if (countWords(videoTitle) > MAX_WORDS) {
        alert(`Video title "${video.originalName}" exceeds ${MAX_WORDS} words.`);
        return;
      }
      if (hasInvalidFormat(videoTitle)) {
        alert(`Video title "${video.originalName}" contains invalid format.`);
        return;
      }
    }
    if (actionType === "pending" && uploadedVideos.length === 0) {
      alert("The course must have at least 1 video to be submitted for approval.");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Session expired, please log in again!");

      let courseImageUrl = "";
      if (thumbnailFile) {
        setUploadProgressText("Uploading course cover image to Cloudinary...");
        const thumbRes = await uploadCourseThumbnailAPI(thumbnailFile, token);
        courseImageUrl = thumbRes.url || "";
      }

      // BƯỚC 1: TẠO KHÓA HỌC
      setUploadProgressText("Creating new course...");
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
          console.log("Duration:", duration);
          setUploadProgressText(`Processing Video ${i + 1}/${uploadedVideos.length}...`);

          // 2. Xin vé thông hành GCS
          const urlData = await getPresignedUrlAPI(newCourseId, video.file.name, video.file.type, token);
          if (!urlData?.upload_url || !urlData?.file_url) {
            throw new Error("Backend did not return upload_url / file_url — check API presign.");
          }

          // 3. Up thẳng lên mây Google
          setUploadProgressText(`Uploading Video ${i + 1} to the cloud... (Please wait)`);
          await uploadVideoToGCS(urlData.upload_url, video.file);

          // Mỗi video tạo một lesson rồi mới gắn video vào lesson đó
          const lessonRes = await createLessonAPI(
            {
              course_id: newCourseId,
              title: video.title || `Lesson ${i + 1}`,
              order_index: i + 1,
            },
            token,
          );
          const lessonId = lessonRes?.id;
          if (!lessonId) {
            throw new Error(`Failed to create lesson for video ${i + 1}`);
          }

          // 4. Báo Backend lưu Video vào Database (url = link công khai file trên GCS)
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
        alert(`Draft saved successfully! (Course ID: ${newCourseId})`);
      } else if (actionType === "pending") {
        setUploadProgressText("Sending course approval request...");
        await submitCourseAPI(newCourseId, token);

        alert("Course submitted successfully! Please wait for Admin pricing and publication.");
        // Reset form cho sạch sẽ
        setCourseInfo({ title: "", description: "", category: "", prerequisites: "", enableQA: true, visibility: "public" });
        setUploadedVideos([]);
        if (thumbnailPreview?.startsWith("blob:")) {
          URL.revokeObjectURL(thumbnailPreview);
        }
        setThumbnailPreview(null);
        setThumbnailFile(null);
      }

    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error("Error details:", error);
    } finally {
      setIsLoading(false);
      setUploadProgressText(""); // Xóa text trạng thái
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
      const confirmed = window.confirm("Discard current course draft and leave this page?");
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
    if (!courseInfo.category) return "Search and select a category...";
    const found = categories.find((c) => c.id === courseInfo.category);
    return found ? found.name : "Search and select a category...";
  };

  return (
    <div className="animate-fade-slide-up flex-1 p-6 sm:p-8 md:p-10 bg-slate-50 font-sans min-h-screen relative">

      {/* LỚP MÀN MỜ KHI ĐANG UPLOAD */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white">
          <FontAwesomeIcon icon={faSpinner} spin className="text-5xl text-blue-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">System is processing</h2>
          <p className="text-blue-200 animate-pulse">{uploadProgressText}</p>
          <p className="text-xs text-slate-400 mt-4 max-w-sm text-center">Please do not close the browser or refresh the page to avoid data loss!</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create New Course</h1>
        <p className="text-slate-500 mt-2 font-medium">Provide details and upload your course content.</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex bg-slate-200/70 p-1 rounded-xl w-full sm:w-auto">
            <button onClick={() => setActiveTab("basic")} className={`flex-1 sm:w-40 py-2.5 px-4 font-bold rounded-lg text-sm transition-all ${activeTab === "basic" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-slate-200/50"}`}>Basic Information</button>
            <button onClick={() => setActiveTab("settings")} className={`flex-1 sm:w-40 py-2.5 px-4 font-bold rounded-lg text-sm transition-all ${activeTab === "settings" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-slate-200/50"}`}>Settings</button>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={handleCancelCreate}
              disabled={isLoading}
              className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition duration-300 flex items-center gap-2 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSaveCourse("draft")}
              disabled={isLoading}
              className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition duration-300 flex items-center gap-2 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faSave} /> Save Draft
            </button>

            <button
              onClick={() => handleSaveCourse("pending")}
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-900 transition duration-300 shadow-md shadow-blue-700/20 active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faPaperPlane} /> Submit for Approval
            </button>
          </div>
        </div>

        {activeTab === "basic" && (
          <div className="space-y-6 animate-fade-slide-up">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/60">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">1</span> Course Information
              </h2>
              <div className="space-y-5">
                {/* TÊN KHÓA HỌC */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Course Title <span className="text-red-500">*</span></label>
                  <input type="text" name="title" placeholder="Ex: ReactJS Programming from Basic to Advanced..." value={courseInfo.title} onChange={handleCourseInfoChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-slate-700 font-medium" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* DANH MỤC */}
                  <div ref={dropdownRef} className="relative sm:col-span-2 md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                    <div onClick={() => setIsCategoryOpen(!isCategoryOpen)} className={`w-full px-4 py-3 bg-slate-50 border rounded-xl flex items-center justify-between cursor-pointer transition-colors ${isCategoryOpen ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 hover:border-blue-300"}`}>
                      <span className={`font-medium truncate ${courseInfo.category ? "text-slate-800" : "text-slate-400"}`}>{getSelectedCategoryName()}</span>
                      <FontAwesomeIcon icon={faChevronDown} className={`text-slate-400 transition-transform duration-300 ml-2 ${isCategoryOpen ? "rotate-180" : ""}`} />
                    </div>

                    {isCategoryOpen && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fade-slide-up">
                        <div className="p-3 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                          <div className="relative">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-slate-400 text-sm" />
                            <input type="text" placeholder="Search category..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} onClick={(e) => e.stopPropagation()} className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                          </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto p-2 scrollbar-hide">
                          {filteredCategories.length > 0 ? filteredCategories.map((cat) => (
                            <div key={cat.id} onClick={() => { setCourseInfo({ ...courseInfo, category: cat.id }); setIsCategoryOpen(false); setCategorySearch(""); }} className={`px-3 py-2.5 mb-1 rounded-lg cursor-pointer text-sm font-medium transition-colors ${courseInfo.category === cat.id ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-100"}`}>
                              {cat.name}
                            </div>
                          )) : <div className="p-4 text-center text-sm text-slate-500 font-medium">No categories found.</div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ✅ MÔ TẢ KHÓA HỌC ĐÃ ĐƯỢC THÊM VÀO ĐÂY */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                    Course Description
                  </label>
                  <textarea 
                    name="description" 
                    rows="4" 
                    placeholder="Provide a detailed description of what students will learn from this course..." 
                    value={courseInfo.description} 
                    onChange={handleCourseInfoChange} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-slate-700 font-medium resize-y"
                  ></textarea>
                </div>

                {/* ẢNH BÌA */}
                <div className="mt-4">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Course Thumbnail</label>
                  <div className="relative group border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => thumbnailInputRef.current.click()}>
                    <input type="file" ref={thumbnailInputRef} onChange={handleThumbnailChange} accept="image/*" className="hidden" />
                    {thumbnailPreview ? (
                      <div className="relative aspect-video w-full sm:w-1/2 mx-auto">
                        <img src={thumbnailPreview} alt="Course Thumbnail" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-semibold flex items-center gap-2"><FontAwesomeIcon icon={faImage} /> Change cover image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 px-6 text-center">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FontAwesomeIcon icon={faImage} className="text-2xl" />
                        </div>
                        <p className="text-slate-700 font-bold mb-1">Drag & drop image or click to browse</p>
                        <p className="text-slate-500 text-sm">Supported formats: PNG, JPG. Standard aspect ratio 16:9.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* KHỐI 2: UPLOAD VIDEO */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/60">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">2</span> Course Content (Video)
              </h2>
              <div onClick={handleVideoUploadClick} className="border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400 rounded-2xl p-10 text-center cursor-pointer transition-all group">
                <input type="file" multiple accept="video/*" className="hidden" ref={fileInputRef} onChange={handleVideoFileChange} />
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-105 transition-transform group-hover:shadow-md">
                  <FontAwesomeIcon icon={faCloudArrowUp} className="text-4xl text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Drag & drop videos here or click to browse files</h3>
                <p className="text-slate-500 text-sm mb-6">Supports MP4, WebM. Max 5GB/file.</p>
                <button className="px-6 py-2.5 bg-blue-100 text-blue-800 font-bold rounded-xl pointer-events-none group-hover:bg-blue-200 transition-colors">Select Video file</button>
              </div>

              {uploadedVideos.length > 0 && (
                <div className="mt-8 space-y-6">
                  <h3 className="font-bold text-slate-800 text-lg border-b border-slate-200 pb-3">Details of {uploadedVideos.length} lessons:</h3>
                  {uploadedVideos.map((video, index) => (
                    <div key={video.id} className="relative bg-slate-50 border border-slate-200 rounded-xl p-5 pt-8 shadow-sm animate-fade-slide-up">
                      <div className="absolute top-0 left-0 bg-blue-600 text-white font-bold text-xs px-3 py-1 rounded-br-lg rounded-tl-xl">Lesson {index + 1}</div>
                      <button onClick={() => removeVideo(video.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-600 hover:bg-red-50 w-8 h-8 rounded-lg flex items-center justify-center transition-colors" title="Delete video"><FontAwesomeIcon icon={faTimes} /></button>
                      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200/60">
                        <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 shrink-0"><FontAwesomeIcon icon={faVideo} /></div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-800 truncate">{video.originalName}</p>
                          <p className="text-xs text-slate-500 font-medium">Size: {video.size} MB</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">Lesson Title</label>
                          <input type="text" value={video.title} onChange={(e) => handleVideoDetailChange(video.id, "title", e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-slate-700 font-medium text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">Short description (Optional)</label>
                          <textarea rows="2" value={video.description} onChange={(e) => handleVideoDetailChange(video.id, "description", e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-slate-700 font-medium text-sm resize-y"></textarea>
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
                <FontAwesomeIcon icon={faGraduationCap} className="text-blue-600" /> Prerequisites
              </h2>
              <div>
                <textarea name="prerequisites" rows="3" value={courseInfo.prerequisites} onChange={handleCourseInfoChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors text-slate-700 font-medium resize-y"></textarea>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 sm:hidden flex flex-col gap-3">
          <button onClick={handleCancelCreate} disabled={isLoading} className="w-full flex justify-center items-center gap-2 px-6 py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition duration-300 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={() => handleSaveCourse("pending")} disabled={isLoading} className="w-full flex justify-center items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-900 transition duration-300 shadow-md shadow-blue-700/20 active:scale-95 disabled:opacity-50">
            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPaperPlane} />} Submit for Approval
          </button>
          <button onClick={() => handleSaveCourse("draft")} disabled={isLoading} className="w-full flex justify-center items-center gap-2 px-6 py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition duration-300 disabled:opacity-50">
            {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />} Save Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructorCreateCourse;