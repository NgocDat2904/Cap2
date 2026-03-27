import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserShield,
  faEnvelope,
  faCamera,
  faKey,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

// =========================================================================
// MOCK DATA: DỮ LIỆU ADMIN (Sẽ lấy từ API GET /admin/profile)
// =========================================================================
const initialProfile = {
  fullName: "Lê Admin",
  email: "admin.edusync@gmail.com",
  role: "super_admin",
  securityLevel: "Đã xác minh",
  phone: "0901234567",
  dob: "1995-12-25",
  gender: "Nữ",
  address: "Quận Hải Châu, Đà Nẵng",
  avatarUrl: "https://i.pravatar.cc/150?img=47",
};

const AdminProfile = () => {
  const [profile, setProfile] = useState(initialProfile);

  // Format ngày sinh
  const formatDOB = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderRoleBadge = (role) => {
    if (role === "super_admin") {
      return (
        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1.5 border border-amber-200">
          <FontAwesomeIcon icon={faUserShield} /> Quản trị viên cấp cao
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 p-6 sm:p-8 bg-slate-50 min-h-screen font-sans animate-fade-slide-up pb-20 overflow-y-auto max-h-screen scrollbar-thin">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Hồ sơ Quản trị viên
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Quản lý thông tin cá nhân và cài đặt bảo mật tài khoản của bạn.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* CỘT TRÁI: AVATAR & BADGES */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm text-center">
          <div className="relative w-40 h-40 mx-auto mb-6 group cursor-pointer">
            <img
              src={profile.avatarUrl}
              alt="Avatar Admin"
              className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl group-hover:opacity-60 transition-opacity"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <FontAwesomeIcon
                icon={faCamera}
                className="text-3xl text-white"
              />
            </div>
            <div className="absolute bottom-1 right-3 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white border-4 border-white">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-800">
            {profile.fullName}
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1 flex items-center justify-center gap-1.5">
            <FontAwesomeIcon icon={faEnvelope} className="text-blue-500" />
            {profile.email}
          </p>

          <div className="mt-5 space-y-3 flex flex-col items-center">
            {renderRoleBadge(profile.role)}
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1.5 border border-blue-100">
              Cấp độ bảo mật:{" "}
              <span className="font-black text-blue-800">
                {profile.securityLevel}
              </span>
            </span>
          </div>

          <div className="mt-8 space-y-3">
            <button className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition duration-300 shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95">
              <FontAwesomeIcon icon={faSave} /> Lưu thay đổi
            </button>
            <button className="w-full py-3.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-2xl hover:bg-slate-100 transition duration-300 flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faKey} /> Đổi mật khẩu
            </button>
          </div>
        </div>

        {/* CỘT PHẢI: FORM THÔNG TIN CÁ NHÂN */}
        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/60 shadow-sm">
          <h3 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            Thông tin cá nhân
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) =>
                  setProfile({ ...profile, fullName: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Email (Hệ thống) <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Số điện thoại
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Ngày sinh
              </label>
              <input
                type="date"
                value={profile.dob}
                onChange={(e) =>
                  setProfile({ ...profile, dob: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Giới tính
              </label>
              <select
                value={profile.gender}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
              >
                <option>Nam</option>
                <option>Nữ</option>
                <option>Khác</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Địa chỉ hiện tại
              </label>
              <textarea
                rows="3"
                value={profile.address}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 resize-y"
              ></textarea>
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium text-center mt-10">
            Dữ liệu cập nhật từ lần cuối:{" "}
            {new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
