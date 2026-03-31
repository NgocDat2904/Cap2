import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faEye,
  faEyeSlash,
  faShieldHalved,
  faArrowRight,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import myLogo from "../assets/logo.png"; // Nhớ trỏ đúng đường dẫn logo mẹ nhé

const ForceChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setError("");
    // Giả lập gọi API thành công và chuyển hướng
    alert("Đổi mật khẩu thành công! Chào mừng bạn đến với EduSync Dashboard.");
    // Điều hướng sang trang Dashboard ở đây
  };

  return (
    // Bỏ hẳn layout cũ, dùng 1 trang full màn hình với background gradient nhẹ
    <main className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-fade-slide-up">
        {/* Logo EduSync */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <img src={myLogo} alt="EduSync Logo" className="h-12 w-auto" />
            <span className="font-irish text-3xl font-bold text-blue-900">
              EduSync
            </span>
          </div>
        </div>

        {/* Khối Form chính */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 text-2xl mx-auto mb-4 border border-amber-100">
              <FontAwesomeIcon icon={faShieldHalved} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Cập nhật bảo mật
            </h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Vì lý do an toàn, vui lòng thay đổi mật khẩu mặc định trước khi
              truy cập vào hệ thống lần đầu tiên.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Mật khẩu mới */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Mật khẩu mới
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-4 top-3.5 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {/* Input Xác nhận mật khẩu */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-4 top-3.5 text-slate-400"
                />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                  />
                </button>
              </div>
            </div>

            {/* Hiển thị lỗi nếu có */}
            {error && (
              <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 animate-fade-slide-up">
                {error}
              </p>
            )}

            {/* Yêu cầu mật khẩu */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs font-bold text-slate-700 mb-2">
                Mật khẩu của bạn phải có:
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5">
                <li
                  className={`flex items-center gap-2 ${newPassword.length >= 8 ? "text-emerald-600 font-bold" : ""}`}
                >
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className={
                      newPassword.length >= 8
                        ? "text-emerald-500"
                        : "text-slate-300"
                    }
                  />{" "}
                  Ít nhất 8 ký tự
                </li>
              </ul>
            </div>

            {/* Nút Submit */}
            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
            >
              Lưu mật khẩu & Đăng nhập <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8 font-medium">
          Hệ thống học tập thông minh EduSync © 2026
        </p>
      </div>
    </main>
  );
};

export default ForceChangePassword;
