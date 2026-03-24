import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faShieldHalved,
  faCreditCard,
  faWallet,
  faTag,
  faCheckCircle,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";

const LearnerCheckoutPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [coupon, setCoupon] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);

  // Mock dữ liệu đơn hàng
  const orderData = {
    courseTitle: "Lập trình Python cơ bản đến nâng cao cho người mới bắt đầu",
    instructor: "Nguyễn Văn A",
    thumbnail:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=300&q=80",
    originalPrice: 1500000,
    price: 1222000,
  };

  const discountAmount = isCouponApplied ? 222000 : 0;
  const totalAmount = orderData.price - discountAmount;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === "EDUSYNC2026") {
      setIsCouponApplied(true);
    } else {
      alert("Mã giảm giá không hợp lệ hoặc đã hết hạn!");
      setIsCouponApplied(false);
    }
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    // Giả lập loading và chuyển hướng sang trang Thành công
    alert("Thanh toán thành công! Chuẩn bị chuyển hướng vào khóa học...");
  };

  return (
    <main className="animate-fade-slide-up w-full min-h-screen bg-slate-50 py-8 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Nút quay lại */}
        <Link
          to="/courses/1"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors mb-6"
        >
          <FontAwesomeIcon icon={faChevronLeft} /> Quay lại khóa học
        </Link>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
          Thanh toán an toàn
        </h1>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* CỘT TRÁI: PHƯƠNG THỨC THANH TOÁN */}
          <div className="w-full lg:w-3/5 space-y-6">
            {/* Box Chọn Phương thức */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Phương thức thanh toán
              </h2>

              <div className="space-y-4">
                {/* Lựa chọn Thẻ tín dụng */}
                <label
                  className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "credit-card" ? "border-blue-600 bg-blue-50/50" : "border-slate-100 hover:border-blue-200"}`}
                >
                  <div className="flex items-center h-6">
                    <input
                      type="radio"
                      name="payment_method"
                      value="credit-card"
                      checked={paymentMethod === "credit-card"}
                      onChange={() => setPaymentMethod("credit-card")}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800">
                        Thẻ Tín dụng / Ghi nợ
                      </span>
                      <div className="flex gap-2 text-slate-400 text-xl">
                        <FontAwesomeIcon
                          icon={faCreditCard}
                          className="text-blue-600"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      Hỗ trợ Visa, Mastercard, JCB, Amex
                    </p>

                    {/* Form nhập thẻ (Chỉ hiện khi chọn Thẻ) */}
                    {paymentMethod === "credit-card" && (
                      <div className="mt-6 space-y-4 animate-fade-slide-up">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                            Tên in trên thẻ
                          </label>
                          <input
                            type="text"
                            placeholder="NGUYEN VAN A"
                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                            Số thẻ
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="0000 0000 0000 0000"
                              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors tracking-widest"
                            />
                            <FontAwesomeIcon
                              icon={faCreditCard}
                              className="absolute left-3.5 top-3 text-slate-400"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                              Ngày hết hạn
                            </label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                              Mã bảo mật (CVC)
                            </label>
                            <input
                              type="text"
                              placeholder="123"
                              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                {/* Lựa chọn Ví điện tử */}
                <label
                  className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === "momo" ? "border-blue-600 bg-blue-50/50" : "border-slate-100 hover:border-blue-200"}`}
                >
                  <div className="flex items-center h-6">
                    <input
                      type="radio"
                      name="payment_method"
                      value="momo"
                      checked={paymentMethod === "momo"}
                      onChange={() => setPaymentMethod("momo")}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800">
                        Ví điện tử Momo / VNPay
                      </span>
                      <FontAwesomeIcon
                        icon={faWallet}
                        className="text-pink-600 text-xl"
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Thanh toán nhanh chóng qua mã QR
                    </p>

                    {paymentMethod === "momo" && (
                      <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 text-center animate-fade-slide-up">
                        Bạn sẽ được chuyển hướng tới cổng thanh toán an toàn để
                        quét mã QR.
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Thông điệp bảo mật */}
            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800">
              <FontAwesomeIcon
                icon={faShieldHalved}
                className="text-xl mt-0.5"
              />
              <div>
                <h4 className="text-sm font-bold">Thanh toán bảo mật 100%</h4>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  EduSync sử dụng mã hóa SSL 256-bit chuẩn quốc tế. Thông tin
                  thẻ của bạn tuyệt đối không được lưu trữ trên máy chủ của
                  chúng tôi.
                </p>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <div className="w-full lg:w-2/5">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Tóm tắt đơn hàng
              </h2>

              {/* Card khóa học mini */}
              <div className="flex gap-4 mb-6 pb-6 border-b border-slate-100">
                <img
                  src={orderData.thumbnail}
                  alt="Course Thumbnail"
                  className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-800 leading-snug line-clamp-2 mb-1">
                    {orderData.courseTitle}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Giảng viên: {orderData.instructor}
                  </p>
                </div>
              </div>

              {/* Chi tiết giá */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Giá gốc:</span>
                  <span className="text-slate-500 line-through">
                    {formatCurrency(orderData.originalPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-700 font-bold">Giá bán:</span>
                  <span className="text-slate-800 font-bold">
                    {formatCurrency(orderData.price)}
                  </span>
                </div>
                {isCouponApplied && (
                  <div className="flex justify-between items-center text-sm text-emerald-600 font-bold animate-fade-slide-up">
                    <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faCheckCircle} /> Giảm giá coupon:
                    </span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
              </div>

              {/* Nhập mã giảm giá */}
              <form
                onSubmit={handleApplyCoupon}
                className="mb-6 pb-6 border-b border-slate-100"
              >
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Mã giảm giá (Nhập: EDUSYNC2026)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FontAwesomeIcon
                      icon={faTag}
                      className="absolute left-3.5 top-3 text-slate-400 text-sm"
                    />
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Nhập mã tại đây..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors uppercase"
                      disabled={isCouponApplied}
                    />
                  </div>
                  <button
                    type="submit"
                    className={`px-4 py-2 font-bold text-sm rounded-xl transition-colors ${isCouponApplied ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-slate-800 text-white hover:bg-slate-900 active:scale-95"}`}
                    disabled={isCouponApplied}
                  >
                    Áp dụng
                  </button>
                </div>
              </form>

              {/* Tổng tiền & Nút chốt */}
              <div>
                <div className="flex justify-between items-end mb-6">
                  <span className="text-base font-bold text-slate-700">
                    Tổng cộng:
                  </span>
                  <span className="text-3xl font-black text-blue-700">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-blue-600 text-white font-black text-lg rounded-2xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <FontAwesomeIcon icon={faLock} /> Hoàn tất thanh toán
                </button>

                <p className="text-center text-[10px] text-slate-400 mt-4 px-4 leading-relaxed">
                  Bằng việc bấm hoàn tất, bạn đồng ý với Điều khoản Dịch vụ và
                  Chính sách Bảo mật của EduSync.
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
