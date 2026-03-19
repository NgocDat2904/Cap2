import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faCircleNotch, // Thêm icon loading
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State loading

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

    // Validate cơ bản
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (!formData.agreeTerms) {
      setError("Bạn cần đồng ý với Điều khoản dịch vụ để tiếp tục.");
      return;
    }

    setIsLoading(true);

    // Giả lập call API đăng ký 1.5 giây
    setTimeout(() => {
      setIsLoading(false);
      console.log("Dữ liệu đăng ký hợp lệ:", formData);
      // Gợi ý: Sau khi đăng ký thành công, chuyển sang trang điền thông tin chuyên môn (Step 2)
      // hoặc chuyển về trang Login tùy logic của bạn.
      // navigate("/instructor/register-step-2");
      alert("Đăng ký thành công! (Giả lập)");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-10 px-4 font-sans relative overflow-hidden">
      {/* HIỆU ỨNG TRANG TRÍ NỀN */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>

      <div className="animate-fade-slide-up w-full max-w-[640px] z-10 flex flex-col items-center">
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

        {/* THẺ FORM CHÍNH (Glassmorphism) */}
        <div className="w-full bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-blue-900/10 p-8 sm:p-12 border border-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
              Tạo tài khoản giảng viên
            </h2>
            <p className="text-slate-500 font-medium">
              Điền thông tin của bạn để bắt đầu hành trình giảng dạy
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-2xl text-center animate-fade-slide-up">
              {error}
            </div>
          )}

          <form onSubmit={handleNextStep} className="space-y-5">
            {/* Họ và tên */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2.5">
                Họ và tên
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-slate-400 group-focus-within:text-blue-600 transition-colors"
                  />
                </div>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-800 font-medium placeholder-slate-400"
                />
              </div>
            </div>

            {/* Email */}
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
                  name="email"
                  required
                  placeholder="instructor@edusync.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-800 font-medium placeholder-slate-400"
                />
              </div>
            </div>

            {/* Mật khẩu & Xác nhận */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">
                  Mật khẩu
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="text-slate-400 group-focus-within:text-blue-600 transition-colors"
                    />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-800 tracking-widest font-medium placeholder-slate-400"
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

              {/* Ô Xác nhận mật khẩu */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">
                  Xác nhận mật khẩu
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="text-slate-400 group-focus-within:text-blue-600 transition-colors"
                    />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-12 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-slate-800 tracking-widest font-medium placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEyeSlash : faEye}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Điều khoản */}
            <div className="flex items-start gap-3 pt-3">
              <input
                type="checkbox"
                name="agreeTerms"
                id="terms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600 cursor-pointer transition-all shrink-0"
              />
              <label
                htmlFor="terms"
                className="text-sm text-slate-600 leading-relaxed cursor-pointer select-none"
              >
                Tôi đồng ý với{" "}
                <a
                  href="#"
                  className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-all"
                >
                  Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a
                  href="#"
                  className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-all"
                >
                  Chính sách bảo mật
                </a>
              </label>
            </div>

            {/* Nút Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full mt-4 py-4 rounded-xl text-white font-bold transition-all duration-300 flex justify-center items-center gap-2
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
                  Đang thiết lập...
                </>
              ) : (
                <>Đăng ký</>
              )}
            </button>
          </form>

          {/* Link Đăng nhập */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm font-medium text-slate-500">
            Đã có tài khoản?{" "}
            <Link
              to="/instructor/login"
              className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-all"
            >
              Đăng nhập tại đây
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorRegisterPage;
