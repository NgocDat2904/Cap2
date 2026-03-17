import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faWandMagicSparkles,
  faNetworkWired,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import myLogo from "../../assets/logo.png";

const LearnerAuthPage = () => {
  const navigate = useNavigate();

  // Khia báo useLocation để lấy đường dẫn hiện tại trên trình duyệt
  const location = useLocation();

  //Khởi tại isLogin dựa trên đường dẫn hiện tại. Nếu URL chó chữ login thì isLogin = true (hiện form đăng nhập),
  const [isLogin, setIsLogin] = useState(location.pathname.includes("/login"));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //useEffect để theo dõi sự thay đổi của URL
  useEffect(() => {
    setIsLogin(location.pathname.includes("/login"));
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-8 font-sans relative">
      {/* Nút Quay lại */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-gray-500 hover:text-blue-900 transition-colors font-medium z-50 group"
      >
        <FontAwesomeIcon
          icon={faArrowLeft}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Quay lại</span>
      </button>

      <div className="relative w-full max-w-5xl h-[750px] bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* ========================================================= */}
        {/* FORM 1: SIGN IN (ở nửa BÊN TRÁI) */}
        {/* ========================================================= */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full bg-white p-12 flex flex-col justify-center transition-all duration-700 ease-in-out z-10 
          ${isLogin ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none translate-x-[-20%]"}`}
        >
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-500 mb-8">Chào mừng trở lại EduSync!</p>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="Nhập email đã đăng ký của bạn"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-blue-700 outline-none transition-colors"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-sm font-medium text-blue-700 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="block w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-blue-700 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-700"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg shadow-sm text-sm font-bold text-white bg-blue-800 hover:bg-blue-900 transition-colors mt-6"
              >
                Sign In
              </button>

              <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  <span className="px-4 bg-white">OR</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 mt-6 transition-colors"
              >
                <FontAwesomeIcon
                  icon={faGoogle}
                  className="text-red-500 text-base"
                />{" "}
                Continue with Google
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account? {/* Nút bấm kích hoạt hiệu ứng trượt */}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="font-bold text-blue-800 hover:underline transition-colors"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FORM 2: SIGN UP (Cố định ở nửa BÊN PHẢI) */}
        {/* ========================================================= */}
        <div
          className={`absolute top-0 right-0 w-1/2 h-full bg-white p-12 flex flex-col justify-center transition-all duration-700 ease-in-out z-10
          ${!isLogin ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none translate-x-[20%]"}`}
        >
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h2>
            <p className="text-gray-500 mb-6">
              Tạo tài khoản của bạn để học tập với lộ trình được cá nhân hóa do
              AI định hướng và đồ thị kiến ​​thức liên kết.
            </p>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Họ Tên
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ tên của bạn"
                  className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="Nhập email của bạn"
                  className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="block w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-700"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="block w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-700"
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEyeSlash : faEye}
                    />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg shadow-sm text-sm font-bold text-white bg-blue-800 hover:bg-blue-900 transition-colors mt-4"
              >
                Sign Up
              </button>

              <div className="mt-4 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  <span className="px-4 bg-white">OR</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FontAwesomeIcon icon={faGoogle} className="text-red-500" />{" "}
                Continue with Google
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account? {/* Nút bấm kích hoạt hiệu ứng trượt */}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="font-bold text-blue-800 hover:underline transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        <div
          // Mặc định nằm bên TRÁI. Nếu isLogin = true, nó bị kéo sang PHẢI (translate-x-full)
          className={`absolute top-0 left-0 w-1/2 h-full bg-blue-950 text-white transition-transform duration-700 ease-in-out z-20 overflow-hidden
          ${isLogin ? "translate-x-full" : "translate-x-0"}`}
        >
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900 to-transparent opacity-50 pointer-events-none"></div>

          <div className="relative z-10 h-full p-12 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-10">
              <div className="p-1.5 rounded-lg">
                <img
                  src={myLogo}
                  alt="EduSync Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <span className="font-irish text-[28px] tracking-wider text-white">
                EduSync
              </span>
            </div>

            <div>
              <h1 className="text-4xl lg:text-[42px] font-bold leading-tight mb-6">
                {isLogin
                  ? "Chào mừng trở lại EduSync!"
                  : "Khai Phóng Tiềm Năng Trí Tuệ."}
              </h1>
              <p className="text-blue-100 text-base mb-10 leading-relaxed max-w-sm">
                {isLogin
                  ? "Sign in to continue your personalized learning journey and track your progress."
                  : "Tham gia cộng đồng gồm hơn 50.000 người học thành thạo các lĩnh vực phức tạp bằng tính năng vẽ đồ thị do AI điều khiển của chúng tôi."}
              </p>

              <div
                className={`space-y-5 transition-opacity duration-500 ${isLogin ? "opacity-0 hidden" : "opacity-100"}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <FontAwesomeIcon icon={faWandMagicSparkles} />
                  </div>
                  <span className="font-medium text-blue-50 text-sm">
                    Lộ trình học tập AI được cá nhân hóa
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <FontAwesomeIcon icon={faNetworkWired} />
                  </div>
                  <span className="font-medium text-blue-50 text-sm">
                    Mạng lưới kiến thức liên kết
                  </span>
                </div>
              </div>
            </div>

            <div className="text-sm text-blue-300">
              © {new Date().getFullYear()} EduSync AI.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerAuthPage;
