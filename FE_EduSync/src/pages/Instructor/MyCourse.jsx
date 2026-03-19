import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import {
  faSearch,
  faPlus,
  faEdit,
  faTrash,
  faBookOpen,
  faUserGroup,
  faTag,
} from "@fortawesome/free-solid-svg-icons";

const InstructorMyCourses = () => {
  // 1. MOCK DATA: Dữ liệu khóa học giả lập để map ra giao diện
  const myCourses = [
    {
      id: 1,
      title: "React.js Fundamentals: Build modern web apps",
      category: "Frontend Development",
      status: "Published",
      students: 156,
      lessons: 24,
      price: 49.99,
      image:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 2,
      title: "Advanced Python for Data Science and Machine Learning",
      category: "Data Science",
      status: "Published",
      students: 89,
      lessons: 32,
      price: 79.99,
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 3,
      title: "UI/UX Design Masterclass: Adobe XD & Figma實戰",
      category: "Design",
      status: "Draft",
      students: 0,
      lessons: 18,
      price: 35.0,
      image:
        "https://images.unsplash.com/photo-1587440871875-191322ee64b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 4,
      title: "Node.js Complete Guide: From Zero to Hero",
      category: "Backend Development",
      status: "Published",
      students: 210,
      lessons: 40,
      price: 55.0,
      image:
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <main className="animate-fade-slide-up flex-1 p-6 sm:p-8 md:p-10 bg-blue-50/50 font-sans min-h-screen">
      {/* ========================================================= */}
      {/* 1. HEADER SECTION: Tiêu đề, Mô tả và Nút Create */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            My Courses
          </h1>
          <p className="text-slate-600 mt-1.5 text-base font-medium">
            Manage, edit, and create your educational content here.
          </p>
        </div>
        {/* Nút Create Course: Nổi bật với màu blue gradient */}
        <Link
          to="/instructor/courses/create"
          className="flex items-center gap-2.5 px-6 py-3.5  bg-blue-600  text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition duration-300 shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} />
          Create Course
        </Link>
      </div>

      {/* ========================================================= */}
      {/* 2. CONTROLS SECTION: Thanh tìm kiếm và Bộ lọc status */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-10">
        {/* Thanh tìm kiếm: Bo tròn pill (viên thuốc) */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-slate-400" />
          </div>
          <input
            type="search"
            placeholder="Search by course title or keyword..."
            className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-full bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition text-base"
          />
        </div>

        {/* Bộ lọc trạng thái: Dạng pill buttons */}
        <div className="flex items-center gap-2.5 p-1.5 bg-white border border-slate-100 rounded-full shadow-inner w-full lg:w-auto justify-center sm:justify-start">
          <button className="px-6 py-2.5 rounded-full font-semibold text-sm text-blue-800 bg-blue-100 transition duration-300">
            All
          </button>
          <button className="px-6 py-2.5 rounded-full font-semibold text-sm text-slate-600 hover:bg-slate-50 transition duration-300">
            Published
          </button>
          <button className="px-6 py-2.5 rounded-full font-semibold text-sm text-slate-600 hover:bg-slate-50 transition duration-300">
            Draft
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. COURSE GRID SECTION: Lưới chứa các thẻ khóa học */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {myCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group"
          >
            {/* Ảnh bìa khóa học */}
            <div className="relative aspect-video overflow-hidden cursor-pointer">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Badge Trạng thái: Published (Xanh dương), Draft (Xám) */}
              <span
                className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm 
                ${course.status === "Published" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}`}
              >
                {course.status}
              </span>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-widest">
                <FontAwesomeIcon icon={faTag} />
                <span>{course.category}</span>
              </div>

              <h3 className="font-bold text-xl text-slate-950 mt-2.5 line-clamp-2 leading-tight group-hover:text-blue-700 transition cursor-pointer">
                {course.title}
              </h3>
              <p className="text-slate-500 mt-2 text-sm line-clamp-2 font-medium">
                Master React from zero with our complete, practical guide.
              </p>

              <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 rounded-2xl p-4 mt-6 border border-gray-100 shadow-inner">
                <div>
                  <div className="flex items-center justify-center gap-1.5 text-blue-600">
                    <FontAwesomeIcon icon={faUserGroup} className="text-sm" />
                    <span className="font-extrabold text-2xl text-slate-950">
                      {course.students}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">
                    Students
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1.5 text-purple-600">
                    <FontAwesomeIcon icon={faBookOpen} className="text-sm" />
                    <span className="font-extrabold text-2xl text-slate-950">
                      {course.lessons}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">
                    Lessons
                  </div>
                </div>
                <div>
                  <div className="font-extrabold text-2xl text-green-700">
                    ${course.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">
                    Price
                  </div>
                </div>
              </div>

              <hr className="my-6 border-gray-100" />

              <div className="mt-auto pt-1 flex items-center justify-between">
                <button className="text-slate-500 hover:text-blue-600 p-2.5 rounded-lg hover:bg-blue-50 transition active:scale-90">
                  <FontAwesomeIcon icon={faEdit} className="text-lg" />
                </button>
                <a
                  href="#"
                  className="font-bold text-sm text-slate-800 hover:text-blue-700 transition hover:underline"
                >
                  View Details
                </a>
                <button className="text-slate-500 hover:text-red-600 p-2.5 rounded-lg hover:bg-red-50 transition active:scale-90">
                  <FontAwesomeIcon icon={faTrash} className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default InstructorMyCourses;
