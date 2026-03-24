import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faCamera,
  faBirthdayCake,
  faVenusMars,
  faPhone,
  faMapMarkerAlt,
  faGraduationCap,
  faBriefcase,
  faLock,
  faSave,
  faEnvelope,
  faPencilAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons";

const LearnerProfilePage = () => {
  // Mock dữ liệu ban đầu (lấy từ Backend)
  const [profileData, setProfileData] = useState({
    fullName: "Mến Nguyễn",
    email: "mennguyen.student@gmail.com", // Read-only
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    phone: "",
    dob: "2002-10-15",
    gender: "female",
    address: "Đà Nẵng, Việt Nam",
    // specializedField: "Frontend Development",
    learningGoal: "Tìm việc làm Senior Frontend trong 1 năm tới",
    linkedin: "https://linkedin.com/in/mennguyen",
    github: "https://github.com/mennguyen-dev",
    profileCompletion: 65, // % hoàn thiện (Backend tính toán)
  });

  const [activeTab, setActiveTab] = useState("personal"); // 'personal', 'education', 'security'
  const fileInputRef = useRef(null);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
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

  // Giả lập lưu hồ sơ
  const handleSaveProfile = (e) => {
    e.preventDefault();
    alert(
      "Hồ sơ của bạn đã được cập nhật thành công! AI của EduSync đang tối ưu lộ trình cho bạn nhé! ✨",
    );
    // Gọi API lưu dữ liệu tại đây
  };

  return (
    <main className="animate-fade-slide-up w-full pb-16">
      <div className="p-4 sm:p-6 lg:p-8 relative">
        {/* HEADER TRANG */}
        <div className="flex flex-col sm:flex-row md:items-center justify-between gap-4 mb-10 border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Hồ sơ của tôi
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Quản lý thông tin cá nhân và theo dõi lộ trình phát triển của bạn.
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
        <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">
          {/* CỘT TRÁI: TỔNG QUAN HỒ SƠ & GAMIFICATION */}
          <div className="w-full lg:w-1/3 space-y-8 sticky top-24 relative z-10">
            {/* Card thông tin chính */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center relative overflow-visible">
              {/* Vùng Avatar & Nút Camera */}
              <div className="relative inline-block mb-6">
                <img
                  src={profileData.avatarUrl}
                  alt="Learner Avatar"
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
              <h2 className="text-2xl font-black text-slate-900">
                {profileData.fullName}
              </h2>
              {/* <p className="text-sm font-semibold text-blue-700 mt-2 px-4 py-1.5 bg-blue-50 rounded-full inline-block leading-normal">
                {profileData.specializedField}
              </p> */}
              <div className="border-t border-slate-100 my-8"></div>
              {/* Email (Read-only) */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-slate-400 text-lg w-5 shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Email tài khoản
                  </p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {profileData.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: CHI TIẾT CÀI ĐẶT (TABS) */}
          <div className="w-full lg:w-2/3 space-y-8 relative z-0">
            {/* Vùng Gamification: Hoàn thiện hồ sơ */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 group hover:shadow-lg hover:border-blue-100 transition-all">
              <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-slate-100 flex items-center justify-center text-4xl text-slate-300 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-500 transition-colors shrink-0">
                <FontAwesomeIcon icon={faPencilAlt} />
              </div>
              <div className="flex-1 w-full text-center md:text-left">
                <div className="flex justify-between items-end mb-2">
                  <h4 className="text-slate-900 font-bold text-lg">
                    Hoàn thiện hồ sơ để nhận lộ trình AI chuẩn nhất
                  </h4>
                  <span className="text-blue-600 font-black text-2xl">
                    {profileData.profileCompletion}%
                  </span>
                </div>
                {/* Thanh tiến độ */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${profileData.profileCompletion}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Bạn còn thiếu{" "}
                  <span className="font-bold text-slate-700">
                    Số điện thoại
                  </span>
                  . Cập nhật ngay nhé!
                </p>
              </div>
            </div>

            {/* Khối Tabs Form Chi tiết */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-visible relative z-0">
              <div className="border-b border-slate-100 flex overflow-x-auto scrollbar-hide">
                {[
                  {
                    id: "personal",
                    label: "Thông tin cá nhân",
                    icon: faUserCircle,
                  },

                  { id: "security", label: "Cài đặt tài khoản", icon: faLock },
                ].map((tab) => (
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

              {/* NỘI DUNG CÁC TAB (Form Input) */}
              <div className="p-6 sm:p-8 space-y-8 animate-fade-slide-up">
                {/* TAB 1: THÔNG TIN CÁ NHÂN (Có Ngày sinh, Giới tính) */}
                {activeTab === "personal" && (
                  <form className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faUserCircle}
                          className="text-slate-400"
                        />{" "}
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500Transition-colors"
                      />
                    </div>
                    {/* INPUT NGÀY SINH (NEW) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faBirthdayCake}
                          className="text-slate-400"
                        />{" "}
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={profileData.dob}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500Transition-colors"
                      />
                    </div>
                    {/* INPUT GIỚI TÍNH (NEW) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faVenusMars}
                          className="text-slate-400"
                        />{" "}
                        Giới tính
                      </label>
                      <select
                        name="gender"
                        value={profileData.gender}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 Transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    {/* INPUT SỐ ĐIỆN THOẠI (CRITICAL FIELD - GÂY FRICTION) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faPhone}
                          className="text-red-400"
                        />{" "}
                        Số điện thoại (!)
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        placeholder="+84 905 123 456"
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 Transition-colors border-red-100"
                      />
                      <p className="text-[10px] text-red-500 mt-1 font-medium">
                        Bổ sung ngay để bảo mật tài khoản và đạt 100% hồ sơ.
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="text-slate-400"
                        />{" "}
                        Địa chỉ
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500Transition-colors"
                      />
                    </div>
                  </form>
                )}

                {/* TAB 2: LỘ TRÌNH & MỤC TIÊU */}
                {activeTab === "education" && (
                  <form className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faGraduationCap}
                          className="text-slate-400"
                        />{" "}
                        Chuyên ngành quan tâm / Lộ trình AI
                      </label>
                      <input
                        type="text"
                        name="specializedField"
                        value={profileData.specializedField}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Frontend, Data Science..."
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500Transition-colors"
                      />
                      <p className="text-xs text-slate-400 mt-2">
                        EduSync sẽ dùng thông tin này để gợi ý các khóa học phù
                        hợp nhất.
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faBriefcase}
                          className="text-slate-400"
                        />{" "}
                        Mục tiêu học tập của bạn
                      </label>
                      <textarea
                        name="learningGoal"
                        value={profileData.learningGoal}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium leading-relaxed focus:ring-2 focus:ring-blue-500 Transition-colors"
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2.5 text-[#0077B5]">
                          <FontAwesomeIcon
                            icon={faLinkedin}
                            className="text-base w-5 shrink-0"
                          />{" "}
                          Hồ sơ LinkedIn
                        </label>
                        <input
                          type="url"
                          name="linkedin"
                          value={profileData.linkedin}
                          onChange={handleInputChange}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500Transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2.5 text-[#181717]">
                          <FontAwesomeIcon
                            icon={faGithub}
                            className="text-base w-5 shrink-0"
                          />{" "}
                          Tài khoản GitHub
                        </label>
                        <input
                          type="url"
                          name="github"
                          value={profileData.github}
                          onChange={handleInputChange}
                          placeholder="https://github.com/..."
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500Transition-colors"
                        />
                      </div>
                    </div>
                  </form>
                )}

                {/* TAB 3: CÀI ĐẶT TÀI KHOẢN (ĐỔI MẬT KHẨU) */}
                {activeTab === "security" && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-3 mb-6">
                        <FontAwesomeIcon
                          icon={faLock}
                          className="text-amber-500"
                        />{" "}
                        Thay đổi mật khẩu tài khoản
                      </h3>
                      <form className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                        <div className="sm:col-span-2 relative">
                          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                            Mật khẩu hiện tại
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 Transition-colors"
                          />
                        </div>
                        <div className="relative">
                          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                            Mật khẩu mới
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 Transition-colors"
                          />
                        </div>
                        <div className="relative">
                          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                            Xác nhận mật khẩu mới
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 Transition-colors"
                          />
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                          <button className="px-6 py-3 bg-white text-amber-600 border border-amber-300 font-bold rounded-xl hover:bg-amber-50 hover:border-amber-400 Transition-all active:scale-95 flex items-center gap-2.5">
                            Cập nhật mật khẩu an toàn
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LearnerProfilePage;
