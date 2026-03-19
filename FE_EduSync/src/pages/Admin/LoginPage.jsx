import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import myLogo from "../../assets/logo.png";
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faShieldHalved,
  faArrowRightToBracket,
} from "@fortawesome/free-solid-svg-icons";

const AdminLoginPage = () => {
  const navigate = useNavigate();

  // State quản lý form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Giả lập call API đăng nhập
    setTimeout(() => {
      if (email === "admin@edusync.com" && password === "admin123") {
        setIsLoading(false);
        navigate("/admin/dashboard"); // Chuyển hướng vào Dashboard
      } else {
        setIsLoading(false);
        setError("Tài khoản hoặc mật khẩu quản trị không chính xác.");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-blue-500/30">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* THẺ FORM ĐĂNG NHẬP (Kính mờ - Glassmorphism) */}
      <div className="animate-fade-slide-up relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl shadow-black/50 p-8 sm:p-10">
        {/* HEADER: Logo & Tiêu đề */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 shadow-inner mb-5">
            <img
              src={myLogo}
              alt="EduSync Logo"
              className="w-10 h-10 brightness-0 invert drop-shadow-md"
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            EduSync System
          </h1>
          <p className="text-sm font-medium text-blue-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faShieldHalved} />
            Admin Portal
          </p>
        </div>

        {/* THÔNG BÁO LỖI */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-medium rounded-xl text-center animate-pulse">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Email quản trị
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faEnvelope} className="text-slate-500" />
              </div>
              <input
                type="email"
                required
                placeholder="admin@edusync.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-slate-600 font-medium"
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-slate-300">
                Mật khẩu
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faLock} className="text-slate-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-11 pr-12 py-3.5 bg-slate-950/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-slate-600 font-medium tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-blue-400 transition-colors"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-2 py-3.5 rounded-xl text-white font-bold transition-all flex justify-center items-center gap-2
              ${
                isLoading
                  ? "bg-slate-700 cursor-not-allowed text-slate-400"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-[0.98]"
              }`}
          >
            {isLoading ? (
              "Đang xác thực..."
            ) : (
              <>
                Đăng nhập hệ thống{" "}
                <FontAwesomeIcon icon={faArrowRightToBracket} />
              </>
            )}
          </button>
        </form>

        {/* Footer Cảnh báo bảo mật */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Khu vực hạn chế. Mọi hành vi truy cập trái phép{" "}
            <br className="hidden sm:block" />
            sẽ bị ghi log và xử lý theo quy định.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
