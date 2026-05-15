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

import {
  fetchAdminCourseDetailAPI,
  updateCourseAPI,
  uploadCourseThumbnailAPI
} from "../../services/adminCourseAPI";
import toast from "../../utils/toast";

const THUMB_FALLBACK =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80";

const CATEGORY_MAP = {
  "Frontend Web Development": "frontend",
  "Backend Web Development": "backend",
  "Mobile Programming": "mobile",
  "AI & Machine Learning": "ai",
  "Data Analysis": "data_analysis",
  "Data Engineering": "data_engineer",
  "UI/UX Design": "uiux",
  "Business Analysis": "ba"
};

const CATEGORY_DISPLAY_MAP = {
  "frontend": "Frontend Web Development",
  "backend": "Backend Web Development",
  "mobile": "Mobile Programming",
  "ai": "AI & Machine Learning",
  "data_analysis": "Data Analysis",
  "data_engineer": "Data Engineering",
  "uiux": "UI/UX Design",
  "ba": "Business Analysis"
};

const CATEGORIES = Object.values(CATEGORY_DISPLAY_MAP);

const AdminEditCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // =========================================================================
  // QUẢN LÝ TRẠNG THÁI (STATE)
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
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const videoInputRef = useRef(null);

  // =========================================================================
  // TRUY XUẤT DỮ LIỆU
  // =========================================================================
  useEffect(() => {
    const loadCourse = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("Phiên đăng nhập đã hết hạn.");

        const data = await fetchAdminCourseDetailAPI(id, token);
        
        // Map category ID từ backend sang display name cho frontend
        const categoryDisplay = CATEGORY_DISPLAY_MAP[data.category] || CATEGORIES[0];

        setCourseData({
          title: data.title || "",
          description: data.description || "",
          category: categoryDisplay,
          price: data.price || 0,
          status: data.status || "published",
          thumbnail: data.thumbnail || "",
        });

        if (data.lessons) {
          const formattedLessons = data.lessons.map(lesson => ({
            id: lesson.id,
            originalName: lesson.file_name || "video_dinh_kem.mp4",
            size: lesson.size ? (lesson.size / (1024 * 1024)).toFixed(2) : "Không rõ",
            title: lesson.title,
            description: lesson.description || "",
            isExisting: true 
          }));
          setUploadedVideos(formattedLessons);
        }

      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu khóa học.");
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
      isExisting: false 
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
    if (window.confirm("Xác nhận gỡ bỏ bài giảng này khỏi giáo trình?")) {
      setUploadedVideos((prev) => prev.filter((video) => video.id !== videoId));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!courseData.title || !courseData.title.trim()) {
      toast.warning("Vui lòng nhập tên khóa học.");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Phiên đăng nhập đã hết hạn.");
        return;
      }

      let thumbnailUrl = courseData.thumbnail;

      // Upload thumbnail nếu có file mới
      if (thumbnailFile) {
        try {
          const uploadResult = await uploadCourseThumbnailAPI(thumbnailFile, token);
          thumbnailUrl = uploadResult.url;
        } catch (uploadErr) {
          toast.warning("Không thể tải ảnh thumbnail. Đang sử dụng ảnh cũ.");
        }
      }

      // Map category display name sang category ID cho backend
      const categoryId = CATEGORY_MAP[courseData.category] || "frontend";

      // Chuẩn bị payload
      const payload = {
        title: courseData.title.trim(),
        description: courseData.description.trim(),
        category: categoryId,
        price: parseFloat(courseData.price) || 0,
        status: courseData.status,
        image: thumbnailUrl,
      };

      await updateCourseAPI(id, payload, token);

      toast.success("Hệ thống: Cập nhật thông tin khóa học thành công.");
      navigate(`/admin/courses/${id}`, { state: { refresh: Date.now() } });
    } catch (err) {
      toast.error(err.message || "Lỗi: Không thể lưu thay đổi. Vui lòng kiểm tra lại kết nối server.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-400">
        <FontAwesomeIcon icon={faSpinner} className="text-5xl animate-spin text-blue-600 mb-6" />
        <p className="font-bold text-lg tracking-wide animate-pulse">Đang khởi tạo trình chỉnh sửa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-600 p-8 text-center">
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl text-red-400 mb-6" />
        <p className="font-bold text-red-600 mb-6 text-xl">{error}</p>
        <button onClick={() => navigate(-1)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
          Quay lại
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
            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại khóa học
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl shrink-0">
              <FontAwesomeIcon icon={faShieldAlt} className="text-2xl text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Chỉnh sửa khóa học
              </h1>
              <p className="text-slate-400 font-medium mt-1">
                Mã khóa học: <span className="text-blue-300 font-bold">{id}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-8 lg:px-12 -mt-12 relative z-20 flex-1 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ================= CỘT TRÁI (THÔNG TIN CHÍNH & GIÁO TRÌNH) ================= */}
          <div className="w-full lg:flex-1 space-y-8">
            
            {/* KHỐI 1: THÔNG TIN CHUNG */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-8 lg:p-10">
              <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faInfoCircle} />
                </span>
                Thông tin cơ bản
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    Tên khóa học
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={courseData.title}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400"
                    placeholder="Ví dụ: Lập trình ReactJS nâng cao 2026..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Danh mục
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faTag} className="absolute left-5 top-4 text-slate-400" />
                      <select
                        name="category"
                        value={courseData.category}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold focus:outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                      Trạng thái hiển thị
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faEye} className="absolute left-5 top-4 text-slate-400" />
                      <select
                        name="status"
                        value={courseData.status}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-5 py-3.5 border rounded-2xl font-bold focus:outline-none transition-all cursor-pointer appearance-none ${
                          courseData.status === "published" ? "bg-emerald-50 border-emerald-200 text-emerald-700 focus:border-emerald-500" :
                          courseData.status === "pending" ? "bg-amber-50 border-amber-200 text-amber-700 focus:border-amber-500" :
                          courseData.status === "suspended" ? "bg-red-50 border-red-200 text-red-700 focus:border-red-500" :
                          "bg-slate-50 border-slate-200 text-slate-700 focus:border-slate-500"
                        }`}
                      >
                        <option value="published">Đã xuất bản (Công khai)</option>
                        <option value="pending">Chờ kiểm duyệt</option>
                        <option value="draft">Bản nháp</option>
                        <option value="suspended">Đang đình chỉ (Ẩn)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    Mô tả khóa học
                  </label>
                  <textarea
                    name="description"
                    rows="6"
                    value={courseData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả chi tiết nội dung và những gì học viên sẽ đạt được..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-medium focus:outline-none focus:border-blue-500 transition-all resize-y leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* KHỐI 2: QUẢN LÝ GIÁO TRÌNH */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-8 lg:p-10">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faListUl} />
                </span>
                Giáo trình khóa học
              </h2>

              <p className="text-slate-500 text-sm mb-6">
                Với quyền Quản trị viên, bạn có thể kiểm soát toàn bộ nội dung khóa học. Tải lên video bài giảng mới hoặc chỉnh sửa các bài hiện có bên dưới.
              </p>

              <div 
                onClick={handleVideoUploadClick} 
                className="border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400 rounded-3xl p-8 text-center cursor-pointer transition-all group mb-8 flex flex-col items-center justify-center"
              >
                <input type="file" multiple accept="video/*" className="hidden" ref={videoInputRef} onChange={handleVideoFileChange} />
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <FontAwesomeIcon icon={faCloudArrowUp} className="text-3xl text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Kéo và thả video bài giảng vào đây</h3>
                <p className="text-slate-500 text-xs">Hỗ trợ định dạng MP4, WebM. Dung lượng tối đa 5GB/file.</p>
              </div>

              {uploadedVideos.length > 0 ? (
                <div className="space-y-6">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
                    Danh sách bài học ({uploadedVideos.length})
                  </h3>
                  
                  {uploadedVideos.map((video, index) => (
                    <div key={video.id} className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                        <div className={`text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider ${video.isExisting ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-700"}`}>
                          {video.isExisting ? `Bài học hiện tại ${index + 1}` : `Video mới tải lên ${index + 1}`}
                        </div>
                        <button 
                          onClick={() => removeVideo(video.id)} 
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-xl flex items-center justify-center transition-colors" 
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <FontAwesomeIcon icon={faVideo} className="text-lg" />
                        </div>
                        <div className="min-w-0 flex-1 w-full pt-1">
                          <p className="text-sm font-bold text-slate-800 truncate mb-0.5">{video.originalName}</p>
                          <p className="text-xs text-slate-500 font-medium">Dung lượng: {video.size} MB</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Tiêu đề bài học</label>
                          <input 
                            type="text" 
                            value={video.title} 
                            onChange={(e) => handleVideoDetailChange(video.id, "title", e.target.value)} 
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors text-slate-800 font-bold text-sm" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Mô tả ngắn (Tùy chọn)</label>
                          <textarea 
                            rows="2" 
                            value={video.description} 
                            onChange={(e) => handleVideoDetailChange(video.id, "description", e.target.value)} 
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors text-slate-700 font-medium text-sm resize-y"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">Chưa có bài học nào. Hãy tải lên video để bắt đầu xây dựng giáo trình.</p>
                </div>
              )}
            </div>
          </div>

          {/* ================= CỘT PHẢI (MEDIA & GIÁ CẢ) ================= */}
          <div className="w-full lg:w-[400px] xl:w-[420px] space-y-8 shrink-0 lg:sticky lg:top-8">
            
            {/* ẢNH ĐẠI DIỆN KHÓA HỌC */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-8">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faImage} />
                </span>
                Hình ảnh khóa học
              </h2>
              
              <div 
                onClick={() => fileInputRef.current.click()}
                className="relative group border-2 border-dashed border-slate-300 rounded-3xl overflow-hidden bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all cursor-pointer aspect-video flex flex-col items-center justify-center"
              >
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                
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
                      <span className="font-bold">Thay đổi hình ảnh</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 text-slate-500">
                    <FontAwesomeIcon icon={faCloudArrowUp} className="text-4xl mb-3" />
                    <p className="font-bold">Nhấn để tải ảnh lên</p>
                    <p className="text-xs mt-1 opacity-70">Khuyến nghị: 1280x720 (16:9)</p>
                  </div>
                )}
              </div>
            </div>

            {/* CHIẾN LƯỢC GIÁ */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-8">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faDollarSign} />
                </span>
                Chiến lược giá bán
              </h2>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Giá niêm yết (VND)
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-4 text-emerald-600 font-black text-lg">₫</span>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="1000"
                    value={courseData.price}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-5 py-4 bg-emerald-50/30 border border-emerald-200 rounded-2xl text-emerald-900 font-black text-2xl focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
                  <p className="text-xs text-blue-800 font-medium leading-relaxed">
                    <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                    Với quyền quản trị, bạn có thể ghi đè giá của giảng viên. Để giá <strong>0</strong> nếu muốn khóa học này miễn phí.
                  </p>
                </div>
              </div>
            </div>

            {/* KHU VỰC NGUY HIỂM */}
            <div className="bg-white rounded-3xl border border-rose-100 shadow-xl shadow-rose-200/20 p-6 sm:p-8">
              <h2 className="text-xl font-black text-rose-700 mb-2 flex items-center gap-3">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                Khu vực nguy hiểm
              </h2>
              <p className="text-sm text-slate-500 mb-6">Các hành động này sẽ ảnh hưởng vĩnh viễn đến khóa học.</p>
              
              <button 
                onClick={() => toast.info('Hệ thống: Tính năng xóa hiện đã được tạm khóa trong bản demo.')}
                className="w-full py-3.5 bg-white border-2 border-rose-200 text-rose-600 font-bold rounded-2xl hover:bg-rose-50 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faTrash} /> Xóa khóa học này
              </button>
            </div>
          </div>
        </div>

        {/* NÚT THAO TÁC CUỐI TRANG */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex justify-end gap-4 w-full">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3.5 bg-white text-slate-600 font-bold rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-10 py-3.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSaving ? <FontAwesomeIcon icon={faSpinner} spin className="text-lg" /> : <FontAwesomeIcon icon={faSave} className="text-lg" />}
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminEditCourse;