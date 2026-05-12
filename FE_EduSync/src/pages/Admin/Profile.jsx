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
// TOAST COMPONENT (Thông báo nhẹ)
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
  const [formData, setFormData] = useState({ ...profile });

  // --- State UI ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState(null); 

  // --- State đổi mật khẩu ---
  const [showPwSection, setShowPwSection] = useState(false);
  const [pwForm, setPwForm] = useState({ old: "", new: "", confirm: "" });
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const fileInputRef = useRef(null);

  // =========================================================================
  // TRUY XUẤT THÔNG TIN
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
        showToast("error", "Lỗi: Không thể tải thông tin hồ sơ từ máy chủ.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const showToast = (type, message) => setToast({ type, message });

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // =========================================================================
  // LƯU THÔNG TIN
  // =========================================================================
  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      showToast("error", "Họ và tên không được để trống.");
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
      setProfile({ ...formData });
      showToast("success", "Cập nhật thông tin cá nhân thành công!");
    } catch (err) {
      showToast("error", "Lưu thay đổi thất bại.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================================
  // TẢI LÊN ẢNH ĐẠI DIỆN
  // =========================================================================
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("error", "Định dạng không hợp lệ. Chỉ chấp nhận tệp tin hình ảnh.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Dung lượng ảnh quá lớn (vượt quá 5MB).");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, avatarUrl: previewUrl }));

    setUploadingAvatar(true);
    try {
      const token = getToken();
      const res = await uploadAvatarAPI(file, token);
      const newUrl = res.avatarUrl;
      setFormData((prev) => ({ ...prev, avatarUrl: newUrl }));
      setProfile((prev) => ({ ...prev, avatarUrl: newUrl }));
      showToast("success", "Thay đổi ảnh đại diện thành công!");
    } catch (err) {
      setFormData((prev) => ({ ...prev, avatarUrl: profile.avatarUrl }));
      // showToast("error", "Lỗi: Không thể tải ảnh lên máy chủ.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <FontAwesomeIcon icon={faSpinner} className="text-4xl text-blue-500 animate-spin" />
          <p className="font-semibold">Đang truy xuất dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 sm:p-8 bg-slate-50 min-h-screen font-sans animate-fade-slide-up pb-20 overflow-y-auto max-h-screen scrollbar-thin">
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {/* TIÊU ĐỀ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Hồ sơ Quản trị viên
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Quản lý thông tin cá nhân và thiết lập bảo mật tài khoản hệ thống.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* CỘT TRÁI: AVATAR & TRẠNG THÁI */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm text-center">
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
            <div className="absolute bottom-1 right-3 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white border-4 border-white shadow-md">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <h2 className="text-2xl font-extrabold text-slate-800">
            {profile.fullName || "Quản trị viên"}
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1 flex items-center justify-center gap-1.5">
            <FontAwesomeIcon icon={faEnvelope} className="text-blue-500" />
            {profile.email}
          </p>

          <div className="mt-5 space-y-3 flex flex-col items-center">
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1.5 border border-amber-200">
              <FontAwesomeIcon icon={faUserShield} /> Quyền Quản trị viên
            </span>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1.5 border border-blue-100">
              Trạng thái xác minh: <span className="font-black text-blue-800 uppercase">Đã xác thực</span>
            </span>
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition duration-300 shadow-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
            >
              {saving ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faSave} />}
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <button
              onClick={() => setShowPwSection(!showPwSection)}
              className="w-full py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-2xl hover:bg-slate-100 transition duration-300 flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faKey} />
              {showPwSection ? "Ẩn thiết lập mật khẩu" : "Đổi mật khẩu"}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 italic">
            Nhấp vào ảnh để thay đổi đại diện (JPG, PNG, tối đa 5MB)
          </p>
        </div>

        {/* CỘT PHẢI: FORM NHẬP LIỆU */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm">
            <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              Thông tin định danh
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Họ và tên <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 outline-none transition"
                  placeholder="Nhập đầy đủ họ tên"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email hệ thống</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Số điện thoại</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 outline-none transition"
                  placeholder="Ví dụ: 090xxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày sinh</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleChange("dob", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Giới tính</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold outline-none cursor-pointer focus:border-blue-500 transition"
                >
                  <option value="">-- Chọn giới tính --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Địa chỉ liên lạc</label>
                <textarea
                  rows="3"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:border-blue-500 outline-none transition resize-y"
                  placeholder="Địa chỉ hiện tại của bạn"
                />
              </div>
            </div>
          </div>

          {/* ĐỔI MẬT KHẨU */}
          {showPwSection && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm animate-fade-slide-up">
              <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                <FontAwesomeIcon icon={faKey} className="text-blue-500" />
                Thay đổi mật khẩu tài khoản
              </h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input
                      type={showOldPw ? "text" : "password"}
                      value={pwForm.old}
                      onChange={(e) => setPwForm((p) => ({ ...p, old: e.target.value }))}
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium outline-none"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowOldPw(!showOldPw)} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-blue-600">
                      <FontAwesomeIcon icon={showOldPw ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={pwForm.new}
                      onChange={(e) => setPwForm((p) => ({ ...p, new: e.target.value }))}
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium outline-none"
                      placeholder="Tối thiểu 8 ký tự"
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-blue-600">
                      <FontAwesomeIcon icon={showNewPw ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-slate-700 font-medium outline-none transition ${
                      pwForm.confirm && pwForm.confirm !== pwForm.new ? "border-red-400" : "border-slate-200"
                    }`}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  {pwForm.confirm && pwForm.confirm !== pwForm.new && (
                    <p className="text-xs text-red-500 mt-1 italic">Mật khẩu xác nhận không khớp</p>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 pt-2">
                  * Chức năng thay đổi mật khẩu yêu cầu tích hợp với API bảo mật của hệ thống.
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