import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faCamera,
  faBriefcase,
  faGraduationCap,
  faCertificate,
  faEnvelope,
  faSave,
  faKey,
  faUserEdit,
  faLink,
  faCheckCircle,
  faUsers,
  faBook,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faGithub,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

// Component con cho Thẻ Metric tóm tắt hào quang
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

const InstructorProfilePage = () => {
  // Mock dữ liệu ban đầu từ Backend
  const [profileData, setProfileData] = useState({
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@edusync.edu.vn", // Read-only
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    headline: "Senior AI Engineer | Chuyên gia Lập trình Python & Data Science",
    bio: "Hơn 10 năm kinh nghiệm trong lĩnh vực Trí tuệ Nhân tạo và Khoa học Dữ liệu. Đam mê chia sẻ kiến thức và xây dựng cộng đồng lập trình viên Việt Nam chất lượng cao.",
    specializations: "Python, Machine Learning, Data Analysis, Big Data",
    linkedin: "https://linkedin.com/in/nguyenvana",
    github: "https://github.com/nguyenvana",
    youtube: "",
    website: "https://nguyenvana.dev",
    totalStudents: 12500, // Aggregate metric
    avgRating: 4.8, // Aggregate metric
    totalCourses: 15, // Aggregate metric
    isVerified: true,
  });

  const [activeTab, setActiveTab] = useState("personal"); // 'personal', 'social', 'account'
  const fileInputRef = useRef(null);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  // Giả lập lưu hồ sơ
  const handleSaveProfile = (e) => {
    e.preventDefault();
    alert(
      "Hồ sơ của bạn đã được cập nhật thành công! Hào quang của bạn đang tỏa sáng rực rỡ! ✨",
    );
    // Gọi API lưu dữ liệu xuống BE tại đây
  };

  // Giả lập upload Avatar
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatarUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Cấu trúc các Tab
  const tabs = [
    { id: "personal", label: "Thông tin cá nhân", icon: faUserEdit },
    { id: "social", label: "Liên kết chuyên môn", icon: faLink },
    { id: "account", label: "Cài đặt tài khoản", icon: faGear },
  ];

  return (
    <main className="animate-fade-slide-up w-full pb-16">
      <div className="p-4 sm:p-6 lg:p-8 relative overflow-visible z-10">
        {/* HEADER TRANG */}
        <div className="flex flex-col sm:flex-row md:items-center justify-between gap-4 mb-10 border-b border-slate-200 pb-8 relative z-20">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Hồ sơ cá nhân
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Cập nhật thông tin chuyên môn và xây dựng thương hiệu cá nhân của
              bạn.
            </p>
          </div>
          <button
            onClick={handleSaveProfile}
            className="px-6 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:scale-95"
          >
            <FontAwesomeIcon icon={faSave} />
            Lưu thay đổi
          </button>
        </div>

        {/* BỐ CỤC CHÍNH 2 CỘT */}
        <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10 overflow-visible">
          {/* CỘT TRÁI: TỔNG QUAN HỒ SƠ (Profile Card & Metrics) */}
          <div className="w-full lg:w-1/3 space-y-8 sticky top-24 relative z-10">
            {/* Card thông tin chính */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center relative overflow-visible">
              {/* Vùng Avatar & Nút Camera */}
              <div className="relative inline-block mb-6">
                <img
                  src={profileData.avatarUrl}
                  alt="Instructor Avatar"
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl ring-2 ring-blue-100"
                />
                <button
                  onClick={handleAvatarClick}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors border-2 border-white active:scale-95"
                  title="Thay đổi ảnh đại diện"
                >
                  <FontAwesomeIcon icon={faCamera} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Tên & Headline */}
              <h2 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2.5">
                {profileData.fullName}
                {profileData.isVerified && (
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-blue-500 text-lg"
                    title="Giảng viên đã xác minh"
                  />
                )}
              </h2>
              <p className="text-sm font-semibold text-blue-700 mt-2 px-4 py-1.5 bg-blue-50 rounded-full inline-block leading-normal">
                {profileData.headline}
              </p>

              <div className="border-t border-slate-100 my-8"></div>

              {/* Email (Read-only) */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-slate-400 text-lg w-5 shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Email công việc
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {profileData.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Bảng Metrics hào quang */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900 mb-5 border-l-4 border-blue-600 pl-3">
                Tóm tắt hào quang
              </h3>
              <MetricCard
                icon={faUsers}
                label="Học viên"
                value={profileData.totalStudents.toLocaleString()}
                color="text-blue-600"
              />

              <MetricCard
                icon={faBook}
                label="Khóa học"
                value={profileData.totalCourses}
                color="text-emerald-600"
              />
            </div>
          </div>

          {/* CỘT PHẢI: CHI TIẾT CÀI ĐẶT (TABS) */}
          <div className="w-full lg:w-2/3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-visible relative z-0">
            {/* Thanh Tabs chuyên nghiệp */}
            <div className="border-b border-slate-100 flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-5 text-sm font-bold border-b-2 whitespace-nowrap transition-colors shrink-0 ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200"
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="text-lg" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* NỘI DUNG CÁC TAB */}
            <div className="p-6 sm:p-8 space-y-8 animate-fade-slide-up">
              {/* TAB 1: THÔNG TIN CÁ NHÂN */}
              {activeTab === "personal" && (
                <form className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faBriefcase}
                        className="text-slate-400"
                      />{" "}
                      Tiêu đề nghề nghiệp / Chức danh
                    </label>
                    <input
                      type="text"
                      name="headline"
                      value={profileData.headline}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Senior AI Engineer | Giảng viên Python"
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      Dòng này sẽ hiển thị ngay dưới tên của bạn trên mọi khóa
                      học. Viết ngắn gọn, súc tích và ấn tượng.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                      Giới thiệu bản thân (Bio)
                    </label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      rows="6"
                      placeholder="Kể cho học viên nghe về kinh nghiệm, kỹ năng và triết lý giảng dạy của bạn..."
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    ></textarea>
                    <p className="text-xs text-slate-400 mt-2">
                      Đoạn văn này giúp học viên hiểu rõ hơn về bạn trước khi
                      đăng ký khóa học.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faGraduationCap}
                        className="text-slate-400"
                      />{" "}
                      Chuyên ngành / Lĩnh vực giảng dạy chính
                    </label>
                    <input
                      type="text"
                      name="specializations"
                      value={profileData.specializations}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Python, Machine Learning, UI/UX..."
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-slate-400 mt-2">
                      Ngăn cách các lĩnh vực bằng dấu phẩy (,)
                    </p>
                  </div>
                </form>
              )}

              {/* TAB 2: LIÊN KẾT CHUYÊN MÔN */}
              {activeTab === "social" && (
                <form className="space-y-6">
                  <h3 className="text-base font-bold text-slate-800 mb-6">
                    Liên kết mạng xã hội & Portfolio
                  </h3>
                  <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8">
                    Thêm các liên kết để học viên có thể tìm hiểu thêm về kinh
                    nghiệm thực tế và các dự án của bạn.
                  </p>

                  {[
                    {
                      name: "linkedin",
                      icon: faLinkedin,
                      color: "text-[#0077B5]",
                      label: "Hồ sơ LinkedIn",
                      placeholder: "https://linkedin.com/in/yourprofile",
                    },
                    {
                      name: "github",
                      icon: faGithub,
                      color: "text-[#181717]",
                      label: "Tài khoản GitHub",
                      placeholder: "https://github.com/yourusername",
                    },
                    {
                      name: "youtube",
                      icon: faYoutube,
                      color: "text-[#FF0000]",
                      label: "Kênh YouTube (Nếu có)",
                      placeholder: "https://youtube.com/@yourchannel",
                    },
                    {
                      name: "website",
                      icon: faUserCircle,
                      color: "text-blue-600",
                      label: "Website cá nhân / Portfolio",
                      placeholder: "https://yourwebsite.com",
                    },
                  ].map((link) => (
                    <div key={link.name}>
                      <label
                        className={`block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2.5 ${link.color}`}
                      >
                        <FontAwesomeIcon
                          icon={link.icon}
                          className="text-base w-5 shrink-0"
                        />{" "}
                        {link.label}
                      </label>
                      <input
                        type="url"
                        name={link.name}
                        value={profileData[link.name]}
                        onChange={handleInputChange}
                        placeholder={link.placeholder}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  ))}
                </form>
              )}

              {/* TAB 3: CÀI ĐẶT TÀI KHOẢN (ĐỔI MẬT KHẨU) */}
              {activeTab === "account" && (
                <div className="space-y-8">
                  <div className="border-b border-slate-100 pb-8">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-3 mb-6">
                      <FontAwesomeIcon
                        icon={faKey}
                        className="text-amber-500"
                      />{" "}
                      Thay đổi mật khẩu
                    </h3>
                    <form className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                          Mật khẩu hiện tại
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                          Mật khẩu mới
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                          Xác nhận mật khẩu mới
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                        />
                      </div>
                      <div className="sm:col-span-2 flex justify-end">
                        <button className="px-6 py-3 bg-white text-slate-800 border border-slate-300 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-400 Transition-all active:scale-95 flex items-center gap-2.5">
                          Cập nhật mật khẩu
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-200 text-amber-900">
                    <FontAwesomeIcon
                      icon={faCertificate}
                      className="text-2xl mt-1 text-amber-500"
                    />
                    <div>
                      <h4 className="font-bold text-sm">Xác minh tài khoản</h4>
                      <p className="text-xs mt-1 leading-relaxed opacity-90">
                        Tài khoản của bạn hiện{" "}
                        <span className="font-black text-amber-950">
                          ĐÃ ĐƯỢC XÁC MINH
                        </span>{" "}
                        bởi Admin trung tâm. Huy hiệu "Tích xanh" sẽ hiển thị
                        công khai trên hồ sơ và các khóa học của bạn để tăng độ
                        uy tín với học viên.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default InstructorProfilePage;
