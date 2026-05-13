import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faArrowRight,
  faHouse
} from "@fortawesome/free-solid-svg-icons";

const PaymentResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get("status");
    setStatus(paymentStatus);
  }, [location]);

  if (!status) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-medium">Đang kiểm tra trạng thái thanh toán...</p>
      </div>
    );
  }

  const isSuccess = status === "success";

  return (
    <div className="w-full min-h-screen bg-slate-50 py-16 px-4 flex flex-col items-center justify-center">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-xl text-center">
        
        {isSuccess ? (
          <div className="text-emerald-500 mb-6">
            <FontAwesomeIcon icon={faCheckCircle} className="text-7xl" />
          </div>
        ) : (
          <div className="text-red-500 mb-6">
            <FontAwesomeIcon icon={faTimesCircle} className="text-7xl" />
          </div>
        )}

        <h1 className={`text-3xl font-black mb-4 ${isSuccess ? "text-emerald-600" : "text-red-600"}`}>
          {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại"}
        </h1>

        <p className="text-slate-600 font-medium leading-relaxed mb-8">
          {isSuccess 
            ? "Cảm ơn bạn đã đăng ký khóa học. Giao dịch qua VNPAY đã được xác nhận. Bạn có thể bắt đầu học ngay bây giờ." 
            : "Giao dịch của bạn đã bị hủy hoặc có lỗi xảy ra trong quá trình xử lý với VNPAY. Vui lòng thử lại hoặc liên hệ hỗ trợ."}
        </p>

        <div className="flex flex-col gap-3">
          {isSuccess ? (
            <Link
              to="/my-courses"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
            >
              Vào khóa học của tôi <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
            >
              Quay lại thử lại
            </button>
          )}

          <Link
            to="/home"
            className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faHouse} /> Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
