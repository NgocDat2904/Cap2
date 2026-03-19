//  trang khách vãng lai, không cần đăng nhập vẫn có thể truy cập đươc.
import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Footer from "../components/Footer";
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
      title: "AI Mind Maps",
      desc: "Automatically creates visual mind maps from your videos to help students understand structure.",
      icon: faBrain,
    },
    {
      title: "Smart Chapters",
      desc: "AI generates intelligent chapter breaks and timestamps for easy navigation.",
      icon: faListOl,
    },
    {
      title: "Auto Quizzes",
      desc: "AI-generated assessment questions based on your video content.",
      icon: faClipboardQuestion,
    },
    {
      title: "AI Tutor",
      desc: "24/7 chatbot assistant that answers student questions in context.",
      icon: faRobot,
    },
    {
      title: "Automated Processing",
      desc: "Instantly extracts audio and analyzes frames from uploaded videos or YouTube links.",
      icon: faBolt,
    },
    {
      title: "Instant Scoring",
      desc: "Quickly evaluates quiz performance by calculating correct and incorrect answers.",
      icon: faCheckDouble,
    },
  ];

  return (
    <div className="animate-fade-slide-up min-h-screen bg-white font-sans text-gray-800">
      {/* 1. HEADER */}
      <header className="w-full bg-blue-950 shadow-md">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={myLogo}
              alt="EduSync Logo"
              className=" h-16 w-auto object-contain "
            />
            <span className="font-semibold text-3xl text-white tracking-widest font-irish">
              EduSync
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Nút Sign In */}
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-md text-sm font-semibold text-white bg-blue-900 hover:bg-blue-900 transition-colors"
            >
              Sign in
            </Link>

            {/* Nút Sign Up */}
            <Link
              to="/register"
              className="px-6 py-2.5 rounded-md text-sm font-semibold bg-white text-blue-950 hover:bg-gray-100 transition-colors shadow-md"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Cột trái: Text & Buttons */}
        <div>
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Share Knowledge.
            <br />
            Learn Together.
          </h1>
          <p className="text-lg text-gray-600 mb-8 pr-12 leading-relaxed">
            Upload video lessons like YouTube. AI transforms them into
            interactive courses with mind maps, quizzes, and personalized
            tutoring.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-3 px-6 py-3 bg-blue-900 text-white rounded-md font-semibold hover:bg-blue-800 transition-colors shadow-md"
            >
              <FontAwesomeIcon icon={faUpload} />
              Create your course
            </Link>
            <Link
              to="/courses"
              className="flex items-center gap-3 px-6 py-3 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 transition-colors"
            >
              <FontAwesomeIcon icon={faPlay} />
              Explore course
            </Link>
          </div>
        </div>

        {/* Cột phải: Video Demo (YouTube Embed) */}
        <div className="rounded-xl aspect-video relative overflow-hidden shadow-2xl border border-gray-100">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            // Thay mã ID video youtube của bạn vào chỗ "dQw4w9WgXcQ" nhé
            src="https://www.youtube.com/embed/rO1ANdXvdTg"
            title="EduSync Demo Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8">
        <hr className="border-gray-300 my-8" />
      </div>

      {/* 3. AI FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-10">
          Powerful AI Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiFeatures.map((feature, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-xl p-8 hover:shadow-lg transition-shadow bg-white"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-lg flex items-center justify-center mb-6 text-xl">
                <FontAwesomeIcon icon={feature.icon} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8">
        <hr className="border-gray-300 my-12" />
      </div>

      {/* 4. CALL TO ACTION (Kêu gọi hành động) */}
      <section className="max-w-7xl mx-auto px-8 py-12 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Start Your Journey Today
        </h2>
        <p className="text-gray-600 mb-10">
          Join creators and learners transforming education with AI-powered
          interactive courses.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-3 bg-blue-900 text-white rounded-md font-semibold hover:bg-blue-800 transition-colors shadow-md"
          >
            Get Started Free
          </Link>
          <Link
            to="/courses"
            className="px-8 py-3 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300 transition-colors"
          >
            Explore course
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8">
        <hr className="border-gray-300 mt-12 mb-0" />
      </div>

      {/* 5. FOOTER */}
      <Footer />
    </div>
  );
};

export default PublicPage;
