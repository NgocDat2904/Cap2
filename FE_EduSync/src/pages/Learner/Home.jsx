import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLaptopCode,
  faRobot,
  faPlayCircle,
  faCheckCircle,
  faUsers,
  faPalette,
  faChartPie,
  faMobileScreen,
  faServer,
  faDatabase,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

const EduSyncHome = () => {
  // =========================================================================
  // MOCK DATA: Khóa học nổi bật
  // =========================================================================
  const featuredCourses = [
    {
      id: 1,
      title: "Lập trình Python cơ bản đến nâng cao",
      instructor: "Nguyễn Văn A",
      avatar: "https://i.pravatar.cc/150?img=11",
      videoCount: 15,
      rating: 4.8,
      students: 1520,
      price: 1222000,
      originalPrice: 1500000,
      isBestseller: true,
      image:
        "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "UI/UX Design Thực chiến với Figma",
      instructor: "Trần Thị B.",
      avatar: "https://i.pravatar.cc/150?img=5",
      videoCount: 24,
      rating: 4.9,
      students: 3420,
      price: 499000,
      originalPrice: 800000,
      isBestseller: true,
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "Kiến trúc Hệ thống (Architecture Design)",
      instructor: "Lê Văn C.",
      avatar: "https://i.pravatar.cc/150?img=8",
      videoCount: 32,
      rating: 4.7,
      students: 890,
      price: 899000,
      originalPrice: null,
      isBestseller: false,
      image:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      title: "Data Analysis Cơ bản đến Nâng cao",
      instructor: "Phạm D.",
      avatar: "https://i.pravatar.cc/150?img=12",
      videoCount: 18,
      rating: 4.6,
      students: 2100,
      price: 599000,
      originalPrice: null,
      isBestseller: false,
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  // =========================================================================
  // MOCK DATA: Chuyên ngành đào tạo (Đã đồng bộ với Master Data)
  // =========================================================================
  const categories = [
    {
      name: "Lập trình Web Frontend",
      icon: (
        <FontAwesomeIcon
          icon={faLaptopCode}
          className="text-blue-500 text-2xl"
        />
      ),
      courses: "120+",
    },
    {
      name: "Lập trình Web Backend",
      icon: (
        <FontAwesomeIcon icon={faServer} className="text-slate-700 text-2xl" />
      ),
      courses: "95+",
    },
    {
      name: "Lập trình Di động (Mobile)",
      icon: (
        <FontAwesomeIcon
          icon={faMobileScreen}
          className="text-teal-500 text-2xl"
        />
      ),
      courses: "60+",
    },
    {
      name: "Trí tuệ Nhân tạo (AI)",
      icon: (
        <FontAwesomeIcon icon={faRobot} className="text-purple-600 text-2xl" />
      ),
      courses: "85+",
    },
    {
      name: "Phân tích Dữ liệu (DA)",
      icon: (
        <FontAwesomeIcon
          icon={faChartPie}
          className="text-emerald-500 text-2xl"
        />
      ),
      courses: "110+",
    },
    {
      name: "Kỹ thuật Dữ liệu (DE)",
      icon: (
        <FontAwesomeIcon
          icon={faDatabase}
          className="text-indigo-500 text-2xl"
        />
      ),
      courses: "70+",
    },
    {
      name: "Thiết kế UI/UX",
      icon: (
        <FontAwesomeIcon icon={faPalette} className="text-pink-500 text-2xl" />
      ),
      courses: "150+",
    },
    {
      name: "Phân tích Nghiệp vụ (BA)",
      icon: (
        <FontAwesomeIcon
          icon={faChartLine}
          className="text-amber-500 text-2xl"
        />
      ),
      courses: "90+",
    },
  ];

  // Hàm format tiền tệ VNĐ
  const formatCurrency = (amount) => {
    if (amount === 0) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <main className="animate-fade-slide-up w-full space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-10 shadow-sm border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-4 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
            Khám phá tiềm năng của bạn <br className="hidden sm:block" /> với lộ
            trình cá nhân hóa
          </h1>
          <p className="text-slate-600 max-w-lg mx-auto md:mx-0">
            Dựa trên sở thích và mục tiêu nghề nghiệp của bạn, hệ thống AI của
            EduSync đã thiết kế một lộ trình học tập tối ưu nhất dành riêng cho
            bạn.
          </p>
          <button className="mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg active:scale-95">
            Xem lộ trình đề xuất
          </button>
        </div>
        <div className="hidden lg:block w-1/3">
          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/online-learning-4382583-3640242.png"
            alt="AI Learning"
            className="w-full h-auto drop-shadow-xl hover:-translate-y-2 transition-transform duration-500"
          />
        </div>
      </section>

      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Chuyên ngành đào tạo
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex items-center gap-4 group"
            >
              <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-slate-100 transition-colors duration-300">
                {cat.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {cat.courses} khóa học
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses Section */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Khóa học nổi bật
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Những khóa học được đăng ký nhiều nhất tuần qua
            </p>
          </div>
          <Link
            to="/courses"
            className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors hidden sm:block"
          >
            Khám phá thêm
          </Link>
        </div>

        {/* Lưới chứa các Card chuẩn "Premium" */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
            >
              {/* Ảnh bìa & Badge */}
              <div className="relative aspect-video overflow-hidden bg-slate-200">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-600 transform scale-50 group-hover:scale-100 transition-transform duration-300">
                    <FontAwesomeIcon icon={faPlayCircle} className="text-2xl" />
                  </div>
                </div>
                <span className="absolute bottom-3 right-3 px-2 py-1 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold rounded flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faPlayCircle} /> {course.videoCount}{" "}
                  video
                </span>
              </div>

              {/* Nội dung Card */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={course.avatar}
                    alt="Avatar"
                    className="w-6 h-6 rounded-full object-cover border border-slate-100"
                  />
                  <span className="text-xs font-bold text-slate-500">
                    {course.instructor}
                  </span>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-blue-500 text-[10px]"
                    title="Đã xác minh"
                  />
                </div>

                <h3 className="font-bold text-[17px] text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                  {course.title}
                </h3>

                <div className="flex items-center gap-4 text-sm mt-auto pt-4">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
                    <FontAwesomeIcon icon={faUsers} />
                    {course.students.toLocaleString()} học viên
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                  <div className="flex flex-col">
                    {course.originalPrice && (
                      <span className="text-xs text-slate-400 font-medium line-through mb-0.5">
                        {formatCurrency(course.originalPrice)}
                      </span>
                    )}
                    <span
                      className={`font-black text-xl ${course.price === 0 ? "text-green-600" : "text-slate-900"}`}
                    >
                      {formatCurrency(course.price)}
                    </span>
                  </div>

                  <Link
                    to={`/courses/${course.id}`}
                    className="text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default EduSyncHome;
