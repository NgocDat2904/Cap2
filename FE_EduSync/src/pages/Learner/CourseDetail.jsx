import React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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
} from "@fortawesome/free-solid-svg-icons";

const CourseDetailPage = () => {
  const navigate = useNavigate();
  // Lấy courseId từ URL hiện tại (ví dụ: đang ở trang /courses/123 thì courseId = 123)
  const { courseId } = useParams();

  // =========================================================================
  // MOCK DATA: Dữ liệu chi tiết khóa học
  // =========================================================================
  const courseDetail = {
    title: "Lập trình Python từ cơ bản đến nâng cao",
    subtitle:
      "Làm chủ Python 3, xây dựng ứng dụng thực tế và tự động hóa công việc chỉ trong 30 ngày.",
    category: "Lập trình",
    instructor: "Nguyễn Văn A",
    instructorId: "INST-001", // Giả lập thêm ID Giảng viên để chuyển trang
    instructorTitle: "Senior Software Engineer",
    avatar: "https://i.pravatar.cc/150?img=11",
    students: 1520,
    duration: "8h 30m",
    lessonCount: 24,
    price: 1222000,
    originalPrice: 1500000,
    thumbnail:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  };

  const lessons = [
    {
      id: 1,
      title: "Giới thiệu khóa học & Cài đặt môi trường",
      duration: "10:25",
      views: 1520,
      timeAgo: "4 giờ trước",
      image:
        "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 2,
      title: "Biến, Kiểu dữ liệu và Các phép toán cơ bản",
      duration: "18:40",
      views: 1450,
      timeAgo: "1 ngày trước",
      image:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 3,
      title: "Cấu trúc rẽ nhánh (If - Else) trong Python",
      duration: "22:15",
      views: 1200,
      timeAgo: "2 ngày trước",
      image:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 4,
      title: "Vòng lặp For và While - Thực hành vẽ hình",
      duration: "25:00",
      views: 980,
      timeAgo: "3 ngày trước",
      image:
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 5,
      title: "Làm việc với List, Tuple và Dictionary",
      duration: "30:50",
      views: 850,
      timeAgo: "5 ngày trước",
      image:
        "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=300&q=80",
    },
  ];

  // Hàm format tiền tệ VNĐ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="animate-fade-slide-up w-full pb-20 relative">
      {/* ===================================================================== */}
      {/* 1. HERO SECTION (Nền tối gradient) */}
      {/* ===================================================================== */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-6 sm:p-10 lg:p-12 relative shadow-2xl overflow-hidden">
        {/* Decorative Blur Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row relative z-10">
          {/* Cột trái: Thông tin Khóa học */}
          <div className="w-full lg:w-2/3 lg:pr-12">
            {/* Nút Back */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-wider"
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
            </button>

            {/* Badge Category */}
            <span className="inline-block px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-full text-xs font-bold tracking-wider uppercase mb-5">
              {courseDetail.category}
            </span>

            {/* Tiêu đề & Subtitle */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
              {courseDetail.title}
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed max-w-2xl">
              {courseDetail.subtitle}
            </p>

            {/* 🚨 MỚI THÊM: Biến Avatar + Tên thành Link bấm được 🚨 */}
            <Link
              to={`/instructors/${courseDetail.instructorId}`} // Bẻ lái sang trang Profile Giảng viên
              className="flex items-center gap-4 mb-10 group w-max cursor-pointer"
            >
              <img
                src={courseDetail.avatar}
                alt="Instructor"
                className="w-12 h-12 rounded-full border-2 border-slate-700 object-cover group-hover:border-blue-400 transition-colors shadow-sm"
              />
              <div>
                <p className="text-slate-300 text-xs font-semibold mb-0.5">
                  Giảng viên
                </p>
                <div className="flex items-center gap-1.5">
                  <p className="text-white font-bold group-hover:text-blue-400 transition-colors">
                    {courseDetail.instructor}
                  </p>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-blue-400 text-xs"
                  />
                </div>
                <p className="text-slate-400 text-xs mt-0.5">
                  {courseDetail.instructorTitle}
                </p>
              </div>
            </Link>

            {/* Stats (Học viên, Thời gian, Số bài giảng) */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-12">
              <div className="flex flex-col gap-1.5">
                <FontAwesomeIcon
                  icon={faUsers}
                  className="text-slate-400 text-lg"
                />
                <p className="text-white font-bold">
                  {courseDetail.students.toLocaleString()}{" "}
                  <span className="text-slate-400 font-medium text-sm">
                    Học viên
                  </span>
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-slate-400 text-lg"
                />
                <p className="text-white font-bold">
                  {courseDetail.duration}{" "}
                  <span className="text-slate-400 font-medium text-sm">
                    Thời lượng
                  </span>
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <FontAwesomeIcon
                  icon={faBookOpen}
                  className="text-slate-400 text-lg"
                />
                <p className="text-white font-bold">
                  {courseDetail.lessonCount}{" "}
                  <span className="text-slate-400 font-medium text-sm">
                    Bài giảng
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. FLOATING PRICING CARD (Thẻ nổi chứa video và giá) */}
      {/* Trên PC: Nó nằm nổi lên góc phải màn hình. Trên Mobile: Nó rớt xuống dưới. */}
      {/* ===================================================================== */}
      <div className="lg:absolute lg:top-12 lg:right-12 z-20 w-full lg:w-[340px] xl:w-[380px] mt-8 lg:mt-0 px-4 lg:px-0">
        <div className="bg-white rounded-3xl p-5 shadow-2xl shadow-slate-900/20 border border-slate-100 flex flex-col">
          {/* Ảnh Preview */}
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 group cursor-pointer">
            <img
              src={courseDetail.thumbnail}
              alt="Preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
              <div className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-blue-600 shadow-lg transform group-hover:scale-110 transition-transform">
                <FontAwesomeIcon
                  icon={faPlayCircle}
                  className="text-3xl ml-1"
                />
              </div>
            </div>
            <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-xs font-bold px-2 py-1 rounded">
              Xem trước
            </span>
          </div>

          {/* Giá tiền */}
          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl font-black text-slate-900">
              {formatCurrency(courseDetail.price)}
            </span>
            {courseDetail.originalPrice && (
              <span className="text-base text-slate-400 font-semibold line-through mb-1">
                {formatCurrency(courseDetail.originalPrice)}
              </span>
            )}
          </div>

          {/* Nút Mua ngay (Màu xanh lá cây như wireframe) */}
          <button className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 text-lg active:scale-95">
            <FontAwesomeIcon icon={faCartShopping} /> Mua ngay
          </button>

          <p className="text-center text-xs text-slate-500 mt-4 font-medium">
            Hoàn tiền trong 30 ngày nếu không hài lòng
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. COURSE CONTENT LIST (Danh sách bài giảng) */}
      {/* ===================================================================== */}
      <section className="mt-12 lg:mt-16 lg:w-2/3 px-4 lg:px-0">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Nội dung khóa học
          </h2>
          <span className="text-slate-500 font-medium text-sm">
            {lessons.length} video bài giảng
          </span>
        </div>

        {/* Danh sách List View */}
        <div className="space-y-4">
          {lessons.map((lesson, index) => (
            // THAY ĐỔI Ở ĐÂY: Dùng thẻ <Link> thay vì <div>
            // Đường dẫn đến trang Học bài: /courses/:courseId/lessons/:lessonId
            // Lưu ý: Nếu URL hiện tại chưa có courseId thật, tạm thời dùng số 1 để test.
            <Link
              key={lesson.id}
              to={`/courses/${courseId || "1"}/lessons/${lesson.id}`}
              className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer block"
            >
              {/* Thumbnail Bài giảng (Nhỏ gọn) */}
              <div className="relative w-full sm:w-40 aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-200">
                <img
                  src={lesson.image}
                  alt={lesson.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faPlayCircle}
                    className="text-white text-2xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all"
                  />
                </div>
                <span className="absolute bottom-1.5 right-1.5 bg-slate-900/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {lesson.duration}
                </span>
              </div>

              {/* Thông tin Bài giảng */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                  Bài {index + 1}
                </p>
                <h3 className="text-base font-bold text-slate-800 leading-snug group-hover:text-blue-900 transition-colors line-clamp-2">
                  {lesson.title}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-500">
                  <span>{lesson.views.toLocaleString()} lượt xem</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>{lesson.timeAgo}</span>
                </div>
              </div>

              {/* 3 chấm (Menu option) */}
              {/* Thêm e.preventDefault() để khi click nút này không bị ăn theo sự kiện chuyển trang của thẻ <Link> bao ngoài */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // Xử lý logic mở menu 3 chấm ở đây (nếu có)
                }}
                className="text-slate-400 hover:text-slate-700 px-3 py-2 shrink-0 self-start sm:self-center"
              >
                <FontAwesomeIcon icon={faEllipsisVertical} />
              </button>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CourseDetailPage;
