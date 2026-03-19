import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLock,
  faArrowRight,
  faEye, // 1. Thêm icon mắt mở
  faEyeSlash, // 1. Thêm icon mắt đóng chéo
} from "@fortawesome/free-solid-svg-icons";
import myLogo from "../../assets/logo.png";

const InstructorRegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [error, setError] = useState("");

  // 2. Thêm State quản lý ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (!formData.agreeTerms) {
      setError("Bạn cần đồng ý với Điều khoản dịch vụ để tiếp tục.");
      return;
    }

    // Test thành công
    console.log("Dữ liệu hợp lệ:", formData);
  };

  return (
    <div className="animate-fade-slide-up min-h-screen bg-[#F8FAFC] flex flex-col items-center py-10 px-4 font-sans">
      {/* HEADER LOGO */}
      <div className="w-full flex items-center gap-3 mb-8 justify-start sm:justify-center">
        <img src={myLogo} alt="EduSync Logo" className="w-auto h-12" />
        <div>
          <h1 className="font-irish text-[28px] tracking-wider text-blue-900 font-semibold">
            EduSync
          </h1>
          <p className="text-sm text-gray-500 font-medium">Instructor Portal</p>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-8 sm:p-12 border border-gray-100">
        {/* TIÊU ĐỀ FORM */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Tạo tài khoản giảng viên
          </h2>
          <p className="text-gray-500">
            Điền thông tin của bạn để bắt đầu hành trình giảng dạy
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleNextStep} className="space-y-6">
          {/* Họ và tên */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Họ và tên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faUser} className="text-gray-400" />
              </div>
              <input
                type="text"
                name="fullName"
                required
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleChange}
                className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-gray-700"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                required
                placeholder="instructor@edusync.com"
                value={formData.email}
                onChange={handleChange}
                className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-gray-700"
              />
            </div>
          </div>

          {/* Mật khẩu & Xác nhận */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Ô Mật khẩu */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-gray-700"
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

            {/* Ô Xác nhận mật khẩu */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Điều khoản */}
          <div className="flex items-start gap-3 pt-2">
            <input
              type="checkbox"
              name="agreeTerms"
              id="terms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-600"
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-600 leading-relaxed"
            >
              Tôi đồng ý với{" "}
              <a
                href="#"
                className="text-blue-600 font-semibold hover:underline"
              >
                Điều khoản dịch vụ
              </a>{" "}
              và{" "}
              <a
                href="#"
                className="text-blue-600 font-semibold hover:underline"
              >
                Chính sách bảo mật
              </a>
            </label>
          </div>

          {/* Nút Submit */}
          <button
            type="submit"
            className="w-full mt-4 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center gap-2"
          >
            Tiếp tục <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </form>

        {/* Link Đăng nhập */}
        <p className="mt-8 text-center text-sm text-gray-600 font-medium">
          Đã có tài khoản?{" "}
          <Link
            to="/instructor/login"
            className="text-blue-600 font-bold hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default InstructorRegisterPage;
