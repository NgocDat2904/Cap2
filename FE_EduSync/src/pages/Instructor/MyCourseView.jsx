import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faUsers,
  faClock,
  faCheckCircle,
  faVideo,
  faEdit,
  faEye,
  faChevronDown,
  faChevronUp,
  faTrophy,
  faSearch,
  faFilter,
  faReply,
  faToggleOn,
  faToggleOff,
  faExclamationTriangle,
  faWandMagicSparkles,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { getInstructorCourseDetailAPI } from "../../services/instructorAPI";

// =========================================================================
// 1. MOCK DATA
// =========================================================================

// Mock Data Q&A
const qnaList = [
  {
    id: 1,
    student: "Hoàng Nguyễn",
    avatar: "HN",
    time: "2 hours ago",
    lesson: "What is React?",
    text: "Can React be used for Mobile App Development?",
    status: "unanswered",
  },
  {
    id: 2,
    student: "Hương Lan",
    avatar: "HL",
    time: "1 day ago",
    lesson: "JSX and Rendering",
    text: "Why do we need to use className instead of class in JSX?",
    status: "answered",
    reply: "Because 'class' is a reserved keyword in JavaScript.",
  },
];

// Mock Data Chi tiết khóa học
const mockCourseDetail = {
  id: "course-101",
  title: "Master ReactJS from zero to hero",
  category: "Web Development",
  status: "Published",
  students: 1250,
  duration: "12h 30m",
  price: 49.99,
  thumbnail:
    "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
  instructor: "Nguyễn Văn A",
  avatar: "https://i.pravatar.cc/150?img=11",
};

// Mock Data Danh sách bài giảng (Có đầy đủ videoStats và quizStats)
const mockLessonsList = [
  {
    id: 1,
    order: "01",
    title: "Introduction to React",
    description: "What is React and why should you use it?",
    duration: "10:00",
    quizStatus: "none",
    videoStats: { views: 1250, completion: "95%" },
  },
  {
    id: 2,
    order: "02",
    title: "JSX and Rendering Elements",
    description:
      "Understanding JSX syntax and how React renders elements to the DOM.",
    duration: "15:30",
    quizStatus: "published",
    videoStats: { views: 1100, completion: "88%" },
    quizStats: { passRate: "92%", avgScore: "8.5" },
  },
  {
    id: 3,
    order: "03",
    title: "State and Props",
    description:
      "Managing data in React components and passing data between them.",
    duration: "25:00",
    quizStatus: "draft",
    videoStats: { views: 850, completion: "70%" },
    quizStats: { questions: 10 }, // Bản nháp nên chỉ có số lượng câu hỏi
  },
];

// =========================================================================
// 2. COMPONENT BÀI GIẢNG (Lesson Accordion)
// =========================================================================
const LessonAccordion = ({ lesson }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`bg-white border transition-all duration-300 rounded-2xl mb-4 overflow-hidden shadow-sm hover:shadow-md ${isOpen ? "border-blue-400 ring-4 ring-blue-50" : "border-slate-200"}`}
    >
      <div
        className="flex items-start gap-4 p-5 cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-slate-100">
          <img
            src={lesson.thumbnail_url || "https://via.placeholder.com/150"}
            alt={lesson.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition-colors">
            {lesson.title}
          </h4>
          <p className="text-slate-500 text-sm leading-relaxed mt-1 line-clamp-1">
            {lesson.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-bold">
            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">
              <FontAwesomeIcon icon={faVideo} /> Video
            </span>
            <span className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
              <FontAwesomeIcon icon={faClock} /> {lesson.duration}
            </span>
            {lesson.quizStatus !== "none" && (
              <span
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${lesson.quizStatus === "draft" ? "bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse" : "bg-amber-50 text-amber-700 border-amber-200"}`}
              >
                <FontAwesomeIcon
                  icon={
                    lesson.quizStatus === "draft"
                      ? faWandMagicSparkles
                      : faTrophy
                  }
                />
                {lesson.quizStatus === "draft"
                  ? "AI Quiz (Publishing)"
                  : "Exercise (Quiz)"}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button className="text-slate-400 p-2.5 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <FontAwesomeIcon
              icon={isOpen ? faChevronUp : faChevronDown}
              className="text-lg"
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-[#f8fafc] animate-fade-slide-up flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Hiệu suất Video */}
            <div className="p-6">
              <h5 className="font-extrabold text-slate-800 mb-4 text-xs uppercase tracking-wider text-center">
                Video Performance
              </h5>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-slate-500 text-sm font-semibold flex items-center gap-2">
                    <FontAwesomeIcon icon={faEye} /> Views
                  </span>
                  <span className="font-black text-slate-900">
                    {/* Đã thêm dấu ?. để tránh crash nếu videoStats bị undefined */}
                    {lesson.videoStats?.views || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <span className="text-slate-500 text-sm font-semibold flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} /> Completion
                  </span>
                  <span className="font-black text-green-600">
                    {/* Đã thêm dấu ?. */}
                    {lesson.videoStats?.completion || "0%"}
                  </span>
                </div>
              </div>
            </div>

            {/* Đánh giá Quiz */}
            <div className="p-6">
              <h5 className="font-extrabold text-slate-800 mb-4 text-xs uppercase tracking-wider text-center">
                Quiz Results
              </h5>
              {lesson.quizStatus === "draft" ? (
                <div className="flex flex-col items-center justify-center h-full bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-3 shadow-inner">
                    <FontAwesomeIcon
                      icon={faWandMagicSparkles}
                      className="text-xl"
                    />
                  </div>
                  <p className="text-sm font-bold text-indigo-900 mb-1">
                    {/* Đã thêm dấu ?. */}
                    AI generated {lesson.quizStats?.questions || 0} questions
                  </p>
                  <p className="text-xs text-indigo-600/80">
                    Will be published automatically.
                  </p>
                </div>
              ) : lesson.quizStatus === "published" ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <span className="text-slate-500 text-sm font-semibold">
                      Pass Rate
                    </span>
                    <span className="font-black text-blue-600">
                      {/* Đã thêm dấu ?. */}
                      {lesson.quizStats?.passRate || "0%"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <span className="text-slate-500 text-sm font-semibold">
                      Avg. Score
                    </span>
                    <span className="font-black text-slate-900">
                      {/* Đã thêm dấu ?. */}
                      {lesson.quizStats?.avgScore || "0"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full opacity-50">
                  <FontAwesomeIcon
                    icon={faTrophy}
                    className="text-3xl text-slate-300 mb-2"
                  />
                  <p className="text-xs font-bold text-slate-400">
                    No exercises
                  </p>
                </div>
              )}
            </div>

            {/* Q&A */}
            <div className="p-6">
              <h5 className="font-extrabold text-slate-800 mb-4 text-xs uppercase tracking-wider flex justify-between items-center">
                <span>Q&A</span>
              </h5>
              <p className="text-xs text-slate-400 text-center italic mt-6">
                No questions yet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const parseDuration = (duration) => {
  if (!duration) return 0;

  const parts = duration.split(":").map(Number);

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return 0;
};

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  if (h > 0) {
    return `${h}h ${m}m`;
  }

  return `${m}m`;
};

// =========================================================================
// 3. MAIN PAGE
// =========================================================================
const InstructorCourseDetailPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const [activeTab, setActiveTab] = useState("Curriculum");
  const [courseDetail, setCourseDetail] = useState(null);
  const [lessonsList, setLessonsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPublished, setIsPublished] = useState(false);

  const totalSeconds = lessonsList.reduce((total, lesson) => {
    return total + parseDuration(lesson.duration);
  }, 0);

  const totalDuration = formatDuration(totalSeconds);

  // Fetch course detail giả lập

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("access_token");

        const data = await getInstructorCourseDetailAPI(courseId, token);
        console.log("LESSONS:", data.lessonsList);
        setCourseDetail({
          ...data.courseDetail,
          price: data.courseDetail.price || 0,
          image: data.courseDetail.thumbnail || "",
        });

        setLessonsList(data.lessonsList || []);
      } catch (err) {
        console.error(err);
        setError("Error loading course details");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) fetchCourseDetail();
  }, [courseId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-400">
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-4xl animate-spin text-blue-500 mb-4"
        />
        <p className="font-bold">Loading course information...</p>
      </div>
    );
  }

  // Error state
  if (error || !courseDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 bg-slate-50 text-slate-600">
        <p className="font-bold text-red-600 mb-4">
          {error || "No data available"}
        </p>
        <button
          type="button"
          onClick={() => navigate("/instructor/courses")}
          className="px-4 py-2 bg-slate-200 rounded-xl font-bold hover:bg-slate-300"
        >
          Back to course list
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 w-full animate-fade-slide-up p-4 sm:p-6 lg:p-8 relative">
      <section className="bg-gradient-to-r from-[#308dff] via-[#5178af] to-[#5176b0] rounded-3xl p-8 sm:p-10 lg:p-12 relative shadow-lg overflow-visible mb-8">
        <div className="flex flex-col lg:flex-row justify-between gap-10">
          <div className="w-full lg:w-2/3 text-white">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-wider"
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Back
            </button>
            <div className="mb-4">
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase border border-white/20 shadow-sm">
                {courseDetail.category}
              </span>
              <span
                className={`ml-3 inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase border shadow-sm
                ${isPublished ? "bg-emerald-500/20 border-emerald-400/50 text-emerald-200" : "bg-amber-500/20 border-amber-400/50 text-amber-200"}
              `}
              >
                {isPublished ? "Published" : "Pending Review"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2 tracking-tight">
              Course Management
            </h1>

            {/* ✅ ĐÃ CẬP NHẬT: Thêm Description ngay bên dưới Title */}
            <h2 className="text-white/90 text-xl font-bold mb-3">
              {courseDetail.title}
            </h2>
            <p className="text-white/80 text-sm mb-10 leading-relaxed max-w-3xl line-clamp-3">
              {courseDetail.description || "No description available for this course."}
            </p>

            <div className="flex flex-wrap items-center gap-8">
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2 text-white/80">
                  <FontAwesomeIcon icon={faUsers} className="text-lg" />
                </div>
                <p className="font-bold text-sm">
                  {courseDetail.students} Students
                </p>
              </div>
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2 text-white/80">
                  <FontAwesomeIcon icon={faClock} className="text-lg" />
                </div>
                <p className="font-bold text-sm">{courseDetail.duration}</p>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[320px] bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex flex-col shrink-0 lg:-mb-24 relative z-10">
            <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 bg-slate-200">
              <img
                src={courseDetail.thumbnail}
                alt="Course cover"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="px-2 pb-2">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                Price
              </p>
              <p className="text-2xl font-black text-emerald-600 mb-5">
                ${Number(courseDetail.price).toFixed(2)}
              </p>
              <Link
                to={`/instructor/courses/${courseDetail.id}/edit`}
                className="w-full py-3.5 bg-[#1e3a8a] hover:bg-[#172e6e] text-white font-bold rounded-xl transition-all shadow-md shadow-blue-900/30 active:scale-95 text-sm flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faEdit} /> Edit Course
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-8 items-start relative z-0 mt-4">
        {/* ===================== CỘT TRÁI (MAIN CONTENT) ===================== */}
        <div className="w-full lg:flex-1">
          {/* Menu Tabs */}
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
            {["Curriculum", "Q&A", "Settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all
                  ${activeTab === tab ? "bg-[#1e3a8a] text-white shadow-md" : "bg-transparent text-slate-500 hover:bg-slate-200/50"}
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB 1: CURRICULUM */}
          {activeTab === "Curriculum" && (
            <div className="animate-fade-slide-up">
              <div className="mb-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
                    Course Curriculum
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">
                    {lessonsList.length} Lessons • Total duration{" "}
                    {totalDuration}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {lessonsList.map((lesson) => (
                  <LessonAccordion key={lesson.id} lesson={lesson} />
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Q&A */}
          {activeTab === "Q&A" && (
            <div className="animate-fade-slide-up bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      Course Q&A
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                      You have 2 unanswered questions to handle.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <input
                        type="text"
                        placeholder="Search questions..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-3.5 top-2.5 text-slate-400 text-sm"
                      />
                    </div>
                    <button className="p-2 border border-slate-300 rounded-lg text-slate-500 hover:bg-slate-100 bg-white shadow-sm">
                      <FontAwesomeIcon icon={faFilter} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {qnaList.map((q) => (
                  <div
                    key={q.id}
                    className={`p-6 transition-colors ${q.status === "unanswered" ? "bg-blue-50/30" : "hover:bg-slate-50"}`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm text-white ${q.status === "unanswered" ? "bg-blue-600" : "bg-slate-400"}`}
                      >
                        {q.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">
                              {q.student}
                            </h4>
                            <p className="text-slate-500 text-xs mt-0.5">
                              Lesson:{" "}
                              <span className="text-blue-600 font-medium hover:underline cursor-pointer">
                                {q.lesson}
                              </span>{" "}
                              • {q.time}
                            </p>
                          </div>
                          {q.status === "unanswered" && (
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                              Unanswered
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 text-sm mt-3">{q.text}</p>
                        <div className="mt-4">
                          {q.status === "answered" ? (
                            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 mt-2 relative">
                              <div className="absolute -top-3 left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-slate-200"></div>
                              <p className="text-xs font-bold text-slate-500 mb-1">
                                Your reply:
                              </p>
                              <p className="text-sm text-slate-700">
                                {q.reply}
                              </p>
                            </div>
                          ) : (
                            <div className="flex gap-2 mt-4">
                              <input
                                type="text"
                                placeholder="Write your reply..."
                                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm flex items-center gap-2">
                                <FontAwesomeIcon icon={faReply} /> Reply
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS */}
          {activeTab === "Settings" && (
            <div className="animate-fade-slide-up space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-800 text-lg">
                    Course Status
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Manage your course visibility on EduSync.
                  </p>
                </div>
                <div className="p-6 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">
                        Publicly visible (Published)
                      </h4>
                      <p className="text-slate-500 text-sm mt-1 max-w-lg">
                        If turned off, the course will revert to Draft status.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsPublished(!isPublished)}
                      className={`text-4xl transition-colors ${isPublished ? "text-blue-600" : "text-slate-300"}`}
                    >
                      <FontAwesomeIcon
                        icon={isPublished ? faToggleOn : faToggleOff}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-800 text-lg">
                    Course Pricing
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    EduSync charges a 20% platform fee on each successful sale.
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Listed Price (USD)
                    </label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-4 top-2.5 text-slate-500 font-bold">
                        $
                      </span>
                      <input
                        type="number"
                        defaultValue={courseDetail.price}
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <button className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm text-sm">
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-red-100 bg-red-50/50 flex items-center gap-3">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="text-red-500 text-xl"
                  />
                  <h3 className="font-extrabold text-red-700 text-lg">
                    Danger Zone
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800">
                        Permanently delete this course
                      </h4>
                      <p className="text-slate-500 text-sm mt-1 max-w-lg">
                        This action cannot be undone.
                      </p>
                    </div>
                    <button className="px-6 py-2.5 bg-white border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-600 transition-colors shadow-sm text-sm shrink-0">
                      Delete Course
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===================== CỘT PHẢI (MINI INFO) ===================== */}
        <div className="w-full lg:w-[320px] shrink-0 lg:mt-[4.5rem]">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-6">
            <h4 className="font-extrabold text-slate-800 mb-5 uppercase tracking-wider text-sm">
              Instructor Profile
            </h4>
            <div className="flex items-center gap-4 mb-6">
              <img
                src={courseDetail.avatar}
                alt="Avatar"
                className="w-12 h-12 rounded-full border border-slate-200 object-cover shadow-sm"
              />
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {courseDetail.instructor}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Senior Instructor
                </p>
              </div>
            </div>
            <div className="space-y-3 border-t border-slate-100 pt-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-semibold">
                  Courses Created
                </span>
                <span className="font-bold text-slate-800">5</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-semibold">
                  Total Students
                </span>
                <span className="font-bold text-slate-800">1,250</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorCourseDetailPage;