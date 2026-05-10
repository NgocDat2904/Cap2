import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSave,
  faSpinner,
  faImage,
  faInfoCircle,
  faDollarSign,
  faTag,
  faEye,
  faShieldAlt,
  faCloudArrowUp,
  faExclamationTriangle,
  faTrash,
  faVideo,
  faListUl,
  faTimes
} from "@fortawesome/free-solid-svg-icons";

// Giả sử có API này, Backend cần cung cấp endpoint lấy và cập nhật thông tin
import { fetchAdminCourseDetailAPI } from "../../services/adminCourseAPI";

const THUMB_FALLBACK =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80";

const CATEGORIES = [
  "Frontend Web Development",
  "Backend Web Development",
  "Mobile Programming",
  "AI & Machine Learning",
  "Data Analysis",
  "Data Engineering",
  "UI/UX Design",
  "Business Analysis"
];

const AdminEditCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    price: 0,
    status: "",
    thumbnail: "",
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const fileInputRef = useRef(null);
  
  // ✅ MỚI THÊM: State quản lý video/bài giảng
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const videoInputRef = useRef(null);

  // =========================================================================
  // FETCH DATA
  // =========================================================================
  useEffect(() => {
    const loadCourse = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("Missing session token.");

        // Gọi API lấy thông tin chi tiết để edit
        const data = await fetchAdminCourseDetailAPI(id, token);
        
        setCourseData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || CATEGORIES[0],
          price: data.price || 0,
          status: data.status || "published",
          thumbnail: data.thumbnail || "",
        });

        // ✅ Giả lập nạp sẵn danh sách video cũ từ backend vào state
        if (data.lessons) {
          const formattedLessons = data.lessons.map(lesson => ({
            id: lesson.id,
            originalName: lesson.file_name || "video_file.mp4",
            size: lesson.size ? (lesson.size / (1024 * 1024)).toFixed(2) : "Unknown",
            title: lesson.title,
            description: lesson.description || "",
            isExisting: true // Đánh dấu là video cũ đã có trên hệ thống
          }));
          setUploadedVideos(formattedLessons);
        }

      } catch (err) {
        setError(err.message || "Failed to load course data.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) loadCourse();
  }, [id]);

  // =========================================================================
  // XỬ LÝ FORM & LƯU
  // =========================================================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCourseData((prev) => ({ ...prev, thumbnail: previewUrl }));
    }
  };

  // ✅ MỚI THÊM: Logic xử lý Video
  const handleVideoUploadClick = () => videoInputRef.current.click();

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
      isExisting: false // Video mới thêm vào
    }));

    setUploadedVideos((prev) => [...prev, ...newVideos]);
    e.target.value = null;
  };

  const handleVideoDetailChange = (videoId, field, value) => {
    setUploadedVideos((prev) =>
      prev.map((video) =>
        video.id === videoId ? { ...video, [field]: value } : video,
      ),
    );
  };

  const removeVideo = (videoId) => {
    if (window.confirm("Are you sure you want to remove this lesson?")) {
      setUploadedVideos((prev) => prev.filter((video) => video.id !== videoId));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 🚨 GỌI API LƯU TẠI ĐÂY (Bao gồm cả text, ảnh và mảng uploadedVideos)
      // await updateAdminCourseAPI(id, courseData, uploadedVideos, token);
      
      // Giả lập thời gian call API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert("Course updated successfully!");
      navigate(`/admin/courses/${id}`);
    } catch (err) {
      alert("Failed to update course: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================================
  // RENDER UI
  // =========================================================================
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-400">
        <FontAwesomeIcon icon={faSpinner} className="text-5xl animate-spin text-blue-600 mb-6" />
        <p className="font-bold text-lg tracking-wide animate-pulse">Initializing Editor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-600 p-8 text-center">
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl text-red-400 mb-6" />
        <p className="font-bold text-red-600 mb-6 text-xl">{error}</p>
        <button onClick={() => navigate(-1)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#f4f7fb] min-h-screen font-sans relative flex flex-col">
      
      {/* ================= HEADER SECTION ================= */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 pb-24 pt-8 px-4 sm:px-8 lg:px-12 relative">
        <div className="max-w-[1400px] mx-auto relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-wider"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Course
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl shrink-0">
              <FontAwesomeIcon icon={faShieldAlt} className="text-2xl text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Edit Course
              </h1>
              <p className="text-slate-400 font-medium mt-1">
                Course ID: <span className="text-blue-300 font-bold">{id}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 lg:px-12 -mt-12 relative z-20 flex-1 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ================= CỘT TRÁI (MAIN INFO & CURRICULUM) ================= */}
          <div className="w-full lg:flex-1 space-y-8">
            
            {/* KHỐI 1: THÔNG TIN CHUNG */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-8 lg:p-10 animate-fade-slide-up">
              <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faInfoCircle} />
                </span>
                General Details
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    Course Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={courseData.title}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    placeholder="E.g: Master ReactJS 2026..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Category
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faTag} className="absolute left-5 top-4 text-slate-400" />
                      <select
                        name="category"
                        value={courseData.category}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer appearance-none"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Visibility Status
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faEye} className="absolute left-5 top-4 text-slate-400" />
                      <select
                        name="status"
                        value={courseData.status}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-5 py-3.5 border rounded-2xl font-bold focus:outline-none focus:ring-4 transition-all cursor-pointer appearance-none ${
                          courseData.status === "published" ? "bg-emerald-50 border-emerald-200 text-emerald-700 focus:ring-emerald-500/20 focus:border-emerald-500" :
                          courseData.status === "pending" ? "bg-amber-50 border-amber-200 text-amber-700 focus:ring-amber-500/20 focus:border-amber-500" :
                          courseData.status === "suspended" ? "bg-red-50 border-red-200 text-red-700 focus:ring-red-500/20 focus:border-red-500" :
                          "bg-slate-50 border-slate-200 text-slate-700 focus:ring-slate-500/20 focus:border-slate-500"
                        }`}
                      >
                        <option value="published">Published (Active)</option>
                        <option value="pending">Pending Review</option>
                        <option value="draft">Draft</option>
                        <option value="suspended">Suspended (Hidden)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    Course Description
                  </label>
                  <textarea
                    name="description"
                    rows="6"
                    value={courseData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of what students will learn..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-y leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* KHỐI 2: QUẢN LÝ GIÁO TRÌNH (CURRICULUM) */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-8 lg:p-10 animate-fade-slide-up" style={{ animationDelay: "0.1s" }}>
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faListUl} />
                </span>
                Course Curriculum
              </h2>

              <p className="text-slate-500 text-sm mb-6">
                As an Admin, you have full control over the course content. You can upload new video lessons or modify existing ones below.
              </p>

              {/* Upload Zone */}
              <div 
                onClick={handleVideoUploadClick} 
                className="border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400 rounded-3xl p-8 text-center cursor-pointer transition-all group mb-8 flex flex-col items-center justify-center"
              >
                <input type="file" multiple accept="video/*" className="hidden" ref={videoInputRef} onChange={handleVideoFileChange} />
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform group-hover:shadow-md">
                  <FontAwesomeIcon icon={faCloudArrowUp} className="text-3xl text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Drag & drop new videos here</h3>
                <p className="text-slate-500 text-xs">Supports MP4, WebM. Max 5GB/file.</p>
              </div>

              {/* Danh sách Video */}
              {uploadedVideos.length > 0 ? (
                <div className="space-y-6">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
                    Lessons ({uploadedVideos.length})
                  </h3>
                  
                  {uploadedVideos.map((video, index) => (
                    <div key={video.id} className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                      
                      {/* Bố cục header của từng video (Badge & Nút Xóa) */}
                      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                        <div className={`text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider ${video.isExisting ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-700"}`}>
                          {video.isExisting ? `Existing Lesson ${index + 1}` : `New Upload ${index + 1}`}
                        </div>
                        <button 
                          onClick={() => removeVideo(video.id)} 
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-xl flex items-center justify-center transition-colors" 
                          title="Delete lesson"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                      
                      {/* Chi tiết File */}
                      <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
                          <FontAwesomeIcon icon={faVideo} className="text-lg" />
                        </div>
                        <div className="min-w-0 flex-1 w-full pt-1">
                          <p className="text-sm font-bold text-slate-800 truncate mb-0.5" title={video.originalName}>
                            {video.originalName}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">Size: {video.size} MB</p>
                        </div>
                      </div>
                      
                      {/* Form nhập liệu của Video */}
                      <div className="grid grid-cols-1 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Lesson Title</label>
                          <input 
                            type="text" 
                            value={video.title} 
                            onChange={(e) => handleVideoDetailChange(video.id, "title", e.target.value)} 
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-colors text-slate-800 font-bold text-sm" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Short description (Optional)</label>
                          <textarea 
                            rows="2" 
                            value={video.description} 
                            onChange={(e) => handleVideoDetailChange(video.id, "description", e.target.value)} 
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-colors text-slate-700 font-medium text-sm resize-y"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">No lessons available. Upload a video to start building curriculum.</p>
                </div>
              )}
            </div>

          </div>

          {/* ================= CỘT PHẢI (MEDIA & PRICING) ================= */}
          <div className="w-full lg:w-[400px] xl:w-[420px] space-y-8 shrink-0 lg:sticky lg:top-8">
            
            {/* THUMBNAIL UPLOAD ZONE */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-8 animate-fade-slide-up" style={{ animationDelay: "0.2s" }}>
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faImage} />
                </span>
                Course Media
              </h2>
              
              <div 
                onClick={() => fileInputRef.current.click()}
                className="relative group border-2 border-dashed border-slate-300 rounded-3xl overflow-hidden bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all cursor-pointer aspect-video flex flex-col items-center justify-center"
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                
                {courseData.thumbnail ? (
                  <>
                    <img
                      src={courseData.thumbnail}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = THUMB_FALLBACK; }}
                    />
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                      <FontAwesomeIcon icon={faCloudArrowUp} className="text-3xl mb-2" />
                      <span className="font-bold">Replace Image</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 text-slate-500 group-hover:text-indigo-600 transition-colors">
                    <FontAwesomeIcon icon={faCloudArrowUp} className="text-4xl mb-3" />
                    <p className="font-bold">Click or drag image here</p>
                    <p className="text-xs mt-1 opacity-70">1280x720 (16:9) recommended</p>
                  </div>
                )}
              </div>
            </div>

            {/* PRICING */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-8 animate-fade-slide-up" style={{ animationDelay: "0.3s" }}>
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faDollarSign} />
                </span>
                Pricing Strategy
              </h2>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Listed Price (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-4 text-emerald-600 font-black text-lg">$</span>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={courseData.price}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-5 py-4 bg-emerald-50/30 border border-emerald-200 rounded-2xl text-emerald-900 font-black text-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
                  <p className="text-xs text-blue-800 font-medium leading-relaxed">
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                    As an admin, you have the authority to override the instructor's price. Set to <strong>0</strong> to make it free.
                  </p>
                </div>
              </div>
            </div>

            {/* DANGER ZONE */}
            <div className="bg-white rounded-3xl border border-rose-100 shadow-xl shadow-rose-200/20 p-6 sm:p-8 animate-fade-slide-up" style={{ animationDelay: "0.4s" }}>
              <h2 className="text-xl font-black text-rose-700 mb-2 flex items-center gap-3">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                Danger Zone
              </h2>
              <p className="text-sm text-slate-500 mb-6">Irreversible actions for this course.</p>
              
              <button 
                onClick={() => alert('Delete action disabled in demo.')}
                className="w-full py-3.5 bg-white border-2 border-rose-200 text-rose-600 font-bold rounded-2xl hover:bg-rose-50 hover:border-rose-600 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faTrash} /> Delete Course
              </button>
            </div>

          </div>
        </div>

        {/* ================= NÚT LƯU Ở CUỐI TRANG ================= */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex justify-end gap-4 w-full">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3.5 bg-white text-slate-600 font-bold rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-10 py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? <FontAwesomeIcon icon={faSpinner} spin className="text-lg" /> : <FontAwesomeIcon icon={faSave} className="text-lg" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminEditCourse;