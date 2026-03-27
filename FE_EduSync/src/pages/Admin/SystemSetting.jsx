import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCogs,
  faBuilding,
  faEnvelope,
  faImage,
  faKey,
  faUserShield,
  faSave,
  faCloudArrowUp,
} from "@fortawesome/free-solid-svg-icons";

// =========================================================================
// MOCK DATA: CÀI ĐẶT HỆ THỐNG GIẢ LẬP
// =========================================================================
const initialSettings = {
  siteName: "Hệ thống Quản lý Đào tạo EduSync",
  contactEmail: "contact@edusync.vn",
  siteLogo: null, // Sẽ lưu File Object
  maintenanceMode: false,
  apiTokenLimit: 60, // Phút
};

const AdminSettings = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [logoPreview, setLogoPreview] = useState(null);

  // Xử lý upload logo
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSettings({ ...settings, siteLogo: file });
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveSettings = () => {
    console.log("Dữ liệu cài đặt mới:", settings);
    alert("🎉 Đã lưu cài đặt hệ thống thành công!");
    // TODO: Bắn API PUT /admin/settings
  };

  return (
    <div className="flex-1 p-6 sm:p-8 bg-slate-50 min-h-screen font-sans animate-fade-slide-up pb-20 overflow-y-auto max-h-screen scrollbar-thin">
      {/* HEADER & NÚT LƯU CHUNG */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <FontAwesomeIcon icon={faCogs} className="text-blue-600" />
            Cài đặt Hệ thống
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Cấu hình các tham số cốt lõi và bảo mật của nền tảng EduSync.
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-black rounded-xl hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-md shadow-blue-700/20 active:scale-95 flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faSave} />
          Lưu tất cả cài đặt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* KHỐI 1: THÔNG TIN HỆ THỐNG & BRANDING */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-5">
          <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <FontAwesomeIcon icon={faBuilding} className="text-blue-500" />{" "}
            branding & Thông tin
          </h3>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Tên hệ thống (Site Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) =>
                setSettings({ ...settings, siteName: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Email liên hệ chính
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) =>
                setSettings({ ...settings, contactEmail: e.target.value })
              }
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Logo hệ thống
            </label>
            <div
              className="relative group border-2 border-dashed border-slate-300 rounded-2xl overflow-hidden bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={() => document.getElementById("logoInput").click()}
            >
              <input
                type="file"
                id="logoInput"
                onChange={handleLogoChange}
                accept="image/*"
                className="hidden"
              />
              {logoPreview ? (
                <div className="relative aspect-video w-full sm:w-1/2 mx-auto">
                  <img
                    src={logoPreview}
                    alt="Site Logo Preview"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-semibold flex items-center gap-2">
                      <FontAwesomeIcon icon={faImage} /> Thay đổi Logo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-12 px-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon
                      icon={faCloudArrowUp}
                      className="text-2xl"
                    />
                  </div>
                  <p className="text-slate-700 font-bold mb-1">
                    Upload Site Logo
                  </p>
                  <p className="text-slate-500 text-sm">
                    Định dạng PNG, JPG, tối đa 5MB.Chuẩn ngang 16:9.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: BẢO MẬT & API */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6 md:sticky top-24">
          {/* Thẻ Bảo mật (Giả lập) */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-slate-800 mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
              <FontAwesomeIcon icon={faUserShield} className="text-blue-500" />{" "}
              Tài khoản & Bảo mật
            </h3>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <FontAwesomeIcon icon={faKey} className="text-blue-400 w-4" />{" "}
                  Đổi mật khẩu Admin chính
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Yêu cầu xác minh Email, Mật khẩu tối thiểu 8 ký tự.
                </p>
              </div>
              <button className="px-4 py-2 bg-white text-blue-700 font-bold text-sm rounded-lg border border-slate-200 hover:bg-slate-50 transition active:scale-95">
                Thiết lập
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 disabled">
              <div>
                <h4 className="font-bold text-slate-400">
                  Cài đặt 2FA (Bảo mật 2 lớp)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sử dụng Google Authenticator hoặc SMS. (Cài đặt mặc định tắt)
                </p>
              </div>
              <button
                disabled
                className="px-4 py-2 bg-slate-100 text-slate-400 font-bold text-sm rounded-lg border border-slate-200 cursor-not-allowed"
              >
                Đã tắt
              </button>
            </div>
          </div>

          {/* Thẻ Bảo trì hệ thống */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mt-2 flex-shrink-0"></span>
              <div>
                <h4 className="font-bold text-slate-800">
                  Thông báo bảo trì hệ thống
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cho phép Admin ghim thông báo bảo trì lên trang chủ cho mọi
                  người dùng.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maintenanceMode: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
