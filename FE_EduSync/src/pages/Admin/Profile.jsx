import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserShield,
  faEnvelope,
  faCamera,
  faKey,
  faSave,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import {
  getProfileAPI,
  updateProfileAPI,
  uploadAvatarAPI,
} from "../../services/userAPI";

// =========================================================================
// HELPER
// =========================================================================
const getToken = () => localStorage.getItem("access_token");

const DEFAULT_AVATAR = (name) =>
  `https://ui-avatars.com/api/?background=1e3a5f&color=fff&bold=true&size=200&name=${encodeURIComponent(name || "A")}`;

// =========================================================================
// TOAST COMPONENT (inline, nhẹ)
// =========================================================================
const Toast = ({ type, message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles =
    type === "success"
      ? "bg-emerald-50 border-emerald-300 text-emerald-800"
      : "bg-red-50 border-red-300 text-red-800";
  const icon = type === "success" ? faCheckCircle : faExclamationTriangle;

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-lg text-sm font-semibold animate-fade-slide-up ${styles}`}
    >
      <FontAwesomeIcon icon={icon} />
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 font-bold">✕</button>
    </div>
  );
};

// =========================================================================
// MAIN COMPONENT
// =========================================================================
const AdminProfile = () => {
  // --- State form ---
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    avatarUrl: "",
  });
  const [formData, setFormData] = useState({ ...profile }); // bản nháp đang chỉnh sửa

  // --- State UI ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success"|"error", message }

  // --- State đổi mật khẩu ---
  const [showPwSection, setShowPwSection] = useState(false);
  const [pwForm, setPwForm] = useState({ old: "", new: "", confirm: "" });
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const fileInputRef = useRef(null);

  // =========================================================================
  // FETCH PROFILE
  // =========================================================================
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = getToken();
        const data = await getProfileAPI(token);
        const p = {
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          dob: data.dob || "",
          gender: data.gender || "",
          address: data.address || "",
          avatarUrl: data.avatarUrl || "",
        };
        setProfile(p);
        setFormData(p);
      } catch (err) {
        showToast("error", err?.response?.data?.detail || err.message || "Failed to load information.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // =========================================================================
  // HELPERS
  // =========================================================================
  const showToast = (type, message) => setToast({ type, message });

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // =========================================================================
  // SAVE PROFILE
  // =========================================================================
  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      showToast("error", "Full name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const token = getToken();
      await updateProfileAPI(
        {
          fullName: formData.fullName,
          phone: formData.phone,
          dob: formData.dob || null,
          gender: formData.gender,
          address: formData.address,
        },
        token
      );
      setProfile({ ...formData }); // đồng bộ lại profile gốc
      showToast("success", "Profile updated successfully!");
    } catch (err) {
      showToast("error", err?.response?.data?.detail || err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================================
  // UPLOAD AVATAR
  // =========================================================================
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "Only image files are accepted (jpg, png, webp...).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Image must not exceed 5MB.");
      return;
    }

    // Preview tức thì
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, avatarUrl: previewUrl }));
    setProfile((prev) => ({ ...prev, avatarUrl: previewUrl }));

    setUploadingAvatar(true);
    try {
      const token = getToken();
      const res = await uploadAvatarAPI(file, token);
      const newUrl = res.avatarUrl;
      setFormData((prev) => ({ ...prev, avatarUrl: newUrl }));
      setProfile((prev) => ({ ...prev, avatarUrl: newUrl }));
      showToast("success", "Avatar updated successfully!");
    } catch (err) {
      // Hoàn nguyên preview nếu lỗi
      setFormData((prev) => ({ ...prev, avatarUrl: profile.avatarUrl }));
      setProfile((prev) => ({ ...prev, avatarUrl: profile.avatarUrl }));
      showToast("error", err?.response?.data?.detail || "Image upload failed.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-500 animate-spin" />
          <p className="font-semibold">Loading information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 sm:p-8 bg-slate-50 min-h-screen font-sans animate-fade-slide-up pb-20 overflow-y-auto max-h-screen scrollbar-thin">
      {/* TOAST */}
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Admin Profile
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Manage your personal information and account security settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* CỘT TRÁI: AVATAR & BADGES */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm text-center">
          {/* Avatar */}
          <div
            className="relative w-40 h-40 mx-auto mb-6 group cursor-pointer"
            onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
          >
            <img
              src={formData.avatarUrl || DEFAULT_AVATAR(formData.fullName)}
              alt="Avatar Admin"
              className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl group-hover:opacity-60 transition-opacity"
              onError={(e) => { e.target.src = DEFAULT_AVATAR(formData.fullName); }}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadingAvatar ? (
                <FontAwesomeIcon icon={faSpinner} className="text-3xl text-white animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faCamera} className="text-3xl text-white" />
              )}
            </div>
            <div className="absolute bottom-1 right-3 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white border-4 border-white">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <h2 className="text-2xl font-extrabold text-slate-800">
            {profile.fullName || "Admin"}
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1 flex items-center justify-center gap-1.5">
            <FontAwesomeIcon icon={faEnvelope} className="text-blue-500" />
            {profile.email}
          </p>

          <div className="mt-5 space-y-3 flex flex-col items-center">
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1.5 border border-amber-200">
              <FontAwesomeIcon icon={faUserShield} /> Administrator
            </span>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1.5 border border-blue-100">
              Security level:{" "}
              <span className="font-black text-blue-800">Verified</span>
            </span>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition duration-300 shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
            >
              {saving ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faSave} />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => setShowPwSection(!showPwSection)}
              className="w-full py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-2xl hover:bg-slate-100 transition duration-300 flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faKey} />
              {showPwSection ? "Hide Password Settings" : "Change Password"}
            </button>
          </div>

          {/* Gợi ý ảnh đại diện */}
          <p className="text-xs text-slate-400 mt-4">
            Click the image to change avatar (JPG, PNG, max 5MB)
          </p>
        </div>

        {/* CỘT PHẢI: FORM */}
        <div className="md:col-span-2 space-y-6">
          {/* THÔNG TIN CÁ NHÂN */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm">
            <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              {/* Họ và tên */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  placeholder="Enter full name"
                />
              </div>

              {/* Email (readonly) */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Email (System)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Ngày sinh */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleChange("dob", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                />
              </div>

              {/* Giới tính */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer focus:border-blue-500 transition"
                >
                  <option value="">-- Select Gender --</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Địa chỉ */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Current Address
                </label>
                <textarea
                  rows="3"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition resize-y"
                  placeholder="Enter address"
                />
              </div>
            </div>

            <p className="text-xs text-slate-400 font-medium text-right mt-6">
              Last updated: {new Date().toLocaleDateString("en-US")}
            </p>
          </div>

          {/* ĐỔI MẬT KHẨU (ẩn/hiện) */}
          {showPwSection && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm animate-fade-slide-up">
              <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                <FontAwesomeIcon icon={faKey} className="text-blue-500" />
                Change Password
              </h3>
              <div className="space-y-4 max-w-md">
                {/* Mật khẩu cũ */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPw ? "text" : "password"}
                      value={pwForm.old}
                      onChange={(e) => setPwForm((p) => ({ ...p, old: e.target.value }))}
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPw(!showOldPw)}
                      className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-blue-600"
                    >
                      <FontAwesomeIcon icon={showOldPw ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                {/* Mật khẩu mới */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={pwForm.new}
                      onChange={(e) => setPwForm((p) => ({ ...p, new: e.target.value }))}
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-blue-600"
                    >
                      <FontAwesomeIcon icon={showNewPw ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                {/* Xác nhận */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-700 font-medium outline-none transition ${
                      pwForm.confirm && pwForm.confirm !== pwForm.new
                        ? "border-red-400 focus:ring-red-200"
                        : "border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                    placeholder="Re-enter new password"
                  />
                  {pwForm.confirm && pwForm.confirm !== pwForm.new && (
                    <p className="text-xs text-red-500 mt-1">⚠ Passwords do not match</p>
                  )}
                </div>

                <p className="text-xs text-slate-400 pt-2">
                  * Password change functionality requires integration with the backend change-password API.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;