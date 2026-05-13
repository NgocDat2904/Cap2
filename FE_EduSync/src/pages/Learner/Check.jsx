import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCheckCircle,
  faCreditCard,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";

const LearnerCheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const courseId = location.state?.courseId;

  const [isProcessing, setIsProcessing] = useState(false);

  // Mock course data - trong thực tế sẽ fetch từ API
  const courseData = {
    title: "Khóa học lập trình Web",
    instructor: "Giảng viên EduSync",
    price: 99.99,
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    // Giả lập xử lý thanh toán
    setTimeout(() => {
      setIsProcessing(false);
      alert("Thanh toán thành công! Bạn đã được đăng ký vào khóa học.");
      navigate("/my-courses");
    }, 2000);
  };

  return (
    <div className="animate-fade-slide-up w-full min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-8 font-semibold"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
        </button>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">
          Thanh toán
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FontAwesomeIcon icon={faCreditCard} className="text-blue-600" />
                Thông tin thanh toán
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Số thẻ
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Ngày hết hạn
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tên chủ thẻ
                  </label>
                  <input
                    type="text"
                    placeholder="NGUYEN VAN A"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600 mt-1" />
                <p className="text-sm text-slate-700">
                  <span className="font-bold">Thanh toán an toàn:</span> Thông tin của bạn được mã hóa và bảo mật tuyệt đối.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 mb-6">
                Tóm tắt đơn hàng
              </h3>

              <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-100">
                <img
                  src={courseData.thumbnail}
                  alt={courseData.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-2 mb-1">
                    {courseData.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {courseData.instructor}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Giá gốc:</span>
                  <span className="font-semibold text-slate-900">
                    ${courseData.price}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Thuế:</span>
                  <span className="font-semibold text-slate-900">$0.00</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 mb-6">
                <span className="text-lg font-bold text-slate-900">Tổng cộng:</span>
                <span className="text-2xl font-black text-blue-600">
                  ${courseData.price}
                </span>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} spin />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Hoàn tất thanh toán
                  </>
                )}
              </button>

              <p className="text-xs text-center text-slate-500 mt-4">
                Bằng cách thanh toán, bạn đồng ý với{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Điều khoản dịch vụ
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerCheckoutPage;
