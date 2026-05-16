import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Footer from "../components/LearnerFooter";
import myLogo from "../assets/logo.png";
import {
  faUpload,
  faPlay,
  faBrain,
  faListOl,
  faClipboardQuestion,
  faRobot,
  faBolt,
  faCheckDouble,
} from "@fortawesome/free-solid-svg-icons";

const PublicPage = () => {
  const aiFeatures = [
    {
      title: "Sơ đồ tư duy AI",
      desc: "Tự động trích xuất và tạo sơ đồ tư duy trực quan từ video bài giảng, giúp học viên dễ dàng nắm bắt cấu trúc kiến thức.",
      icon: faBrain,
    },
    {
      title: "Phân chương thông minh",
      desc: "Trí tuệ nhân tạo tự động phân chia thời lượng và tạo các mốc thời gian, giúp việc tra cứu nội dung trở nên thuận tiện.",
      icon: faListOl,
    },
    {
      title: "Trắc nghiệm tự động",
      desc: "Hệ thống tự động biên soạn các câu hỏi đánh giá năng lực dựa trên nội dung video của bạn.",
      icon: faClipboardQuestion,
    },
    {
      title: "Trợ giảng AI",
      desc: "Trợ lý ảo hoạt động 24/7, sẵn sàng giải đáp thắc mắc của học viên theo sát ngữ cảnh bài học.",
      icon: faRobot,
    },
    {
      title: "Xử lý tự động",
      desc: "Trích xuất âm thanh và phân tích khung hình ngay lập tức từ các video tải lên hoặc liên kết YouTube.",
      icon: faBolt,
    },
    {
      title: "Chấm điểm tức thì",
      desc: "Đánh giá nhanh chóng kết quả bài kiểm tra thông qua việc thống kê chi tiết tỷ lệ đáp án chính xác.",
      icon: faCheckDouble,
    },
  ];

  return (
    <div className="animate-fade-slide-up min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* HEADER (Bổ sung hiệu ứng Glassmorphism và Sticky) */}
      <header className="w-full bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={myLogo}
              alt="EduSync Logo"
              className="h-12 w-auto object-contain"
            />
            <span className="font-semibold text-2xl text-blue-900 tracking-widest font-irish">
              EduSync
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Nút Đăng nhập */}
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 transition-colors shadow-md"
            >
              Đăng nhập
            </Link>

            {/* Nút Đăng ký */}
            <Link
              to="/register"
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-slate-200 text-blue-950 hover:bg-slate-300 transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Cột trái: Text & Buttons */}
        <div>
          <h1 className="text-5xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
            Chia sẻ tri thức.
            <br />
            <span className="text-blue-700">Cùng nhau học tập.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 pr-12 leading-relaxed font-medium">
            Tải lên các bài giảng video tương tự YouTube. Trí tuệ nhân tạo (AI) sẽ chuyển đổi chúng thành các khóa học tương tác thông minh với sơ đồ tư duy, câu hỏi trắc nghiệm và trợ lý học tập cá nhân hóa.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-3 px-6 py-3.5 bg-blue-900 text-white rounded-xl font-semibold hover:bg-blue-800 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
            >
              <FontAwesomeIcon icon={faUpload} />
              Tạo khóa học của bạn
            </Link>
            <Link
              to="/courses"
              className="flex items-center gap-3 px-6 py-3.5 bg-white border border-slate-300 text-slate-800 rounded-xl font-semibold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
              <FontAwesomeIcon icon={faPlay} className="text-blue-600" />
              Khám phá hệ thống
            </Link>
          </div>
        </div>

        {/* Cột phải: Video Demo (YouTube Embed) */}
        <div className="rounded-2xl aspect-video relative overflow-hidden shadow-2xl border border-slate-200">
          <iframe width="560" height="315" src="https://www.youtube.com/embed/SoOmth8OUh4?si=mIoGEPTMXxSE08ZE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>
      </section>

      {/* ĐƯỜNG PHÂN CÁCH */}
      <div className="max-w-7xl mx-auto px-8">
        <hr className="border-slate-200" />
      </div>

      {/* AI FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-12 text-center tracking-tight">
          Tính năng AI Mạnh mẽ
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aiFeatures.map((feature, index) => (
            <div
              key={index}
              className="border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white group"
            >
              <div className="w-14 h-14 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center mb-6 text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FontAwesomeIcon icon={feature.icon} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ĐƯỜNG PHÂN CÁCH */}
      <div className="max-w-7xl mx-auto px-8">
        <hr className="border-slate-200" />
      </div>

      {/* CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-8 py-24 text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Bắt đầu hành trình của bạn ngay hôm nay
        </h2>
        <p className="text-lg text-slate-600 mb-10 font-medium">
          Tham gia cùng cộng đồng giảng viên và học viên đang chuyển đổi nền giáo dục bằng các khóa học tương tác ứng dụng công nghệ Trí tuệ nhân tạo.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-4 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 active:scale-95 w-full sm:w-auto"
          >
            Bắt đầu miễn phí
          </Link>
          <Link
            to="/courses"
            className="px-8 py-4 bg-white border border-slate-300 text-slate-800 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 w-full sm:w-auto"
          >
            Khám phá danh mục
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default PublicPage;