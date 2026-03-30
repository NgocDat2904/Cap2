import React, { useState, useRef, useEffect } from "react";
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
  faPhone,
  faVenusMars,
  faBirthdayCake,
  faMapMarkerAlt,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faGithub,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

// 🚨 IMPORT API
import {
  getProfileAPI,
  updateProfileAPI,
  uploadAvatarAPI,
} from "../../services/userAPI";
import {
  getInstructorProfileAPI,
  updateInstructorProfileAPI,
} from "../../services/instructorAPI";

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
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    address: "",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    headline: "",
    bio: "",
    specializations: "",
    linkedin: "",
    github: "",
    youtube: "",
    website: "",
    totalStudents: 0,
    totalCourses: 0,
    isVerified: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const fileInputRef = useRef(null);

  // 1. GỌI API LẤY DATA (Trộn data từ 2 bảng User và Instructor)
  useEffect(() => {
    const fetchAllProfileData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        // Gọi song song 2 API cho lẹ
        const [userData, instData] = await Promise.all([
          getProfileAPI(token),
          getInstructorProfileAPI(token),
        ]);

        // Trộn 2 cục data lại và map đúng key để đưa lên giao diện
        setProfileData((prev) => ({
          ...prev,
          ...userData, // fullName, email, phone, dob, gender, address, avatarUrl
          headline: instData.headline || "",
          bio: instData.bio || "",
          specializations: instData.specializations || "",
          // Đổi tên biến backend (có _url) sang tên biến frontend cho khớp form
          linkedin: instData.linkedin_url || "",
          github: instData.github_url || "",
          youtube: instData.youtube_url || "",
          website: instData.website_url || "",
        }));
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllProfileData();
  }, []);

  // 2. TÁCH DATA & GỌI API LƯU (Chia làm 2 luồng)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem("access_token");

      // Gói 1: Thông tin chung (Gửi cho userAPI)
      const userPayload = {
        fullName: profileData.fullName,
        phone: profileData.phone,
        gender: profileData.gender,
        dob: profileData.dob,
        address: profileData.address,
      };

      // Gói 2: Thông tin Giảng viên (Gửi cho instructorAPI)
      const instructorPayload = {
        headline: profileData.headline,
        bio: profileData.bio,
        specializations: profileData.specializations,
        // Ép lại tên biến cho chuẩn với Backend
        linkedin_url: profileData.linkedin,
        github_url: profileData.github,
        youtube_url: profileData.youtube,
        website_url: profileData.website,
      };

      // Bắn 2 viên đạn cùng lúc
      await Promise.all([
        updateProfileAPI(userPayload, token),
        updateInstructorProfileAPI(instructorPayload, token),
      ]);

      alert(
        "✨ Cập nhật hồ sơ thành công! Hào quang của bạn đang tỏa sáng rực rỡ!",
      );
    } catch (error) {
      console.error("Lỗi lưu hồ sơ:", error);
      alert("Lưu thất bại! Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  // 3. XỬ LÝ UPLOAD AVATAR (Dùng chung API với Learner)
  const handleAvatarClick = () => fileInputRef.current.click();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setProfileData((prev) => ({ ...prev, avatarUrl: previewUrl }));

    try {
      setIsUploadingAvatar(true);
      const token = localStorage.getItem("access_token");
      const data = await uploadAvatarAPI(file, token);

      if (data && data.url) {
        setProfileData((prev) => ({ ...prev, avatarUrl: data.url }));
        alert("✨ Đổi ảnh đại diện thành công!");
      }
    } catch (error) {
      alert("Lỗi tải ảnh!");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const tabs = [
    {
      id: "personal",
      label: "Thông tin cá nhân & Chuyên môn",
      icon: faUserEdit,
    },
    { id: "social", label: "Liên kết bên ngoài", icon: faLink },
    { id: "account", label: "Cài đặt tài khoản", icon: faGear },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-50 text-slate-400">
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-4xl animate-spin text-blue-500 mb-4"
        />
        <p className="font-bold">Đang tải hào quang giảng viên...</p>
      </div>
    );
  }

  // ====================================================================
  // PHẦN RENDER HTML (GIỮ NGUYÊN HOÀN TOÀN GIAO DIỆN XỊN XÒ CỦA MẸ)
  // ====================================================================
  return (
    <main className="animate-fade-slide-up w-full pb-16">
      <div className="p-4 sm:p-6 lg:p-8 relative overflow-visible z-10">
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
            disabled={isSaving}
            className={`px-6 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/30 active:scale-95 ${isSaving ? "opacity-70 cursor-wait" : ""}`}
          >
            <FontAwesomeIcon
              icon={isSaving ? faSpinner : faSave}
              className={isSaving ? "animate-spin" : ""}
            />
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10 overflow-visible">
          {/* CỘT TRÁI */}
          <div className="w-full lg:w-1/3 space-y-8 sticky top-24 relative z-10">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center relative overflow-visible">
              {/* Vùng Avatar */}
              <div className="relative inline-block mb-6">
                <img
                  src={profileData.avatarUrl}
                  alt="Instructor Avatar"
                  className={`w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl ring-2 ring-blue-100 ${isUploadingAvatar ? "opacity-50" : ""}`}
                />
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="text-3xl text-blue-600 animate-spin"
                    />
                  </div>
                )}
                <button
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors border-2 border-white active:scale-95"
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

              <h2 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2.5">
                {profileData.fullName}
                {profileData.isVerified && (
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-blue-500 text-lg"
                    title="Đã xác minh"
                  />
                )}
              </h2>
              <p className="text-sm font-semibold text-blue-700 mt-2 px-4 py-1.5 bg-blue-50 rounded-full inline-block leading-normal">
                {profileData.headline || "Chưa có tiêu đề nghề nghiệp"}
              </p>
              <div className="border-t border-slate-100 my-8"></div>
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

          {/* CỘT PHẢI */}
          <div className="w-full lg:w-2/3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-visible relative z-0">
            <div className="border-b border-slate-100 flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-5 text-sm font-bold border-b-2 whitespace-nowrap transition-colors shrink-0 ${activeTab === tab.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="text-lg" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 sm:p-8 space-y-8 animate-fade-slide-up">
              {activeTab === "personal" && (
                <form className="space-y-8">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faUserCircle}
                        className="text-blue-500"
                      />{" "}
                      Thông tin cơ bản
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                          Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={profileData.fullName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faPhone}
                            className="text-slate-400"
                          />{" "}
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
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
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                        >
                          <option>Nam</option>
                          <option>Nữ</option>
                          <option>Khác</option>
                        </select>
                      </div>
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
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                        />
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
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2 mt-8">
                      <FontAwesomeIcon
                        icon={faBriefcase}
                        className="text-blue-500"
                      />{" "}
                      Hồ sơ Chuyên môn
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                          Tiêu đề nghề nghiệp / Chức danh
                        </label>
                        <input
                          type="text"
                          name="headline"
                          value={profileData.headline}
                          onChange={handleInputChange}
                          placeholder="Ví dụ: Senior AI Engineer | Giảng viên Python"
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-slate-400 mt-2">
                          Dòng này sẽ hiển thị ngay dưới tên của bạn trên mọi
                          khóa học. Viết ngắn gọn, súc tích và ấn tượng.
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                          Giới thiệu bản thân (Bio)
                        </label>
                        <textarea
                          name="bio"
                          value={profileData.bio}
                          onChange={handleInputChange}
                          rows="5"
                          placeholder="Kể cho học viên nghe về kinh nghiệm..."
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium leading-relaxed focus:ring-2 focus:ring-blue-500 resize-y"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faGraduationCap}
                            className="text-slate-400"
                          />{" "}
                          Lĩnh vực giảng dạy chính
                        </label>
                        <input
                          type="text"
                          name="specializations"
                          value={profileData.specializations}
                          onChange={handleInputChange}
                          placeholder="Ví dụ: Python, Machine Learning, UI/UX..."
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}

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
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </form>
              )}

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
                      {/* ... (Giữ nguyên form đổi mật khẩu của mẹ) ... */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                          Mật khẩu hiện tại
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      {/* ... (Các input khác) ... */}
                    </form>
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
