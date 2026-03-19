import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import myLogo from "../../assets/logo.png"; // Điều chỉnh lại đường dẫn logo nếu cần
// import { loginInstructorAPI } from "../../services/authService"; // Mở khóa dòng này khi ghép API

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
      // GỢI Ý GHÉP API SAU NÀY:
      // const data = await loginInstructorAPI(email, password);
      // localStorage.setItem("instructor_token", data.access_token);

      console.log("Đăng nhập với:", { email, password, rememberMe });

      // Giả lập delay 1 giây để thấy hiệu ứng loading
      setTimeout(() => {
        setIsLoading(false);
        navigate("/instructor/dashboard"); // Chuyển vào Dashboard Giảng viên
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Email hoặc mật khẩu không chính xác!");
      setIsLoading(false);
    }
  };

  return (
    // Thêm overflow-hidden và min-h-screen để căn giữa nội dung hoàn hảo
    <div className="animate-fade-slide-up min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center py-10 px-4 font-sans relative overflow-hidden">
      {/* CONTAINER CHÍNH */}
      <div className="w-full max-w-xl z-10 flex flex-col items-center">
        {/* HEADER LOGO */}
        <div className="w-full flex items-center gap-3 mb-8 justify-start sm:justify-center">
          <img src={myLogo} alt="EduSync Logo" className="w-auto h-12" />
          <div>
            <h1 className="font-irish text-[28px] tracking-wider text-blue-900 font-semibold">
              EduSync
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Instructor Portal
            </p>
          </div>
        </div>

        <div className="w-full text-left sm:text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Chào mừng trở lại!
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            Đăng nhập để quản lý khóa học và kết nối với học viên của bạn
          </p>
        </div>

        {/* MAIN FORM CARD */}
        <div className="w-full bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-6 sm:p-10 border border-gray-100">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-gray-400"
                  />
                </div>
                <input
                  type="email"
                  required
                  placeholder="instructor@edusync.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-gray-700"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">
                  Mật khẩu
                </label>
                <a
                  href="#"
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-gray-700 tracking-widest font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {/* Ghi nhớ đăng nhập */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-600"
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl text-white font-bold shadow-lg transition-all flex justify-center items-center gap-2
                ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/30"}`}
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}{" "}
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </form>

          {/* Đăng ký Link */}
          <div className="mt-8 text-center text-sm font-medium text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/instructor/register"
              className="text-blue-600 font-bold hover:underline"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>

        {/* THỐNG KÊ BÊN DƯỚI (STATS) */}
        <div className="w-full grid grid-cols-3 gap-4 mt-10 text-center">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">
              500+
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              Giảng viên
            </p>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">
              10K+
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              Học viên
            </p>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900">
              1000+
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              Khóa học
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorLoginPage;
