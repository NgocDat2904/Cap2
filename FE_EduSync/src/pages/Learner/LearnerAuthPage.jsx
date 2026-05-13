import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginAPI, registerAPI } from "../../services/authService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faWandMagicSparkles,
  faNetworkWired,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import myLogo from "../../assets/logo.png";

const toErrorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;

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
      const data = await loginAPI(loginEmail, loginPassword);

      console.log("Đăng nhập thành công:", data);
      localStorage.setItem("access_token", data.access_token);
      navigate("/home");
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      if (error.response) {
        setLoginError(
          String(
            toErrorMessage(
              error,
              "Hệ thống: Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin xác thực!",
            ),
          ),
        );
      } else {
        setLoginError("Lỗi hệ thống: Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại đường truyền mạng!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // HÀM ĐĂNG KÝ
  // ==========================================
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");

    if (regPassword !== regConfirmPassword) {
      setRegError("Hệ thống: Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsRegLoading(true);

    try {
      const data = await registerAPI(
        regName,
        regEmail,
        regPassword,
        regConfirmPassword,
        "learner",
      );

      console.log("Đăng ký thành công:", data);
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegConfirmPassword("");

      localStorage.setItem(
        "register_success",
        "Đăng ký tài khoản thành công! Vui lòng đăng nhập để bắt đầu.",
      );

      navigate("/login");
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      if (error.response) {
        setRegError(
          String(
            toErrorMessage(
              error,
              "Hệ thống: Đăng ký thất bại. Vui lòng kiểm tra lại thông tin cung cấp.",
            ),
          ),
        );
      } else {
        setRegError("Lỗi hệ thống: Không thể kết nối tới máy chủ.");
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
        {/* FORM 1: ĐĂNG NHẬP */}
        {/* ========================================================= */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full bg-white p-12 flex flex-col justify-center transition-all duration-700 ease-in-out z-10 ${isLogin ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none translate-x-[-20%]"}`}
        >
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng Nhập</h2>
            <p className="text-gray-500 mb-8">Chào mừng bạn quay lại với EduSync!</p>

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
                  Địa chỉ Email
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
                    Mật khẩu
                  </label>
                  <a
                    href="#"
                    className="text-sm font-medium text-blue-700 hover:underline"
                  >
                    Quên mật khẩu?
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
                {isLoading ? "Đang xác thực..." : "Đăng nhập hệ thống"}
              </button>

              <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              Chưa có tài khoản?
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setLoginSuccess("");
                  navigate("/register", { replace: true });
                }}
                className="font-bold text-blue-800 hover:underline transition-colors ml-1"
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* FORM 2: ĐĂNG KÝ */}
        {/* ========================================================= */}
        <div
          className={`absolute top-0 right-0 w-1/2 h-full bg-white p-12 flex flex-col justify-center transition-all duration-700 ease-in-out z-10 ${!isLogin ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none translate-x-[20%]"}`}
        >
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng Ký</h2>
            <p className="text-gray-500 mb-6">
              Tạo tài khoản để trải nghiệm lộ trình học tập cá nhân hóa cùng AI.
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
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập đầy đủ họ tên"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Địa chỉ Email
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
                  Mật khẩu
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
                  Xác nhận mật khẩu
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
                {isRegLoading ? "Đang xử lý..." : "Khởi tạo tài khoản"}
              </button>

              <div className="mt-4 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Đã có tài khoản?
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setLoginSuccess("");
                  navigate("/login", { replace: true });
                }}
                className="font-bold text-blue-800 hover:underline transition-colors ml-1"
              >
                Đăng nhập
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
                  ? "Chào mừng trở lại với EduSync!"
                  : "Khai mở tiềm năng tri thức của bạn."}
              </h1>
              <p className="text-blue-100 text-base mb-10 leading-relaxed max-w-sm">
                {isLogin
                  ? "Đăng nhập để tiếp tục hành trình học tập cá nhân hóa và theo dõi tiến độ của bạn."
                  : "Gia nhập cộng đồng hơn 50.000 học viên đang chinh phục các lĩnh vực phức tạp cùng hệ thống sơ đồ tri thức AI."}
              </p>

              <div
                className={`space-y-5 transition-opacity duration-500 ${isLogin ? "opacity-0 hidden" : "opacity-100"}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <FontAwesomeIcon icon={faWandMagicSparkles} />
                  </div>
                  <span className="font-medium text-blue-50 text-sm">
                    Lộ trình học tập cá nhân hóa bằng AI
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <FontAwesomeIcon icon={faNetworkWired} />
                  </div>
                  <span className="font-medium text-blue-50 text-sm">
                    Mạng lưới tri thức liên kết chuyên sâu
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