import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faLock,
  faCreditCard,
  faShieldHalved,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { getCourseDetailAPI, createPaymentAPI } from "../../services/learnerCourseAPI";

const LearnerCheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const courseId = location.state?.courseId;

  const [isProcessing, setIsProcessing] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) {
      navigate(-1);
      return;
    }
    const loadCourse = async () => {
      try {
        const data = await getCourseDetailAPI(courseId);
        setCourseData(data);
      } catch (error) {
        console.error("Failed to load course detail:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [courseId, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (isProcessing) return;
    
    setIsProcessing(true);

    try {
      // Call backend to create VNPAY url
      const res = await createPaymentAPI(courseId);
      if (res.checkout_url) {
        // Redirect to VNPAY portal
        window.location.href = res.checkout_url;
      } else {
        alert("Có lỗi xảy ra khi tạo giao dịch thanh toán.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      alert("Hệ thống đang gặp gián đoạn. Vui lòng thử lại sau.");
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading || !courseData) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-slate-500">
        <FontAwesomeIcon icon={faSpinner} spin className="mr-2 text-2xl" /> Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <main className="animate-fade-slide-up w-full min-h-screen bg-slate-50 py-8 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Nút quay lại */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-6"
        >
          <FontAwesomeIcon icon={faChevronLeft} /> Quay lại
        </button>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-8">
          Thanh toán an toàn với VNPAY
        </h1>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* CỘT TRÁI: THÔNG BÁO VNPAY (Thay cho form nhập thẻ ảo) */}
          <div className="w-full lg:w-3/5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
              <div className="flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faCreditCard} className="text-blue-600 text-4xl" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Chuyển hướng đến cổng thanh toán</h2>
              <p className="text-slate-600 mb-6">
                Bạn sẽ được chuyển hướng an toàn đến <strong>cổng thanh toán VNPAY</strong> để hoàn tất giao dịch. Bạn có thể sử dụng thẻ ATM nội địa, thẻ tín dụng hoặc quét mã QR qua ứng dụng ngân hàng.
              </p>
            </div>

            {/* Thông báo bảo mật */}
            <div className="flex items-start gap-3 p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800">
              <FontAwesomeIcon icon={faShieldHalved} className="text-xl mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Bảo mật tuyệt đối</h4>
                <p className="text-xs mt-1.5 opacity-90 leading-relaxed font-medium">
                  Hệ thống sử dụng cổng thanh toán VNPAY chuẩn quốc tế. Thông tin thẻ của bạn không bao giờ được lưu trữ trên máy chủ của EduSync.
                </p>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <div className="w-full lg:w-2/5">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Tóm tắt đơn hàng
              </h3>

              {/* Box Khóa học */}
              <div className="flex gap-4 mb-8 pb-6 border-b border-slate-100">
                <img
                  src={courseData.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"}
                  alt={courseData.title}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-sm"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-2 mb-1.5 leading-snug">
                    {courseData.title}
                  </h4>
                  <p className="text-xs font-medium text-slate-500">
                    Bởi {courseData.instructor?.name || "Giảng viên EduSync"}
                  </p>
                </div>
              </div>

              {/* Tổng cộng & Nút thanh toán */}
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                    Tổng thanh toán
                  </span>
                  <span className="text-3xl font-black text-blue-600">
                    {formatCurrency(courseData.price)}
                  </span>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white font-black text-base rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
                >
                  {isProcessing ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="text-xl" /> 
                      <span>Đang kết nối VNPAY...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faLock} className="text-lg" /> 
                      <span>Thanh toán qua VNPAY</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] font-medium text-slate-400 leading-relaxed px-2">
                  Bằng cách nhấn thanh toán, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Hoàn tiền của EduSync.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default LearnerCheckoutPage;