import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faWandMagicSparkles,
  faNetworkWired,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import myLogo from "../../assets/logo.png";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* ================= CỘT TRÁI (Màu xanh) ================= */}
        <div className="lg:w-[50%] bg-blue-950 text-white p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900 to-transparent opacity-50 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <img
                src={myLogo}
                alt="EduSync Logo"
                className="h-12 w-auto object-contain"
              />

              <span className="font-irish text-2xl tracking-wider text-white">
                EduSync
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Unlock Your
              <br />
              Cognitive
              <br />
              Potential.
            </h1>
            <p className="text-blue-100 text-lg mb-12 leading-relaxed max-w-sm">
              Join a community of 50,000+ learners mastering complex domains
              with our proprietary AI-driven knowledge graphing.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faWandMagicSparkles} />
                </div>
                <span className="font-medium text-blue-50">
                  Personalized AI Learning Paths
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faNetworkWired} />
                </div>
                <span className="font-medium text-blue-50">
                  Interconnected Knowledge Graphs
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-16 text-sm text-blue-300">
            © {new Date().getFullYear()} EduSync AI. Trusted by top institutions
            worldwide.
          </div>
        </div>

        {/* ================= CỘT PHẢI (Form Đăng ký) ================= */}
        <div className="lg:w-[55%] p-10 lg:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h2>
            <p className="text-gray-500 mb-8">
              Create your account to learn and teach
            </p>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Họ Tên
                </label>
                <input
                  type="text"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-colors text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-colors text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="block w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-colors text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-700 transition-colors"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="block w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700 transition-colors text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-700 transition-colors"
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEyeSlash : faEye}
                    />
                  </button>
                </div>
              </div>

              {/* Checkbox Đồng ý điều khoản */}
              <div className="flex items-start mt-4">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 cursor-pointer"
                    required
                  />
                </div>
                <label
                  htmlFor="terms"
                  className="ml-2 text-sm text-gray-600 cursor-pointer"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="font-semibold text-blue-700 hover:underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="font-semibold text-blue-700 hover:underline"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Nút Đăng ký */}
              <button
                type="submit"
                className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800 transition-colors mt-6"
              >
                Sign Up
              </button>
            </form>

            {/* Dòng chữ OR */}
            <div className="mt-8 mb-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs font-semibold text-gray-400 uppercase tracking-widest">
                <span className="px-4 bg-white">OR</span>
              </div>
            </div>

            {/* Đăng ký bằng Google */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
            >
              <FontAwesomeIcon
                icon={faGoogle}
                className="text-red-500 text-base"
              />
              Continue with Google
            </button>

            {/* Link sang trang Đăng nhập */}
            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-blue-800 hover:text-blue-900 hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
