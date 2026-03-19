import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLaptopCode,
  faDatabase,
  faShieldHalved,
  faRobot,
  faEllipsisVertical, // Thêm icon 3 chấm dọc
} from "@fortawesome/free-solid-svg-icons";

const EduSyncHome = () => {
  const featuredCourses = [
    {
      id: 1,
      title: "Lập trình Python cơ bản đến nâng cao",
      description:
        "Khóa học lập trình python từ cơ bản đến nâng cao bao gồm các kiến thức nền tảng và thực chiến",
      instructor: "Nguyễn Văn A",
      videos: 15,
      purchases: 30,
      timeAgo: "4 giờ trước",
      price: "1.222.000đ",
      image:
        "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "UI/UX Design Thực chiến với Figma",
      description:
        "Làm chủ quy trình thiết kế UI/UX, từ wireframe đến prototype chuyên nghiệp",
      instructor: "Trần Thị B.",
      videos: 24,
      purchases: 120,
      timeAgo: "1 ngày trước",
      price: "499.000đ",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "Kiến trúc Hệ thống (Architecture Design)",
      description:
        "Thiết kế hệ thống chịu tải cao, microservices và cloud architecture",
      instructor: "Lê Văn C.",
      videos: 32,
      purchases: 85,
      timeAgo: "3 ngày trước",
      price: "899.000đ",
      image:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      title: "Data Analysis Cơ bản đến Nâng cao",
      description:
        "Phân tích dữ liệu với SQL, Excel và BI Tools cho người mới bắt đầu",
      instructor: "Phạm D.",
      videos: 18,
      purchases: 210,
      timeAgo: "1 tuần trước",
      price: "599.000đ",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  const categories = [
    {
      name: "Kỹ thuật Phần mềm",
      icon: (
        <FontAwesomeIcon
          icon={faLaptopCode}
          className="text-blue-600 text-2xl"
        />
      ),
      courses: "150+",
    },
    {
      name: "Trí tuệ Nhân tạo (AI)",
      icon: (
        <FontAwesomeIcon icon={faRobot} className="text-purple-600 text-2xl" />
      ),
      courses: "85+",
    },
    {
      name: "An toàn Thông tin",
      icon: (
        <FontAwesomeIcon
          icon={faShieldHalved}
          className="text-red-600 text-2xl"
        />
      ),
      courses: "120+",
    },
    {
      name: "Khoa học Dữ liệu",
      icon: (
        <FontAwesomeIcon
          icon={faDatabase}
          className="text-green-600 text-2xl"
        />
      ),
      courses: "200+",
    },
  ];

  return (
    <main className="w-full space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 sm:p-10 shadow-sm border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-4 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            Khám phá tiềm năng của bạn <br className="hidden sm:block" /> với lộ
            trình cá nhân hóa
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto md:mx-0">
            Dựa trên sở thích và mục tiêu nghề nghiệp của bạn, hệ thống AI của
            EduSync đã thiết kế một lộ trình học tập tối ưu nhất dành riêng cho
            bạn.
          </p>
          <button className="mt-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg">
            Xem lộ trình đề xuất
          </button>
        </div>
        <div className="hidden lg:block w-1/3">
          <img
            src="https://cdni.iconscout.com/illustration/premium/thumb/online-learning-4382583-3640242.png"
            alt="AI Learning"
            className="w-full h-auto drop-shadow-xl"
          />
        </div>
      </section>

      {/* Categories Section - IT Majors */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Chuyên ngành đào tạo
          </h2>
          <a
            href="#"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Xem tất cả
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer flex items-center gap-4 group"
            >
              <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition">
                {cat.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.courses} khóa học</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Courses Section */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Khóa học nổi bật</h2>
          <a
            href="#"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Khám phá thêm
          </a>
        </div>

        {/* Lưới chứa các Card mới */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg transition duration-300 flex flex-col group"
            >
              {/* Ảnh khóa học */}
              <div className="relative h-44 overflow-hidden rounded-xl cursor-pointer">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                {/* Badge số video */}
                <div className="absolute top-2 right-2 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-gray-800">
                  {course.videos} video
                </div>
              </div>

              {/* Thông tin Giảng viên */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  {/* Hình đại diện giả lập (màu xám) */}
                  <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                  <span className="font-semibold text-gray-900">
                    {course.instructor}
                  </span>
                </div>
                <button className="text-gray-500 hover:text-gray-800 px-2">
                  <FontAwesomeIcon icon={faEllipsisVertical} />
                </button>
              </div>

              {/* Tiêu đề & Mô tả */}
              <h3 className="font-bold text-[17px] text-gray-900 mt-3 line-clamp-2 leading-snug  transition">
                {course.title}
              </h3>
              <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                {course.description}
              </p>

              {/* Thống kê (Lượt mua - Thời gian) */}
              <div className="flex justify-between items-center text-sm text-gray-500 mt-4">
                <span>{course.purchases} lượt mua</span>
                <span>{course.timeAgo}</span>
              </div>

              {/* Đường kẻ ngang */}
              <hr className="my-4 border-gray-200" />

              {/* Giá & Nút hành động */}
              <div className="mt-auto">
                <div className="font-bold text-xl text-green-700">
                  {course.price}
                </div>
                <button className="mt-4 w-full py-2.5 border border-gray-300 rounded-xl text-gray-800 font-semibold hover:bg-gray-50 transition">
                  Xem khóa học
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default EduSyncHome;
