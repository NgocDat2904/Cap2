import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// 1. IMPORT HÀM TỪ FILE SERVICE VÀO (Xóa import axios đi)
import { loginAPI, registerAPI } from "../../services/Learner/authService";
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

const toErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;

  // FastAPI 422 thường có dạng: { detail: [{ loc, msg, type, ...}, ...] }
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((x) => (typeof x?.msg === "string" ? x.msg : null))
      .filter(Boolean);
    if (msgs.length) return msgs.join("\n");
  }

  if (detail && typeof detail === "object") {
    if (typeof detail.msg === "string" && detail.msg.trim()) return detail.msg;
    try {
      return JSON.stringify(detail);
    } catch {
      // ignore
    }
  }

  const message = error?.message;
  if (typeof message === "string" && message.trim()) return message;

  return fallback;
};

const LearnerAuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(location.pathname.includes("/login"));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // STATE CHO FORM ĐĂNG NHẬP
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");

  // STATE CHO FORM ĐĂNG KÝ
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [isRegLoading, setIsRegLoading] = useState(false);
  const [regError, setRegError] = useState("");

  useEffect(() => {
    setIsLogin(location.pathname.includes("/login"));
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname.includes("/login")) {
      const msg = localStorage.getItem("register_success");
      if (msg) {
        setLoginSuccess(msg);
        localStorage.removeItem("register_success");
      }
    }
  }, [location.pathname]);

  // ==========================================
  // HÀM ĐĂNG NHẬP
  // ==========================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    try {
      // 2. GỌI HÀM API TỪ SERVICE
      const data = await loginAPI(loginEmail, loginPassword);

      console.log("Login Success:", data);
      localStorage.setItem("access_token", data.access_token);
      navigate("/home");
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      if (error.response) {
        setLoginError(
          String(
            toErrorMessage(
              error,
              "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!",
            ),
          ),
        );
      } else {
        setLoginError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // HÀM ĐĂNG KÝ (ĐÃ GỌN GÀNG HƠN)
  // ==========================================
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");

    if (regPassword !== regConfirmPassword) {
      setRegError("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsRegLoading(true);

    try {
      // 3. GỌI HÀM API TỪ SERVICE
      const data = await registerAPI(
        regName,
        regEmail,
        regPassword,
        regConfirmPassword,
        "learner",
      );

      console.log("Register Success:", data);
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirmPassword("");

      localStorage.setItem(
        "register_success",
        "Đăng ký thành công! Vui lòng đăng nhập để bắt đầu.",
        // alert("Đăng ký thành công! Vui lòng đăng nhập để bắt đầu."),
      );

      navigate("/login");
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      if (error.response) {
        setRegError(
          String(
            toErrorMessage(
              error,
              "Đăng ký thất bại. Vui lòng kiểm tra lại dữ liệu.",
            ),
          ),
        );
      } else {
        setRegError("Không thể kết nối đến máy chủ.");
      }
    } finally {
      setIsRegLoading(false);
    }
  };

  return (
    <div className="animate-fade-slide-up min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-8 font-sans relative">
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
        {/* FORM 1: SIGN IN */}
        {/* ========================================================= */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full bg-white p-12 flex flex-col justify-center transition-all duration-700 ease-in-out z-10 ${isLogin ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none translate-x-[-20%]"}`}
        >
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-500 mb-8">Chào mừng trở lại EduSync!</p>

            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                {typeof loginError === "string"
                  ? loginError
                  : JSON.stringify(loginError)}
              </div>
            )}
            {loginSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
                {loginSuccess}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="Nhập email đã đăng ký của bạn"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (loginSuccess) setLoginSuccess("");
                  }}
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
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginSuccess) setLoginSuccess("");
                    }}
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
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg shadow-sm text-sm font-bold text-white transition-colors mt-6 ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-800 hover:bg-blue-900"}`}
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
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
              Don't have an account?
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setLoginSuccess("");
                  navigate("/register", { replace: true });
                }}
                className="font-bold text-blue-800 hover:underline transition-colors ml-1"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FORM 2: SIGN UP */}
        {/* ========================================================= */}
        <div
          className={`absolute top-0 right-0 w-1/2 h-full bg-white p-12 flex flex-col justify-center transition-all duration-700 ease-in-out z-10 ${!isLogin ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none translate-x-[20%]"}`}
        >
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h2>
            <p className="text-gray-500 mb-6">
              Tạo tài khoản của bạn để học tập với lộ trình được cá nhân hóa do
              AI định hướng.
            </p>

            {regError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                {typeof regError === "string"
                  ? regError
                  : JSON.stringify(regError)}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleRegister}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Họ Tên
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ tên của bạn"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
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
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
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
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
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
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
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
                disabled={isRegLoading}
                className={`w-full py-3 px-4 rounded-lg shadow-sm text-sm font-bold text-white transition-colors mt-4 ${isRegLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-800 hover:bg-blue-900"}`}
              >
                {isRegLoading ? "Đang xử lý..." : "Sign Up"}
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
              Already have an account?
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setLoginSuccess("");
                  navigate("/login", { replace: true });
                }}
                className="font-bold text-blue-800 hover:underline transition-colors ml-1"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TẤM MÀN XANH (OVERLAY) */}
        {/* ========================================================= */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full bg-blue-950 text-white transition-transform duration-700 ease-in-out z-20 overflow-hidden ${isLogin ? "translate-x-full" : "translate-x-0"}`}
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
