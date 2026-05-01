import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faCamera,
  faBirthdayCake,
  faVenusMars,
  faPhone,
  faMapMarkerAlt,
  faLock,
  faSave,
  faEnvelope,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
  getProfileAPI,
  updateProfileAPI,
  uploadAvatarAPI,
} from "../../services/userAPI";

const LearnerProfilePage = () => {
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    phone: "",
    dob: "",
    gender: "",
    address: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;
        const data = await getProfileAPI(token);
        setProfileData((prev) => ({ ...prev, ...data }));
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      await updateProfileAPI(profileData, token);
      alert("Your profile has been updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleAvatarClick = () => fileInputRef.current.click();

  // =========================================================================
  //  HÀM UPLOAD AVATAR ĐÃ ĐƯỢC DÙNG SERVICE
  // =========================================================================
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 1. Hiển thị ảnh preview ngay lập tức
    const previewUrl = URL.createObjectURL(file);
    setProfileData((prev) => ({ ...prev, avatarUrl: previewUrl }));

    try {
      setIsUploadingAvatar(true);
      const token = localStorage.getItem("access_token");

      // 2. Giao việc gọi API cho  Service xử lý
      const data = await uploadAvatarAPI(file, token);

      // 3. Nhận kết quả và cập nhật lại Avatar thật
      if (data && data.url) {
        setProfileData((prev) => ({ ...prev, avatarUrl: data.url }));
        alert("Avatar uploaded successfully!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload avatar! Please try again.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <main className="animate-fade-slide-up w-full pb-16">
      <div className="p-4 sm:p-6 lg:p-8 relative">
        {/* HEADER TRANG */}
        <div className="flex flex-col sm:flex-row md:items-center justify-between gap-4 mb-10 border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              My Profile
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Manage your personal information and track your development progress.
            </p>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className={`px-6 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:scale-95 ${isSaving ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            {isSaving ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faSave} />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* BỐ CỤC CHÍNH 2 CỘT */}
        <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">
          {/* CỘT TRÁI: TỔNG QUAN HỒ SƠ & GAMIFICATION */}
          <div className="w-full lg:w-1/3 space-y-8 sticky top-24 relative z-10">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center relative overflow-visible">
              <div className="relative inline-block mb-6">
                <img
                  src={profileData.avatarUrl}
                  alt="Learner Avatar"
                  className={`w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl ring-2 ring-blue-100 transition-opacity ${isUploadingAvatar ? "opacity-50" : "opacity-100"}`}
                />

                {/* Vòng xoay (Spinner) hiện lên khi đang upload */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="text-4xl text-blue-600 animate-spin drop-shadow-md"
                    />
                  </div>
                )}

                <button
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className={`absolute -bottom-2 -right-2 w-10 h-10 text-white rounded-xl flex items-center justify-center shadow-lg transition-colors border-2 border-white ${isUploadingAvatar ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"}`}
                  title="Change avatar"
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
                {profileData.fullName || "EduSync Learner"}
              </h2>

              <div className="border-t border-slate-100 my-8"></div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-slate-400 text-lg w-5 shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Account Email
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
            {/* Khối Tabs Form Chi tiết */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-visible relative z-0">
              <div className="border-b border-slate-100 flex overflow-x-auto scrollbar-hide">
                {[
                  {
                    id: "personal",
                    label: "Personal Information",
                    icon: faUserCircle,
                  },
                  { id: "security", label: "Account Settings", icon: faLock },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-6 py-5 text-sm font-bold border-b-2 whitespace-nowrap transition-colors shrink-0 ${activeTab === tab.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200"}`}
                  >
                    <FontAwesomeIcon icon={tab.icon} className="text-lg" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* NỘI DUNG CÁC TAB */}
              <div className="p-6 sm:p-8 space-y-8 animate-fade-slide-up">
                {activeTab === "personal" && (
                  <form className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faUserCircle}
                          className="text-slate-400"
                        />{" "}
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faBirthdayCake}
                          className="text-slate-400"
                        />{" "}
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={profileData.dob}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faVenusMars}
                          className="text-slate-400"
                        />{" "}
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={profileData.gender}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faPhone}
                          className="text-slate-400"
                        />{" "}
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        placeholder="+84 905 123 456"
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="text-slate-400"
                        />{" "}
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </form>
                )}

                {activeTab === "security" && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-3 mb-6">
                        <FontAwesomeIcon
                          icon={faLock}
                          className="text-amber-500"
                        />{" "}
                        Change Password
                      </h3>
                      <form className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                        <div className="sm:col-span-2 relative">
                          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                            Current Password
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 transition-colors"
                          />
                        </div>
                        <div className="relative">
                          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                            New Password
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 transition-colors"
                          />
                        </div>
                        <div className="relative">
                          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 transition-colors"
                          />
                        </div>
                        <div className="sm:col-span-2 flex justify-end">
                          <button
                            type="button"
                            className="px-6 py-3 bg-white text-amber-600 border border-amber-300 font-bold rounded-xl hover:bg-amber-50 hover:border-amber-400 transition-all active:scale-95 flex items-center gap-2.5"
                          >
                            Update Secure Password
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