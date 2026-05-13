import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faLock,
  faCreditCard,
  faShieldHalved,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const LearnerCheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const courseId = location.state?.courseId;

  const [isProcessing, setIsProcessing] = useState(false);

  // Mock course data - trong thực tế sẽ fetch từ API
  const courseData = {
    title: "Khóa học lập trình Web Toàn diện",
    instructor: "Giảng viên EduSync",
    price: 999000,
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (isProcessing) return;
    
    setIsProcessing(true);

    // Giả lập xử lý thanh toán
    setTimeout(() => {
      setIsProcessing(false);
      alert("🎉 Thanh toán thành công! Bạn đã được đăng ký vào khóa học.");
      navigate("/my-courses");
    }, 2000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

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
          Thanh toán an toàn
        </h1>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* CỘT TRÁI: FORM THANH TOÁN */}
          <div className="w-full lg:w-3/5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Thông tin thẻ</h2>
                <FontAwesomeIcon icon={faCreditCard} className="text-blue-600 text-2xl" />
              </div>

              <form className="space-y-5" onSubmit={handlePayment}>
                {/* Số thẻ */}
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Số thẻ tín dụng / Ghi nợ
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all tracking-widest placeholder:font-medium placeholder:tracking-normal"
                    />
                    <FontAwesomeIcon icon={faCreditCard} className="absolute left-4 top-4 text-slate-400" />
                  </div>
                </div>

                {/* Tên chủ thẻ */}
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Tên in trên thẻ
                  </label>
                  <input
                    type="text"
                    placeholder="NGUYEN VAN A"
                    required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase placeholder:normal-case placeholder:font-medium"
                  />
                </div>

                {/* Ngày hết hạn & CVV */}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Ngày hết hạn
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center placeholder:font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Mã bảo mật (CVV)
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-center placeholder:font-medium"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Thông báo bảo mật */}
            <div className="flex items-start gap-3 p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800">
              <FontAwesomeIcon icon={faShieldHalved} className="text-xl mt-0.5" />
              <div>
                <h4 className="text-sm font-bold">Bảo mật tuyệt đối</h4>
                <p className="text-xs mt-1.5 opacity-90 leading-relaxed font-medium">
                  Hệ thống sử dụng mã hóa SSL 256-bit chuẩn quốc tế. Thông tin thẻ của bạn không bao giờ được lưu trữ trên máy chủ của EduSync.
                </p>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (ĐÃ DỌN SẠCH THUẾ/GIÁ GỐC) */}
          <div className="w-full lg:w-2/5">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-24">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Tóm tắt đơn hàng
              </h3>

              {/* Box Khóa học */}
              <div className="flex gap-4 mb-8 pb-6 border-b border-slate-100">
                <img
                  src={courseData.thumbnail}
                  alt={courseData.title}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-sm"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="font-bold text-sm text-slate-900 line-clamp-2 mb-1.5 leading-snug">
                    {courseData.title}
                  </h4>
                  <p className="text-xs font-medium text-slate-500">
                    Bởi {courseData.instructor}
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
                      <span>Đang xử lý giao dịch...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faLock} className="text-lg" /> 
                      <span>Hoàn tất thanh toán</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] font-medium text-slate-400 leading-relaxed px-2">
                  Bằng cách nhấn Hoàn tất, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Hoàn tiền của EduSync.
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