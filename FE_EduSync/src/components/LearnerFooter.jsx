import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import myLogo from "../assets/logo.png";
import {
  faFacebook,
  faTwitter,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="bg-blue-950 pt-16 pb-8 border-t border-gray-200 mt-8">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <img src={myLogo} alt="EduSync Logo" className="w-12 h-12" />
              <span className="font-semibold text-2xl text-white tracking-widest font-irish">
                EduSync
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
              Nền tảng học tập trực tuyến thế hệ mới, ứng dụng AI để biến đổi
              video thành các khóa học tương tác thông minh.
            </p>
            <div className="flex gap-4 text-gray-400">
              <a href="#" className="hover:text-blue-900 transition-colors">
                <FontAwesomeIcon icon={faFacebook} size="lg" />
              </a>
              <a href="#" className="hover:text-blue-900 transition-colors">
                <FontAwesomeIcon icon={faTwitter} size="lg" />
              </a>
              <a href="#" className="hover:text-blue-900 transition-colors">
                <FontAwesomeIcon icon={faLinkedin} size="lg" />
              </a>
            </div>
          </div>

          {/* Cột 2: Đường dẫn nhanh */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-wider">
              Khám phá
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <Link
                  to="/courses"
                  className="hover:text-white transition-colors"
                >
                  Danh sách khóa học
                </Link>
              </li>
              <li>
                <Link
                  to="/instructors"
                  className="hover:text-white transition-colors"
                >
                  Giảng viên tiêu biểu
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition-colors"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">
                  Blog chia sẻ
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-wider">
              Hỗ trợ
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Câu hỏi thường gặp (FAQ)
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-white transition-colors"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  to="/guide"
                  className="hover:text-white transition-colors"
                >
                  Hướng dẫn sử dụng
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-wider">
              Liên hệ
            </h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="mt-1 text-gray-400"
                />
                <span>support@edusync.com</span>
              </li>
              <li className="flex items-start gap-3">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="mt-1 text-gray-400"
                />
                <span>+84 123 456 789</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} EduSync. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
