import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import myLogo from "../../assets/logo.png";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  // 3. Khởi tạo biến navigate
  const navigate = useNavigate();

  return (
    // Thêm class 'relative' vào thẻ div ngoài cùng
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 font-sans p-4">
      {/* NÚT QUAY LẠI*/}
      <button
        onClick={() => navigate(-1)} // navigate(-1) nghĩa là lùi lại 1 trang trong lịch sử duyệt web
        className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-gray-500 hover:text-blue-900 transition-colors font-medium group"
      >
        <FontAwesomeIcon
          icon={faArrowLeft}
          className="transform group-hover:-translate-x-1 transition-transform"
        />
        <span>Quay lại</span>
      </button>

      {/* Khung Form Đăng nhập */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-8 sm:p-10">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="mb-6 hover:opacity-80 transition-opacity">
            <img
              src={myLogo}
              alt="EduSync Logo"
              className="h-12 w-auto object-contain"
            />
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
          <p className="text-sm text-gray-500">Welcome back to EduSync</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          {/* Ô nhập Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-gray-400 text-sm"
                />
              </div>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 sm:text-sm transition-colors text-gray-900"
              />
            </div>
          </div>

          {/* Ô nhập Mật khẩu */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FontAwesomeIcon
                  icon={faLock}
                  className="text-gray-400 text-sm"
                />
              </div>

              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 sm:text-sm transition-colors text-gray-900"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  className="text-sm"
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-colors mt-2"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 mb-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
        >
          <FontAwesomeIcon icon={faGoogle} className="text-red-500 text-base" />
          Google
        </button>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
