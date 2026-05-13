import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faUsers,
  faClock,
  faBookOpen,
  faPlayCircle,
  faCheckCircle,
  faEllipsisVertical,
  faCartShopping,
  faSpinner,
  faBoltLightning,
  faGraduationCap 
} from "@fortawesome/free-solid-svg-icons";
import { getCourseDetailAPI, enrollFreeCourseAPI, getMyCoursesAPI, getCourseProgressAPI } from "../../services/learnerCourseAPI"; 

const formatTimeAgo = (date) => {
  if (!date) return "Gần đây";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval} năm trước`;
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} tháng trước`;
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} ngày trước`;
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} giờ trước`;
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} phút trước`;
  return "Vừa xong";
};

const CourseDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = Boolean(localStorage.getItem("access_token"));
  const { courseId } = useParams();

  const [courseDetail, setCourseDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  
  //State quản lý xem học viên đã đăng ký khóa này chưa
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getCourseDetailAPI(courseId);
        if (!cancelled) {
          setCourseDetail(data);
          
          if (isLoggedIn) {
            try {
              const myCourses = await getMyCoursesAPI();
              const isEnrolledNow = myCourses.some(c => String(c.id) === String(courseId));
              setIsEnrolled(isEnrolledNow);

              // Nếu đã đăng ký, load tiến độ học tập
              if (isEnrolledNow) {
                try {
                  const progressData = await getCourseProgressAPI(courseId);
                  if (!cancelled) {
                    setCompletedLessonIds(progressData.completed_lesson_ids || []);
                  }
                } catch (err) {
                  console.warn("Failed to load progress:", err);
                }
              }
            } catch (err) {
              console.error("Failed to fetch my courses:", err);
            }
          } else {
            setIsEnrolled(false);
          }
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Không thể tải thông tin khóa học");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (courseId) load();
    return () => {
      cancelled = true;
    };
  }, [courseId, isLoggedIn]);

  const lessons = useMemo(() => {
    if (!courseDetail?.lessons) return [];

    return courseDetail.lessons.map((lesson) => {
      return {
        id: lesson.id,
        video_id: lesson.video_id || "",
        title: lesson.title,
        duration: lesson.duration || "--:--",
        views: lesson.views || 0,
        timeAgo: formatTimeAgo(lesson.updated_at),
        image: lesson.image || lesson.thumbnail_url || courseDetail.thumbnail,
        videoUrl: lesson.videoUrl || lesson.video_url || lesson.play_url || "",
        completed: completedLessonIds.includes(String(lesson.id)),
      };
    });
  }, [courseDetail, completedLessonIds]);

  const formatCurrency = (amount) => {
    if (amount === 0) return "Miễn phí";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // =========================================================================
  // XỬ LÝ CLICK VÀO BÀI HỌC
  // =========================================================================
  const handleLessonClick = (lessonId) => {
    // Bước 1: Chưa đăng nhập -> Chuyển đến trang login
    if (!isLoggedIn) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    // Bước 2: Đã đăng nhập nhưng chưa enroll -> Chặn và thông báo
    if (!isEnrolled) {
      alert("Vui lòng đăng ký khóa học để xem bài giảng này!");
      return;
    }

    // Bước 3: Đã đăng nhập VÀ đã enroll -> Cho phép vào xem
    navigate(`/courses/${courseId}/lessons/${lessonId}`);
  };

  // =========================================================================
  // XỬ LÝ NÚT BẤM CHÍNH (ĐĂNG KÝ / ĐI ĐẾN KHÓA HỌC / MUA HÀNG)
  // =========================================================================
  const handlePrimaryAction = async () => {
    // 1. Chưa đăng nhập -> Đuổi ra trang Login
    if (!isLoggedIn) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    // 2. Nếu đã đăng ký rồi -> Chuyển thẳng tới bài học đầu tiên
    if (isEnrolled) {
      const firstLessonId = lessons.length > 0 ? lessons[0].id : "";
      if (firstLessonId) {
        navigate(`/courses/${courseId || "1"}/lessons/${firstLessonId}`);
      } else {
        alert("Khóa học này hiện đang được cập nhật bài giảng. Vui lòng quay lại sau nhé!");
      }
      return;
    }

    // 3. Nếu chưa đăng ký, kiểm tra giá tiền
    const price = Number(courseDetail.price) || 0;

    if (price === 0) {
      // 3A. Khóa Free -> Gọi API Enroll
      try {
        setIsProcessingAction(true);
        const token = localStorage.getItem("access_token");
        
        // Gọi API xuống Backend
        await enrollFreeCourseAPI(courseId, token); 
        
        // Thành công: Chuyển trạng thái nút thành "Đã đăng ký"
        setIsEnrolled(true);
        
        // Optional: Hiện thông báo cho User biết
        alert("Chúc mừng bạn đã đăng ký khóa học thành công!");
        
      } catch (err) {
        console.error("Enrollment failed:", err);
        alert("Hệ thống đang gặp gián đoạn nhỏ, vui lòng thử lại sau ít phút.");
      } finally {
        setIsProcessingAction(false);
      }
    } else {
      // 3B. Khóa Paid -> Chuyển sang Checkout
      navigate("/checkout", { state: { courseId } });
    }
  };

  if (loading) {
    return (
      <div className="w-full py-24 text-center text-slate-500">
        <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
        Đang tải thông tin khóa học...
      </div>
    );
  }

  if (error || !courseDetail) {
    return (
      <div className="w-full py-24 text-center text-red-600">
        {error || "Không có dữ liệu"}
      </div>
    );
  }

  const isFree = Number(courseDetail.price) === 0;

  return (
    <div className="animate-fade-slide-up w-full pb-20 relative">
      {/* ===================================================================== */}
      {/* 1. HERO SECTION */}
      {/* ===================================================================== */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-6 sm:p-10 lg:p-12 relative shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row relative z-10">
          <div className="w-full lg:w-2/3 lg:pr-12">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-wider"
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
            </button>

            <span className="inline-block px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-full text-xs font-bold tracking-wider uppercase mb-5">
              {courseDetail.category}
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-3">
              {courseDetail.title}
            </h1>

            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-3xl line-clamp-3 mb-8">
              {courseDetail.description || "Chưa có mô tả cho khóa học này."}
            </p>

            <Link
              to={`/instructors/${courseDetail.instructor?.id || ""}`}
              className="flex items-center gap-4 mb-10 group w-max cursor-pointer"
            >
              <img
                src={courseDetail.instructor?.avatar || "https://i.pravatar.cc/150?img=11"}
                alt="Instructor"
                className="w-12 h-12 rounded-full border-2 border-slate-700 object-cover group-hover:border-blue-400 transition-colors shadow-sm"
              />
              <div>
                <p className="text-slate-300 text-xs font-semibold mb-0.5">Giảng viên</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-white font-bold group-hover:text-blue-400 transition-colors">
                    {courseDetail.instructor?.name || "EduSync Instructor"}
                  </p>
                  <FontAwesomeIcon icon={faCheckCircle} className="text-blue-400 text-xs" />
                </div>
                <p className="text-slate-400 text-xs mt-0.5">
                  {courseDetail.instructor?.title || "Giảng viên"}
                </p>
              </div>
            </Link>

            <div className="flex flex-wrap items-center gap-6 sm:gap-12">
              <div className="flex flex-col gap-1.5">
                <FontAwesomeIcon icon={faUsers} className="text-slate-400 text-lg" />
                <p className="text-white font-bold">
                  {courseDetail.students?.toLocaleString() || 0}{" "}
                  <span className="text-slate-400 font-medium text-sm">Học viên</span>
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <FontAwesomeIcon icon={faClock} className="text-slate-400 text-lg" />
                <p className="text-white font-bold">
                  {courseDetail.duration}{" "}
                  <span className="text-slate-400 font-medium text-sm">Thời lượng</span>
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <FontAwesomeIcon icon={faBookOpen} className="text-slate-400 text-lg" />
                <p className="text-white font-bold">
                  {courseDetail.lessonCount || lessons.length}{" "}
                  <span className="text-slate-400 font-medium text-sm">Bài giảng</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. FLOATING PRICING CARD */}
      {/* ===================================================================== */}
      <div className="lg:absolute lg:top-12 lg:right-12 z-20 w-full lg:w-[340px] xl:w-[380px] mt-8 lg:mt-0 px-4 lg:px-0 h-fit">
        <div className="bg-white rounded-[28px] p-5 shadow-2xl shadow-black/40 border border-slate-100 flex flex-col h-fit">
          <div className="relative aspect-video rounded-xl overflow-hidden mb-4 group cursor-pointer border border-slate-100">
            <img
              src={courseDetail.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"}
              alt="Preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
              <div className="w-14 h-14 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-blue-600 shadow-xl transform group-hover:scale-110 transition-transform">
                <FontAwesomeIcon icon={faPlayCircle} className="text-3xl ml-1" />
              </div>
            </div>
            <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
              Xem trước
            </span>
          </div>

          <div className="flex items-end gap-3 mb-4">
            <span className={`text-3xl font-black tracking-tight leading-none ${isFree ? 'text-emerald-600 uppercase tracking-wider text-2xl' : 'text-slate-900'}`}>
              {formatCurrency(courseDetail.price)}
            </span>
            {isFree && <span className="text-sm font-bold text-slate-400 line-through pb-0.5">$99.99</span>}
          </div>

          {/* ======================================================= */}
          {/* NÚT BẤM (ĐÃ CHỈNH SỬA LOGIC TRẠNG THÁI) */}
          {/* ======================================================= */}
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={isProcessingAction}
            className={`w-full py-3.5 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 text-base active:scale-95 disabled:opacity-70 disabled:cursor-wait shadow-lg
              ${isEnrolled 
                ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30" // Màu riêng cho nút Đã Đăng ký
                : isFree 
                  ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30" 
                  : "bg-[#1dbf54] hover:bg-[#19a347] shadow-[#1dbf54]/30"
              }`}
          >
            {isProcessingAction ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : isEnrolled ? (
              <FontAwesomeIcon icon={faGraduationCap} /> // Icon mũ tốt nghiệp khi đã đăng ký
            ) : isFree ? (
              <FontAwesomeIcon icon={faBoltLightning} />
            ) : (
              <FontAwesomeIcon icon={faCartShopping} />
            )}
            
            {isProcessingAction
              ? "Đang xử lý..."
              : !isLoggedIn
                ? "Đăng nhập để đăng ký"
                : isEnrolled
                  ? "Vào học ngay" // Đã đăng ký thì hiện chữ này
                  : isFree
                    ? "Đăng ký ngay"
                    : "Thanh toán"
            }
          </button>

          <p className="text-center text-xs text-slate-500 mt-3 font-medium">
            {isEnrolled ? "Bạn đã đăng ký khóa học này" : isFree ? "Truy cập trọn đời" : "Hoàn tiền trong 30 ngày"}
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. COURSE CONTENT LIST */}
      {/* ===================================================================== */}
      <section className="mt-12 lg:mt-16 lg:w-2/3 px-4 lg:px-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Nội dung khóa học
          </h2>
          <span className="text-slate-500 font-medium text-sm">
            {lessons.length} bài giảng video
          </span>
        </div>

        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              onClick={() => handleLessonClick(lesson.id)}
              className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer relative"
            >
              <div className="relative w-full sm:w-40 aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-200">
                <img
                  src={lesson.image}
                  alt={lesson.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/150" }}
                />
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                  <FontAwesomeIcon icon={faPlayCircle} className="text-white text-2xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                </div>
                <span className="absolute bottom-1.5 right-1.5 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {lesson.duration}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Bài {index + 1}
                  </p>
                  {/* {lesson.completed && (
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-green-500 text-sm"
                      title="Đã hoàn thành"
                    />
                  )} */}
                </div>
                <h3 className="text-base font-bold text-slate-800 leading-snug group-hover:text-blue-900 transition-colors line-clamp-2">
                  {lesson.title}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-500">
                  <span>{lesson.views.toLocaleString()} lượt xem</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>{lesson.timeAgo}</span>
                </div>
              </div>

              {/* Icon completed ở góc phải (trước icon 3 chấm) */}
              {lesson.completed && (
                <div className="absolute top-4 right-14 sm:relative sm:top-0 sm:right-0">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-green-500 text-lg"
                    title="Đã hoàn thành"
                  />
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-slate-400 hover:text-slate-700 px-3 py-2 shrink-0 self-start sm:self-center"
              >
                <FontAwesomeIcon icon={faEllipsisVertical} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CourseDetailPage;