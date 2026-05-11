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
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import { getInstructorCourseDetailAPI } from "../../services/instructorAPI";

// =========================================================================
// 1. COMPONENT BÀI GIẢNG (Lesson Accordion)
// =========================================================================
const LessonAccordion = ({ lesson, lessonQna, replyInputs, setReplyInputs, handleSendReply, targetLessonId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const accordionRef = useRef(null);

  useEffect(() => {
    if (targetLessonId === lesson.id) {
      setIsOpen(true);
      setTimeout(() => {
        accordionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [targetLessonId, lesson.id]);

  return (
    <div
      ref={accordionRef}
      className={`bg-white border transition-all duration-500 rounded-2xl mb-4 overflow-hidden shadow-sm hover:shadow-md ${isOpen ? "border-blue-400 ring-4 ring-blue-50" : "border-slate-200"} ${targetLessonId === lesson.id ? "animate-pulse" : ""}`}
    >
      <div
        className="flex items-start gap-4 p-5 cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
          <img
            src={lesson.thumbnail_url}
            alt={lesson.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition-colors">
            {lesson.title}
          </h4>
          <p className="text-slate-500 text-sm leading-relaxed mt-1 line-clamp-1">
            {lesson.description || "No description available for this lesson."}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-bold">
            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">
              <FontAwesomeIcon icon={faVideo} /> Video
            </span>
            <span className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
              <FontAwesomeIcon icon={faClock} /> {lesson.duration}
            </span>
            {lesson.quizStatus && lesson.quizStatus !== "none" && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border bg-amber-50 text-amber-700 border-amber-200">
                <FontAwesomeIcon icon={faTrophy} /> Exercise (Quiz)
              </span>
            )}
            {lessonQna?.length > 0 && (
              <span className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md border border-rose-100">
                <FontAwesomeIcon icon={faReply} /> {lessonQna.length} Q&A
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button className="text-slate-400 p-2.5 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} className="text-lg" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 bg-[#f8fafc] animate-fade-slide-up flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            <div className="p-6 flex flex-col gap-8 bg-white/50">
              <div>
                <h5 className="font-extrabold text-slate-800 mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faEye} className="text-blue-500" /> Video Performance
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-slate-500 text-xs font-bold uppercase mb-1 block">Views</span>
                    <span className="font-black text-xl text-slate-900">{lesson.views || 0}</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-slate-500 text-xs font-bold uppercase mb-1 block">Completion</span>
                    <span className="font-black text-xl text-green-600">{lesson.completion || "0%"}</span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-extrabold text-slate-800 mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
                  <FontAwesomeIcon icon={faTrophy} className="text-amber-500" /> Quiz Results
                </h5>
                {lesson.quizStatus === "published" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-slate-500 text-xs font-bold uppercase mb-1 block">Pass Rate</span>
                      <span className="font-black text-xl text-blue-600">{lesson.quizStats?.passRate || "0%"}</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-slate-500 text-xs font-bold uppercase mb-1 block">Avg. Score</span>
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

            <div className="p-6 bg-[#f8fafc]">
              <h5 className="font-extrabold text-slate-800 mb-5 text-xs uppercase tracking-wider flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faCommentDots} className="text-rose-500" /> Q&A ({lessonQna?.length || 0})
                </span>
              </h5>
              
              {lessonQna && lessonQna.length > 0 ? (
                <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2 pb-2">
                  {lessonQna.map((q) => (
                    <div key={q.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm relative transition-all hover:shadow-md">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                            {q.avatar}
                          </span>
                          {q.student}
                        </p>
                        <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase ${q.status === 'unanswered' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {q.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 mb-4 leading-relaxed font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {q.text}
                      </p>
                      <div>
                        {q.status === "answered" ? (
                          <div className="ml-4 pl-4 border-l-2 border-blue-400 bg-blue-50/50 p-3 rounded-r-xl relative animate-fade-slide-up">
                            <p className="text-[10px] font-black text-slate-800 uppercase mb-1">Instructor Reply</p>
                            <p className="text-sm text-slate-700 font-medium">{q.reply}</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 mt-2 animate-fade-slide-up">
                            <textarea
                              rows="2"
                              placeholder="Write a helpful response..."
                              value={replyInputs[q.id] || ""}
                              onChange={(e) => setReplyInputs({ ...replyInputs, [q.id]: e.target.value })}
                              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all font-medium bg-white"
                            />
                            <button 
                              onClick={() => handleSendReply(q.id)}
                              disabled={!replyInputs[q.id]?.trim()}
                              className="self-end px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-2"
                            >
                              <FontAwesomeIcon icon={faPaperPlane} /> Reply
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] opacity-60">
                  <FontAwesomeIcon icon={faReply} className="text-3xl text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-400">No questions yet</p>
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
  const parts = duration.replace('s', '').replace('m', '').split(':').map(Number);
  if (parts.length === 1) return parts[0]; 
  if (parts.length === 2) return parts[0] * 60 + parts[1];
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
  const [targetLessonId, setTargetLessonId] = useState(null);
  
  const [videoModal, setVideoModal] = useState({ isOpen: false, url: "", title: "" });

  const totalSeconds = lessonsList.reduce((total, lesson) => total + parseDuration(lesson.duration), 0);
  const totalDuration = formatDuration(totalSeconds);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem("access_token");
        const data = await getInstructorCourseDetailAPI(courseId, token);
        
        const courseInfo = data.courseDetail;
        setCourseDetail({
          ...courseInfo,
          price: courseInfo.price || 0,
          image: courseInfo.thumbnail || "",
        });

        // ✅ FIX LỖI ẢNH ĐẠI DIỆN: Ép tất cả dùng courseInfo.thumbnail
        const fetchedLessons = data.lessonsList || [];
        const enhancedLessons = fetchedLessons.map((lesson, index) => {
          let realVideoUrl = "";
          if (lesson.videos && lesson.videos.length > 0) {
            realVideoUrl = lesson.videos[0].video_url;
          }

          return {
            ...lesson,
            videoUrl: realVideoUrl,
            thumbnail_url: courseInfo.thumbnail, // ✅ LUÔN DÙNG ẢNH KHÓA HỌC NHƯ MÁ YÊU CẦU
            views: lesson.views || Math.floor(Math.random() * 50) + 5, 
            completion: lesson.completion || "0%",
            quizStatus: index === 0 ? "published" : "none",
            quizStats: index === 0 ? { passRate: "92%", avgScore: "8.5" } : null,
          };
        });
        
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
    setQnaData(prev => prev.map(q => q.id === questionId ? { ...q, status: "answered", reply: replyText } : q));
    setReplyInputs(prev => ({ ...prev, [questionId]: "" }));
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center text-slate-400"><FontAwesomeIcon icon={faSpinner} spin className="text-4xl" /></div>;
  if (error || !courseDetail) return <div className="p-20 text-center text-red-500 font-bold">{error || "Data not found"}</div>;

  const unansweredCount = qnaData.filter(q => q.status === "unanswered").length;

  return (
    <div className="flex-1 bg-slate-50 w-full animate-fade-slide-up p-4 sm:p-8 relative">
      <section className="bg-gradient-to-r from-[#308dff] via-[#5178af] to-[#5176b0] rounded-3xl p-8 sm:p-12 relative shadow-lg mb-8 text-white">
        <div className="flex flex-col lg:flex-row justify-between gap-10">
          <div className="flex-1">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm font-bold uppercase tracking-wider">
              <FontAwesomeIcon icon={faArrowLeft} /> Back
            </button>
            <div className="mb-4">
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase border border-white/20">{courseDetail.category}</span>
              <span className="ml-3 px-4 py-1.5 bg-emerald-500/20 rounded-full text-xs font-bold uppercase border border-emerald-400/50 text-emerald-200">Published</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">Course Management</h1>
            <h2 className="text-white/90 text-xl font-bold mb-3">{courseDetail.title}</h2>
            <div className="flex gap-8 mt-6">
               <div><p className="text-xs text-white/60 font-bold uppercase">Students</p><p className="font-black text-lg">{courseDetail.students}</p></div>
               <div><p className="text-xs text-white/60 font-bold uppercase">Duration</p><p className="font-black text-lg">{courseDetail.duration}</p></div>
            </div>
          </div>
          <div className="w-full lg:w-[320px] bg-white rounded-2xl p-4 shadow-2xl border border-slate-100 flex flex-col lg:-mb-24 z-10 relative">
            <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 bg-slate-200 shadow-inner">
              <img src={courseDetail.thumbnail} alt="Course cover" className="w-full h-full object-cover" />
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase mb-1">Course Price</p>
            <p className="text-3xl font-black text-emerald-600 mb-5">${Number(courseDetail.price).toFixed(2)}</p>
            <Link to={`/instructor/courses/${courseDetail.id}/edit`} className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl text-center shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faEdit} /> Edit Course
            </Link>
          </div>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-8 mt-10">
        <div className="flex-1">
          <div className="flex gap-3 mb-6 border-b border-slate-200 pb-2 overflow-x-auto">
            {["Curriculum", "Q&A", "Settings"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 text-sm font-bold rounded-full transition-all ${activeTab === tab ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-200/50"}`}>
                {tab} {tab === "Q&A" && unansweredCount > 0 && <span className="ml-1 w-2 h-2 bg-red-500 rounded-full inline-block animate-pulse"></span>}
              </button>
            ))}
          </div>

          {activeTab === "Curriculum" && (
            <div className="animate-fade-slide-up space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center mb-6">
                <div><h2 className="text-2xl font-black text-slate-800">Course Curriculum</h2><p className="text-slate-500 text-sm font-medium">{lessonsList.length} Lessons • Total {totalDuration}</p></div>
              </div>
              {lessonsList.map(lesson => (
                <LessonAccordion 
                  key={lesson.id} lesson={lesson} lessonQna={qnaData.filter(q => q.lessonId === lesson.id)} 
                  replyInputs={replyInputs} setReplyInputs={setReplyInputs} handleSendReply={handleSendReply} targetLessonId={targetLessonId} 
                />
              ))}
            </div>
          )}

          {activeTab === "Q&A" && (
            <div className="animate-fade-slide-up bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
               <h2 className="text-xl font-black text-slate-800">Course Q&A ({qnaData.length})</h2>
               {qnaData.map(q => (
                 <div key={q.id} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl relative transition-all hover:bg-white hover:shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">{q.avatar}</div>
                      <div>
                        <h4 className="font-bold text-slate-900">{q.student}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1">Lesson: 
                          <button onClick={() => setVideoModal({ isOpen: true, url: lessonsList.find(l => l.id === q.lessonId)?.videoUrl, title: q.lesson })} className="text-blue-600 hover:underline font-bold">{q.lesson}</button> • {q.time}
                        </p>
                      </div>
                      <span className={`ml-auto text-[10px] font-black uppercase px-2.5 py-1 rounded-md ${q.status === 'unanswered' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{q.status}</span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed bg-white p-4 rounded-xl border border-slate-100 mb-4">{q.text}</p>
                    {q.status === 'answered' ? (
                      <div className="ml-6 pl-4 border-l-2 border-blue-400 bg-blue-50/50 p-4 rounded-r-2xl"><p className="text-xs font-black text-slate-800 uppercase mb-1">Reply</p><p className="text-sm text-slate-700 font-medium">{q.reply}</p></div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <textarea rows="2" placeholder="Write reply..." value={replyInputs[q.id] || ""} onChange={(e) => setReplyInputs({ ...replyInputs, [q.id]: e.target.value })} className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none font-medium bg-white" />
                        <button onClick={() => handleSendReply(q.id)} disabled={!replyInputs[q.id]?.trim()} className="self-end px-6 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all">Send Reply</button>
                      </div>
                    )}
                 </div>
               ))}
            </div>
          )}
        </div>

        <div className="w-full lg:w-[320px] shrink-0 lg:mt-24">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-6">
            <h4 className="font-extrabold text-slate-800 mb-5 uppercase tracking-wider text-xs">Instructor Profile</h4>
            <div className="flex items-center gap-4 mb-6">
              <img src={courseDetail.avatar} alt="Avatar" className="w-12 h-12 rounded-full border border-slate-200 object-cover" />
              <div><p className="font-bold text-slate-900 text-sm">{courseDetail.instructor}</p><p className="text-slate-400 text-xs font-medium">Senior Instructor</p></div>
            </div>
          </div>
        </div>
      </div>

      {videoModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" onClick={() => setVideoModal({ isOpen: false, url: "", title: "" })}></div>
          <div className="relative bg-black w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-fade-slide-up flex flex-col">
            <div className="flex justify-between px-5 py-4 bg-slate-900 text-white"><h3 className="font-bold text-sm truncate pr-4">{videoModal.title}</h3><button onClick={() => setVideoModal({ isOpen: false, url: "", title: "" })} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-500 flex items-center justify-center transition-colors"><FontAwesomeIcon icon={faTimes} /></button></div>
            <div className="w-full aspect-video bg-black relative"><video src={videoModal.url} controls autoPlay className="absolute inset-0 w-full h-full object-contain" /></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCourseDetailPage;