import React, { useState, useEffect, useRef } from "react";
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
  faChalkboardTeacher,
  faPaperPlane,
  faCommentDots,
  faTimes // ✅ Thêm icon dấu X để đóng Modal
} from "@fortawesome/free-solid-svg-icons";
import { getInstructorCourseDetailAPI } from "../../services/instructorAPI";

// =========================================================================
// 1. COMPONENT BÀI GIẢNG (Lesson Accordion)
// =========================================================================
const LessonAccordion = ({ lesson, lessonQna, replyInputs, setReplyInputs, handleSendReply }) => {
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
            src={lesson.thumbnail_url || lesson.image || "https://via.placeholder.com/150"}
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
            {/* {lesson.quizStatus && lesson.quizStatus !== "none" && (
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
            )} */}
            {lessonQna?.length > 0 && (
              <span className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md border border-rose-100">
                <FontAwesomeIcon icon={faReply} /> {lessonQna.length} Q&A
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
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* CỘT TRÁI: HIỆU SUẤT & QUIZ */}
            <div className="p-6 flex flex-col gap-8 bg-white/50">
              <div>
                <h5 className="font-extrabold text-slate-800 mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faEye} className="text-blue-500" /> Video Performance
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <span className="text-slate-500 text-xs font-bold uppercase mb-1">Views</span>
                    <span className="font-black text-xl text-slate-900">{lesson.views || 0}</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <span className="text-slate-500 text-xs font-bold uppercase mb-1">Completion</span>
                    <span className="font-black text-xl text-green-600">{lesson.completion || "0%"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-extrabold text-slate-800 mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faTrophy} className="text-amber-500" /> Quiz Results
                </h5>
                {lesson.quizStatus === "draft" ? (
                  <div className="flex flex-col items-center justify-center bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 text-center">
                    <FontAwesomeIcon icon={faWandMagicSparkles} className="text-2xl text-indigo-400 mb-3" />
                    <p className="text-sm font-bold text-indigo-900 mb-1">
                      AI generated {lesson.quizStats?.questions || 10} questions
                    </p>
                    <p className="text-xs text-indigo-600/80">Will be published automatically.</p>
                  </div>
                ) : lesson.quizStatus === "published" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                      <span className="text-slate-500 text-xs font-bold uppercase mb-1">Pass Rate</span>
                      <span className="font-black text-xl text-blue-600">{lesson.quizStats?.passRate || "0%"}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                      <span className="text-slate-500 text-xs font-bold uppercase mb-1">Avg. Score</span>
                      <span className="font-black text-xl text-slate-900">{lesson.quizStats?.avgScore || "0"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 opacity-60">
                    <FontAwesomeIcon icon={faTrophy} className="text-2xl text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-400">No exercises</p>
                  </div>
                )}
              </div>
            </div>

            {/* CỘT PHẢI: Q&A */}
            <div className="p-6 bg-[#f8fafc]">
              <h5 className="font-extrabold text-slate-800 mb-5 text-xs uppercase tracking-wider flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCommentDots} className="text-rose-500" />
                  Q&A ({lessonQna?.length || 0})
                </span>
              </h5>
              
              {lessonQna && lessonQna.length > 0 ? (
                <div className="space-y-5 max-h-[450px] overflow-y-auto custom-scrollbar pr-2 pb-2">
                  {lessonQna.map((q) => (
                    <div key={q.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative transition-all hover:shadow-md">
                      <div className="absolute top-4 right-4">
                        {q.status === "unanswered" ? (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Unanswered
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                            <FontAwesomeIcon icon={faCheckCircle} /> Answered
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-200">
                          {q.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{q.student}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{q.time}</p>
                        </div>
                      </div>

                      <p className="text-sm text-slate-700 mb-4 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {q.text}
                      </p>
                      
                      <div>
                        {q.status === "answered" ? (
                          <div className="ml-4 pl-4 border-l-2 border-blue-400 bg-blue-50/50 p-4 rounded-r-2xl relative animate-fade-slide-up">
                            <div className="flex items-center gap-2 mb-2">
                              <FontAwesomeIcon icon={faChalkboardTeacher} className="text-blue-600 text-sm" />
                              <p className="text-xs font-black text-slate-800 uppercase tracking-wider">
                                Instructor Reply
                              </p>
                            </div>
                            <p className="text-sm text-slate-700 font-medium leading-relaxed">
                              {q.reply}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 mt-2 animate-fade-slide-up">
                            <textarea
                              rows="3"
                              placeholder="Write a helpful response to the student..."
                              value={replyInputs[q.id] || ""}
                              onChange={(e) => setReplyInputs({ ...replyInputs, [q.id]: e.target.value })}
                              onKeyDown={(e) => {
                                if(e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendReply(q.id);
                                }
                              }}
                              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium bg-white resize-y shadow-inner"
                            />
                            <div className="flex justify-between items-center">
                              <p className="text-[10px] text-slate-400 font-medium">Press <kbd className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-sans">Enter</kbd> to send</p>
                              <button 
                                onClick={() => handleSendReply(q.id)}
                                disabled={!replyInputs[q.id]?.trim()}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95"
                              >
                                <FontAwesomeIcon icon={faPaperPlane} /> Send Reply
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] bg-white border border-dashed border-slate-300 rounded-2xl p-6 opacity-60">
                  <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                    <FontAwesomeIcon icon={faReply} className="text-2xl text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-600">No questions yet</p>
                  <p className="text-xs text-slate-400 mt-1 text-center">When learners ask questions about this lesson, they will appear here.</p>
                </div>
              )}
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
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
};

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

// =========================================================================
// 2. MAIN PAGE: InstructorCourseDetailPage
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

  const [qnaData, setQnaData] = useState([]);
  const [replyInputs, setReplyInputs] = useState({});
  
  // ✅ STATE QUẢN LÝ MODAL PHÁT VIDEO
  const [videoModal, setVideoModal] = useState({
    isOpen: false,
    url: "",
    title: ""
  });

  const totalSeconds = lessonsList.reduce((total, lesson) => {
    return total + parseDuration(lesson.duration);
  }, 0);
  const totalDuration = formatDuration(totalSeconds);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("access_token");
        const data = await getInstructorCourseDetailAPI(courseId, token);
        
        setCourseDetail({
          ...data.courseDetail,
          price: data.courseDetail.price || 0,
          image: data.courseDetail.thumbnail || "",
        });

        const fetchedLessons = data.lessonsList || [];
        const enhancedLessons = fetchedLessons.map((lesson, index) => ({
          ...lesson,
          // Gắn link video demo nếu API không có để lúc bật Modal là có phim coi
          videoUrl: lesson.video_url || lesson.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4",
          views: lesson.views || Math.floor(Math.random() * 800) + 100, 
          completion: lesson.completion || `${Math.floor(Math.random() * 30) + 60}%`,
          quizStatus: index === 0 ? "published" : index === 1 ? "draft" : "none",
          quizStats: index === 0 ? { passRate: "92%", avgScore: "8.5" } : index === 1 ? { questions: 10 } : null,
        }));
        
        setLessonsList(enhancedLessons);

        if (fetchedLessons.length > 0) {
          setQnaData([
            {
              id: 1,
              lessonId: fetchedLessons[0]?.id, 
              student: "Hoàng Nguyễn",
              avatar: "HN",
              time: "2 hours ago",
              lesson: fetchedLessons[0]?.title || "Lesson 1",
              text: "Can React be used for Mobile App Development? I heard something about React Native.",
              status: "unanswered",
              reply: "",
            },
            {
              id: 2,
              lessonId: fetchedLessons[1]?.id || fetchedLessons[0]?.id, 
              student: "Hương Lan",
              avatar: "HL",
              time: "1 day ago",
              lesson: fetchedLessons[1]?.title || "Lesson 2",
              text: "Why do we need to use className instead of class in JSX?",
              status: "answered",
              reply: "Great question! Because 'class' is a reserved keyword in standard JavaScript.",
            },
            {
              id: 3,
              lessonId: fetchedLessons[1]?.id || fetchedLessons[0]?.id,
              student: "Việt Anh",
              avatar: "VA",
              time: "2 days ago",
              lesson: fetchedLessons[1]?.title || "Lesson 2",
              text: "Can I use inline styles in JSX?",
              status: "unanswered",
              reply: "",
            }
          ]);
        }

      } catch (err) {
        console.error(err);
        setError("Error loading course details");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) fetchCourseDetail();
  }, [courseId]);

  const handleSendReply = (questionId) => {
    const replyText = replyInputs[questionId];
    if (!replyText || replyText.trim() === "") return;

    setQnaData((prevQna) =>
      prevQna.map((q) =>
        q.id === questionId
          ? { ...q, status: "answered", reply: replyText }
          : q
      )
    );
    setReplyInputs((prev) => ({ ...prev, [questionId]: "" }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-400">
        <FontAwesomeIcon icon={faSpinner} className="text-4xl animate-spin text-blue-500 mb-4" />
        <p className="font-bold">Loading course information...</p>
      </div>
    );
  }

  if (error || !courseDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 bg-slate-50 text-slate-600">
        <p className="font-bold text-red-600 mb-4">{error || "No data available"}</p>
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

  const unansweredCount = qnaData.filter(q => q.status === "unanswered").length;

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
                className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all flex items-center gap-2
                  ${activeTab === tab ? "bg-[#1e3a8a] text-white shadow-md" : "bg-transparent text-slate-500 hover:bg-slate-200/50"}
                `}
              >
                {tab}
                {tab === "Q&A" && unansweredCount > 0 && (
                  <span className={`w-2 h-2 rounded-full ${activeTab === tab ? 'bg-red-400 animate-pulse' : 'bg-red-500'}`}></span>
                )}
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
                    {lessonsList.length} Lessons • Total duration {totalDuration}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {lessonsList.map((lesson) => {
                  const lessonQna = qnaData.filter(q => q.lessonId === lesson.id || q.lesson === lesson.title);
                  
                  return (
                    <LessonAccordion 
                      key={lesson.id} 
                      lesson={lesson} 
                      lessonQna={lessonQna}
                      replyInputs={replyInputs}
                      setReplyInputs={setReplyInputs}
                      handleSendReply={handleSendReply}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Q&A TỔNG HỢP */}
          {activeTab === "Q&A" && (
            <div className="animate-fade-slide-up bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      Course Q&A
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                      You have <span className="font-bold text-red-500">{unansweredCount}</span> unanswered questions to handle.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <input
                        type="text"
                        placeholder="Search questions..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-2.5 text-slate-400 text-sm" />
                    </div>
                    <button className="p-2 border border-slate-300 rounded-lg text-slate-500 hover:bg-slate-100 bg-white shadow-sm">
                      <FontAwesomeIcon icon={faFilter} />
                    </button>
                  </div>
                </div>
              </div>

              {/* DANH SÁCH Q&A ĐỘNG */}
              <div className="divide-y divide-slate-100 bg-[#f8fafc] p-6 space-y-6">
                {qnaData.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative transition-all hover:shadow-md"
                  >
                    <div className="absolute top-6 right-6">
                      {q.status === "unanswered" ? (
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-3 py-1.5 rounded-md uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span> Unanswered
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-md uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                          <FontAwesomeIcon icon={faCheckCircle} /> Answered
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold border border-blue-200 shadow-sm">
                        {q.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{q.student}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                          Lesson:{" "}
                          {/* ✅ BÍ KÍP Ở ĐÂY: Click vào link sẽ bật thẳng cái Popup Video lên */}
                          <button 
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded"
                            onClick={() => {
                              const targetLesson = lessonsList.find(l => l.id === q.lessonId);
                              setVideoModal({
                                isOpen: true,
                                url: targetLesson?.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4",
                                title: q.lesson
                              });
                            }}
                          >
                            <FontAwesomeIcon icon={faVideo} className="text-[10px]" />
                            {q.lesson}
                          </button>{" "}
                          • {q.time}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700 mb-5 leading-relaxed font-medium bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-inner">
                      {q.text}
                    </p>
                    
                    <div>
                      {q.status === "answered" ? (
                        <div className="ml-4 pl-5 border-l-2 border-blue-400 bg-blue-50/50 p-5 rounded-r-2xl relative animate-fade-slide-up">
                          <div className="flex items-center gap-2 mb-2">
                            <FontAwesomeIcon icon={faChalkboardTeacher} className="text-blue-600 text-sm" />
                            <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Instructor Reply</p>
                          </div>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed">
                            {q.reply}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 mt-4 animate-fade-slide-up">
                          <textarea
                            rows="3"
                            placeholder="Write a helpful response to the student..."
                            value={replyInputs[q.id] || ""}
                            onChange={(e) => setReplyInputs({ ...replyInputs, [q.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if(e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendReply(q.id);
                              }
                            }}
                            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium bg-white resize-y shadow-inner"
                          />
                          <div className="flex justify-between items-center">
                            <p className="text-[10px] text-slate-400 font-medium">Press <kbd className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-sans">Enter</kbd> to send</p>
                            <button 
                              onClick={() => handleSendReply(q.id)}
                              disabled={!replyInputs[q.id]?.trim()}
                              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95"
                            >
                              <FontAwesomeIcon icon={faPaperPlane} /> Send Reply
                            </button>
                          </div>
                        </div>
                      )}
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

      {/* ========================================================================= */}
      {/* OVERLAY MODAL PHÁT VIDEO */}
      {/* ========================================================================= */}
      {videoModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
            onClick={() => setVideoModal({ isOpen: false, url: "", title: "" })}
          ></div>
          <div className="relative bg-black w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-fade-slide-up flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 bg-slate-900 border-b border-slate-800">
              <h3 className="text-white font-bold text-sm sm:text-base truncate pr-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faVideo} className="text-blue-500" />
                {videoModal.title}
              </h3>
              <button
                onClick={() => setVideoModal({ isOpen: false, url: "", title: "" })}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-500 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="w-full aspect-video bg-black relative">
              <video
                src={videoModal.url}
                controls
                autoPlay
                className="absolute inset-0 w-full h-full object-contain"
              ></video>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InstructorCourseDetailPage;