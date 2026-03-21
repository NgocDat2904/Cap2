import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { loginInstructorAPI } from "../../services/authService";
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faCircleNotch,
} from "@fortawesome/free-solid-svg-icons";
import myLogo from "../../assets/logo.png";

const InstructorLoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // gọi API đăng nhập giảng viên
      const response = await loginInstructorAPI(email, password);
      // lưu token
      if (response && response.token) {
        localStorage.setItem("instructorToken", response.token);
      }
      navigate("/instructor/dashboard");
    } catch (err) {
      console.error("Lỗi đăng nhập Instructor:", err);
      // Xử lý thông báo lỗi rõ ràng nếu thất bại
      if (err.response && err.response.status === 401) {
        setError("Email hoặc mật khẩu không chính xác!");
      } else if (err.response && err.response.status === 404) {
        setError("Tài khoản giảng viên này không tồn tại trên hệ thống!");
      } else {
        setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-10 px-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>

      <div className="animate-fade-slide-up w-full max-w-[520px] z-10 flex flex-col items-center">
        {/* HEADER LOGO */}
        <div className="w-full flex items-center justify-center gap-3 mb-8">
          <img
            src={myLogo}
            alt="EduSync Logo"
            className="w-auto h-12 drop-shadow-sm"
          />
          <div className="flex flex-col items-start">
            <h1 className="font-irish text-3xl tracking-wider text-blue-900 font-bold leading-none">
              EduSync
            </h1>
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">
              Instructor Portal
            </p>
          </div>
        </div>

        {/* TIÊU ĐỀ */}
        <div className="w-full text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
            Chào mừng trở lại!
          </h2>
          <p className="text-slate-500 font-medium">
            Đăng nhập để quản lý khóa học và kết nối với học viên
          </p>
        </div>

        {/* MAIN FORM CARD (Glassmorphism tinh tế) */}
        <div className="w-full bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-blue-900/10 p-8 sm:p-10 border border-white">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-2xl text-center flex items-center justify-center gap-2 animate-fade-slide-up">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2.5">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  />
                </div>
                <input
                  type="email"
                  required
                  placeholder="instructor@edusync.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-800 font-medium placeholder-slate-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <label className="block text-sm font-bold text-slate-700">
                  Mật khẩu
                </label>
                <a
                  href="#"
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-800 font-medium tracking-widest placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {/* Ghi nhớ đăng nhập */}
            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600 cursor-pointer transition-all"
              />
              <label
                htmlFor="remember"
                className="text-sm font-semibold text-slate-600 cursor-pointer select-none"
              >
                Ghi nhớ thiết bị này
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl text-white font-bold transition-all duration-300 flex justify-center items-center gap-2
                ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 active:scale-[0.98]"
                }`}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon
                    icon={faCircleNotch}
                    className="animate-spin text-lg"
                  />
                  Đang xác thực...
                </>
              ) : (
                <>Đăng nhập</>
              )}
            </button>
          </form>

          {/* Đăng ký Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm font-medium text-slate-500">
            Chưa có tài khoản giảng viên?{" "}
            <Link
              to="/instructor/register"
              className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-all"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>

        {/* THỐNG KÊ (STATS) - Được bọc trong một khối nền mờ sang trọng */}
        <div className="w-full mt-10 p-6 bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl shadow-sm">
          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-200/60">
            <div>
              <h3 className="text-2xl font-black text-slate-900">500+</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                Giảng viên
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">10K+</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                Học viên
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">1K+</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                Khóa học
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorLoginPage;
