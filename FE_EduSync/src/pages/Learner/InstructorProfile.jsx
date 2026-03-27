import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faUsers,
  faBookOpen,
  faGraduationCap,
  faArrowLeft,
  faPlayCircle,
  faUserTie,
  faEnvelope,
  faLink,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faGithub,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

// =========================================================================
// MOCK DATA: DỮ LIỆU PUBLIC CỦA GIẢNG VIÊN
// =========================================================================
const mockInstructorData = {
  id: "INST-001",
  fullName: "Phạm Minh D",
  email: "phamminhd@edusync.edu.vn",
  avatarUrl: "https://i.pravatar.cc/150?img=11",
  headline: "Senior Designer | Chuyên gia Đồ họa & UI/UX",
  bio: "Xin chào! Mình là Minh D. Với hơn 8 năm thực chiến tại các tập đoàn công nghệ lớn và 4 năm kinh nghiệm giảng dạy, triết lý của mình là: 'Thiết kế không chỉ là làm cho đẹp, mà là giải quyết vấn đề của người dùng'. Mình sẽ giúp các bạn đi từ số 0 đến Master các công cụ thiết kế.",
  specializations: ["Adobe Illustrator", "Photoshop", "UI/UX Design", "Figma"],
  socialLinks: {
    linkedin: "https://linkedin.com/in/phamminhd",
    github: "",
    youtube: "https://youtube.com/phamminhd",
    website: "https://phamminhd.design",
  },
  metrics: {
    totalStudents: 15420,
    totalCourses: 5,
    avgRating: 4.9,
  },
  isVerified: true,
  courses: [
    {
      id: "CRS-101",
      title: "Nhập môn Thiết kế Đồ họa với Adobe Illustrator",
      category: "Design",
      price: 0, // Đặt giá 0 để hiện "Miễn phí"
      videoCount: 25,
      thumbnail:
        "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80",
      rating: 4.9,
      students: 560,
    },
    {
      id: "CRS-105",
      title: "Tư duy UI/UX Thực chiến cho Web & App",
      category: "Design",
      price: 49.99,
      videoCount: 42,
      thumbnail:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
      rating: 4.8,
      students: 1200,
    },
  ],
};

// Component Thẻ Metric
const MetricCard = ({ icon, label, value, color }) => (
  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4 group transition-all hover:bg-white hover:border-blue-100 hover:shadow-sm">
    <div
      className={`w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0 bg-white border border-slate-200 group-hover:border-blue-100 ${color}`}
    >
      <FontAwesomeIcon icon={icon} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      <h4 className="text-xl font-black text-slate-900 mt-0.5">{value}</h4>
    </div>
  </div>
);

const InstructorPublicProfile = () => {
  const navigate = useNavigate();
  const { instructorId } = useParams();
  const [instructor, setInstructor] = useState(mockInstructorData);

  const renderSocialLink = (platform, url, icon, label, colorClass) => {
    if (!url) return null;
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all group"
      >
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={icon} className={`text-lg ${colorClass}`} />
          <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">
            {label}
          </span>
        </div>
        <FontAwesomeIcon
          icon={faLink}
          className="text-slate-300 group-hover:text-blue-400 text-xs"
        />
      </a>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-20 pt-6 animate-fade-slide-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Nút quay lại */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
        </button>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ========================================================= */}
          {/* CỘT TRÁI: CARD THÔNG TIN CÁ NHÂN & HÀO QUANG */}
          {/* ========================================================= */}
          <div className="w-full lg:w-1/3 space-y-6 sticky top-24">
            {/* Card Thông tin cốt lõi */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center relative">
              <div className="relative inline-block mb-4">
                <img
                  src={instructor.avatarUrl}
                  alt={instructor.fullName}
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl ring-2 ring-blue-100 mx-auto"
                />
              </div>

              <h1 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2.5">
                {instructor.fullName}
                {instructor.isVerified && (
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-blue-500 text-lg"
                    title="Giảng viên đã xác minh"
                  />
                )}
              </h1>

              <p className="text-sm font-semibold text-blue-700 mt-3 px-4 py-2 bg-blue-50 rounded-full inline-block leading-normal">
                {instructor.headline}
              </p>

              <div className="border-t border-slate-100 my-6"></div>

              {/* Email liên hệ */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-slate-400 text-lg w-5 shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Liên hệ công việc
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {instructor.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Tóm tắt Hào quang */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900 mb-5 border-l-4 border-blue-600 pl-3">
                Tóm tắt hào quang
              </h3>
              <MetricCard
                icon={faUsers}
                label="Tổng học viên"
                value={instructor.metrics.totalStudents.toLocaleString()}
                color="text-blue-600"
              />
              <MetricCard
                icon={faBookOpen}
                label="Khóa học giảng dạy"
                value={instructor.metrics.totalCourses}
                color="text-emerald-600"
              />
            </div>

            {/* Card Liên kết MXH */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-base font-extrabold text-slate-900 mb-4">
                Liên kết chuyên môn
              </h3>
              <div className="space-y-2.5">
                {renderSocialLink(
                  "linkedin",
                  instructor.socialLinks.linkedin,
                  faLinkedin,
                  "LinkedIn Profile",
                  "text-[#0077B5]",
                )}
                {renderSocialLink(
                  "github",
                  instructor.socialLinks.github,
                  faGithub,
                  "GitHub Portfolio",
                  "text-[#181717]",
                )}
                {renderSocialLink(
                  "youtube",
                  instructor.socialLinks.youtube,
                  faYoutube,
                  "Kênh YouTube",
                  "text-[#FF0000]",
                )}
                {/* 🚨 MỚI THÊM: Nút Website Cá nhân 🚨 */}
                {renderSocialLink(
                  "website",
                  instructor.socialLinks.website,
                  faGlobe,
                  "Website / Portfolio",
                  "text-emerald-600", // Màu xanh lá cho khác biệt
                )}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CỘT PHẢI: GIỚI THIỆU & CÁC KHÓA HỌC */}
          {/* ========================================================= */}
          <div className="w-full lg:w-2/3 space-y-8">
            {/* Card Giới thiệu & Chuyên môn */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
                <FontAwesomeIcon icon={faUserTie} className="text-blue-600" />{" "}
                Giới thiệu bản thân
              </h2>
              <p className="text-slate-600 text-[15px] leading-relaxed font-medium text-justify">
                {instructor.bio}
              </p>

              <h3 className="text-sm font-bold text-slate-900 mt-8 mb-3 flex items-center gap-2 uppercase tracking-wider">
                <FontAwesomeIcon
                  icon={faGraduationCap}
                  className="text-slate-400"
                />{" "}
                Lĩnh vực giảng dạy chính
              </h3>
              <div className="flex flex-wrap gap-2">
                {instructor.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-slate-50 text-slate-700 text-sm font-bold rounded-xl border border-slate-200"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Danh sách khóa học */}
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                Khóa học từ giảng viên này
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {instructor.courses.map((course) => (
                  // 🚨 CARD KHÓA HỌC ĐƯỢC LÀM LẠI CHUẨN DESIGN CỦA MẸ 🚨
                  <div
                    key={course.id}
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group flex flex-col cursor-pointer"
                  >
                    {/* NỬA TRÊN: Ảnh full góc + Label 25 video */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Label "25 video" góc phải dưới */}
                      <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[13px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faPlayCircle}
                          className="text-sm"
                        />{" "}
                        {course.videoCount} video
                      </div>
                    </div>

                    {/* NỬA DƯỚI: Nội dung chữ */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Dòng 1: Avatar GV + Tên */}
                      <div className="flex items-center gap-2.5 mb-3">
                        <img
                          src={instructor.avatarUrl}
                          alt="GV"
                          className="w-6 h-6 rounded-full object-cover border border-slate-200"
                        />
                        <span className="text-sm font-bold text-slate-600">
                          {instructor.fullName}
                        </span>
                        {instructor.isVerified && (
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="text-blue-500 text-[11px]"
                          />
                        )}
                      </div>

                      {/* Dòng 2: Tiêu đề khóa học */}
                      <h3 className="text-[17px] font-black text-slate-800 leading-snug line-clamp-2 mb-3 group-hover:text-blue-700 transition-colors">
                        {course.title}
                      </h3>

                      {/* Dòng 3: Số học viên */}
                      <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 mt-auto mb-4">
                        <FontAwesomeIcon icon={faUsers} />
                        <span>{course.students.toLocaleString()} học viên</span>
                      </div>

                      {/* Dòng 4: Kẻ ngang + Giá + Nút bấm */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span
                          className={`text-[22px] font-black ${course.price === 0 ? "text-emerald-600" : "text-slate-900"}`}
                        >
                          {course.price === 0 ? "Miễn phí" : `$${course.price}`}
                        </span>
                        <span className="text-[13px] font-bold text-blue-800 bg-blue-50 px-4 py-2.5 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          Xem chi tiết
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorPublicProfile;
