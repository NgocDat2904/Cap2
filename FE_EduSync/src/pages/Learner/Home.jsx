import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPopularCoursesAPI } from "../../services/learnerCourseAPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLaptopCode,
  faRobot,
  faPlayCircle,
  faCheckCircle,
  faUsers,
  faPalette,
  faChartPie,
  faMobileScreen,
  faServer,
  faDatabase,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

const EduSyncHome = () => {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("access_token"));

  const [featuredCourses, setFeaturedCourses] = useState([]);

  // =========================================================================
  // GỌI API LẤY 4 KHÓA HỌC HOT NHẤT
  // =========================================================================
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getPopularCoursesAPI();
        const top4 = data
          .sort((a, b) => (b.students || 0) - (a.students || 0))
          .slice(0, 4);
          
        setFeaturedCourses(top4);
      } catch (error) {
        console.error("Lỗi lấy khóa học:", error);
      }
    };
    fetchCourses();
  }, []);

  const categories = [
    { name: "Frontend Web Development", icon: <FontAwesomeIcon icon={faLaptopCode} className="text-blue-500 text-2xl" />, courses: "120+" },
    { name: "Backend Web Development", icon: <FontAwesomeIcon icon={faServer} className="text-slate-700 text-2xl" />, courses: "95+" },
    { name: "Mobile Development", icon: <FontAwesomeIcon icon={faMobileScreen} className="text-teal-500 text-2xl" />, courses: "60+" },
    { name: "Artificial Intelligence (AI)", icon: <FontAwesomeIcon icon={faRobot} className="text-purple-600 text-2xl" />, courses: "85+" },
    { name: "Data Analysis (DA)", icon: <FontAwesomeIcon icon={faChartPie} className="text-emerald-500 text-2xl" />, courses: "110+" },
    { name: "Data Engineering (DE)", icon: <FontAwesomeIcon icon={faDatabase} className="text-indigo-500 text-2xl" />, courses: "70+" },
    { name: "UI/UX Design", icon: <FontAwesomeIcon icon={faPalette} className="text-pink-500 text-2xl" />, courses: "150+" },
    { name: "Business Analysis (BA)", icon: <FontAwesomeIcon icon={faChartLine} className="text-amber-500 text-2xl" />, courses: "90+" },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <main className="animate-fade-slide-up w-full space-y-16 pb-12 font-sans">
      {/* ================= HERO SECTION (PREMIUM BENTO UI) ================= */}
      <section className="relative overflow-hidden bg-white rounded-[2rem] p-8 sm:p-12 lg:p-16 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-12 group">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        <div className="relative z-10 flex-1 space-y-7 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            EduSync AI
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Master your skills <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              with a smart roadmap
            </span>
          </h1>

          <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Stop guessing what to learn next. Our system analyzes your goals and generates an adaptive, real-time curriculum tailored specifically to your career.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
            <button
              type="button"
              onClick={() =>
                navigate(isLoggedIn ? "/courses" : "/login", {
                  state: { from: "/home" },
                })
              }
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors duration-300 shadow-md hover:shadow-xl hover:shadow-blue-600/20 active:scale-95"
            >
              {isLoggedIn ? "Start learning now" : "Sign in to start learning"}
            </button>
            <Link
              to="/courses"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-700 font-bold rounded-xl hover:bg-slate-50 border border-slate-200 transition-colors active:scale-95 text-center"
            >
              Explore courses
            </Link>
          </div>
        </div>

        <div className="relative z-10 hidden lg:block w-5/12 h-[380px] perspective-1000">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-6 hover:-translate-y-2 transition-transform duration-500 cursor-default">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Path</p>
                <h4 className="font-bold text-slate-800 text-lg">Frontend Architect</h4>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm">
                68%
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-700">React Advanced Patterns</span>
                  <span className="text-slate-500 font-medium">8/10 pts</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-700">UI/UX System Design</span>
                  <span className="text-slate-500 font-medium">2/5 pts</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-indigo-400 h-full rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -left-6 top-8 bg-white rounded-xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-4 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
               <FontAwesomeIcon icon={faRobot} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Mindmap Ready</p>
              <p className="text-xs text-slate-500 font-medium">Generated via AI</p>
            </div>
          </div>

          <div className="absolute -right-4 bottom-12 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl p-4 flex items-center gap-3 hover:-translate-y-1 transition-transform duration-300">
            <div className="text-emerald-400 text-xl bg-emerald-400/10 rounded-full p-1">
               <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Daily Goal Met</p>
              <p className="text-[11px] text-slate-400 font-medium">+50 EXP points</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES SECTION ================= */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Categories
            </h2>
            <p className="text-slate-500 mt-2 font-medium">Master the most in-demand tech skills</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-300 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex items-center gap-5 group"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-slate-50 rounded-2xl group-hover:bg-blue-50 group-hover:scale-110 transition-all duration-300">
                {cat.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-[15px] group-hover:text-blue-600 transition-colors leading-tight mb-1">
                  {cat.name}
                </h3>
                <p className="text-sm text-slate-500 font-semibold">
                  {cat.courses} courses
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FEATURED COURSES SECTION ================= */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Courses
            </h2>
            <p className="text-slate-500 mt-2 font-medium">
              Top-rated programs to accelerate your career
            </p>
          </div>
          <Link
            to="/courses"
            className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors hidden sm:flex items-center gap-2"
          >
            Explore all <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {featuredCourses.length > 0 ? (
            featuredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] hover:border-blue-200 hover:-translate-y-2 transition-all duration-400 overflow-hidden flex flex-col group cursor-pointer relative"
              >
                {/* Thumbnail Area */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-blue-600 opacity-0 transform scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-xl">
                      <FontAwesomeIcon icon={faPlayCircle} className="text-2xl ml-1" />
                    </div>
                  </div>
                  {/* Glassmorphism Lesson Tag */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1.5 bg-slate-900/60 backdrop-blur-md text-white text-xs font-semibold rounded-lg flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faPlayCircle} className="text-[10px]" /> {course.lesson_count || 0} Lessons
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Category & Students */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {course.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-400 font-medium text-xs">
                      <FontAwesomeIcon icon={faUsers} />
                      {course.students || 0}
                    </div>
                  </div>

                  <h3 className="font-bold text-[17px] text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors mb-3">
                    {course.title}
                  </h3>

                  {/* Instructor */}
                  <div className="flex items-center gap-2 mt-auto pb-4">
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
                      {course.instructor ? course.instructor.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="text-xs font-semibold text-slate-600 line-clamp-1">
                      {course.instructor || "Unknown"}
                    </span>
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="text-blue-500 text-[11px]"
                      title="Verified Instructor"
                    />
                  </div>

                  {/* Footer: Price & CTA */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className={`font-extrabold text-xl tracking-tight ${!course.price || course.price === 0 ? "text-green-600" : "text-slate-900"}`}>
                      {!course.price || course.price === 0 ? "Free" : formatCurrency(course.price)}
                    </span>
                    <Link
                      to={`/courses/${course.id}`}
                      className="text-sm font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl transition-all duration-300"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
             <p className="col-span-full text-center text-slate-500 py-10 font-medium">No featured courses available at the moment.</p>
          )}
        </div>
      </section>
    </main>
  );
};

export default EduSyncHome;