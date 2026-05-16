import React, { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlayCircle,
  faCheckCircle,
  faClockRotateLeft,
  faPlay,
  faHeart,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { getCourseDetailAPI, getCourseProgressAPI, completeLessonAPI } from "../../services/learnerCourseAPI";

import CourseMindmap from "../../components/CourseMindmap";
import CourseSummary from "../../components/CourseSummary";
import CourseQuiz from "../../components/CourseQuiz";
import CourseChatbot from "../../components/CourseChatbot";
import CourseDiscussion from "../../components/CourseDiscussion";
import { aiTimelineAPI, aiTimelineByVideoAPI, getTimelineByVideoAPI } from "../../services/aiAPI";
import { trackViewAPI } from "../../services/courseAPI";

const CourseLearningWorkspace = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [activeLeftTab, setActiveLeftTab] = useState("summary");
  const [activeRightTab, setActiveRightTab] = useState("videos");
  const [likedVideos, setLikedVideos] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [courseDetail, setCourseDetail] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [courseError, setCourseError] = useState("");
  const [activeLesson, setActiveLesson] = useState(null);
  const [videoDuration, setVideoDuration] = useState("00:00");
  const playerRef = React.useRef(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);

  const [aiTimeline, setAiTimeline] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [timelineError, setTimelineError] = useState("");
  const videoRef = useRef(null);
  const countedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const loadCourseDetail = async () => {
      if (!courseId) {
        setCourseError("Không tìm thấy khóa học.");
        setLoadingCourse(false);
        return;
      }
      setLoadingCourse(true);
      setCourseError("");
      try {
        const data = await getCourseDetailAPI(courseId);
        if (!cancelled) setCourseDetail(data);

        // Load learning progress (completed lessons)
        try {
          const progressData = await getCourseProgressAPI(courseId);
          if (!cancelled) {
            setCompletedLessonIds(progressData.completed_lesson_ids || []);
          }
        } catch (err) {
          console.warn("Failed to load progress:", err);
          // Không báo lỗi cho user, chỉ log
        }
      } catch (error) {
        if (!cancelled)
          setCourseError(error.message || "Không thể tải dữ liệu khóa học");
      } finally {
        if (!cancelled) setLoadingCourse(false);
      }
    };

    loadCourseDetail();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const playlist = useMemo(() => {
    const lessons = courseDetail?.lessons || [];

    return lessons.map((lesson) => ({
      id: lesson.id,

      videoId:
        lesson.video_id ||
        lesson.videoId ||
        lesson.videos?.[0]?.id ||
        "",
      title: lesson.title || "Untitled lesson",
      duration: lesson.duration || "00:00",
      description: lesson.description || "",
      transcript: lesson.transcript ||
      lesson.videos?.[0]?.transcript ||
      "",
      image: lesson.image || courseDetail?.thumbnail || "",

      // Lấy link video
      videoUrl:
        lesson.videoUrl ||
        lesson.video_url ||
        lesson.play_url ||
        (lesson.videos && lesson.videos[0]?.video_url) ||
        "",

      // Kiểm tra lesson đã hoàn thành chưa dựa trên completedLessonIds
      completed: completedLessonIds.includes(String(lesson.id)),
      timeline: [],
      views: lesson.views || 0,
    }));
  }, [courseDetail, completedLessonIds]);

  useEffect(() => {
    if (playlist.length === 0) {
      setActiveLesson(null);
      return;
    }
    const matched = playlist.find(
      (lesson) => String(lesson.id) === String(lessonId),
    );
    const nextLesson = matched || playlist[0];

    setActiveLesson(nextLesson);
  }, [playlist, lessonId]);

  const lessonContext = useMemo(
    () => {
      // console.log("ACTIVE LESSON:", activeLesson);
    const context = {
      title: activeLesson?.title || "",
      description: activeLesson?.description || "",
      transcript: activeLesson?.transcript || "",
      duration: activeLesson?.duration || "0",
    };
    
    // console.log("LESSON CONTEXT:", context);
    // console.log("TRANSCRIPT", context.transcript);

    return context;
  },[
      activeLesson?.title,
      activeLesson?.description,
      activeLesson?.transcript,
      activeLesson?.duration,
    ]);
  const activeVideoId = activeLesson?.video_id || activeLesson?.videoId;

  useEffect(() => {
    if (!activeLesson) return;
    let cancelled = false;
    const run = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      setLoadingTimeline(true);
      setTimelineError("");
      setAiTimeline([]);

      try {
        let data;
        if (activeVideoId) {
          // Ưu tiên GET (nhanh, có cache)
          try {
            data = await getTimelineByVideoAPI(token, activeVideoId, "vi");
          } catch {
            // fallback sang POST nếu GET lỗi
            data = await aiTimelineByVideoAPI(token, activeVideoId, "vi");
          }
        } else {
          data = await aiTimelineAPI(token, lessonContext, "vi");
        }

        if (!cancelled) setAiTimeline(data.timeline || []);
      } catch (err) {
        if (!cancelled)
          setTimelineError(err.message || "Failed to load timeline from AI");
      } finally {
        if (!cancelled) setLoadingTimeline(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [activeVideoId, lessonContext?.transcript]);

  const handleProgress = async () => {
    if (!videoRef.current) return;

    const current = videoRef.current.currentTime;

    // xem 10s => +1 view

    if (current >= 10 && !countedRef.current) {
      countedRef.current = true;

      try {
        await trackViewAPI(activeVideoId, current, false);
        setCourseDetail((prev) => ({
          ...prev,
          lessons: prev.lessons.map((lesson) => {
            if (lesson.video_id === activeVideoId) {
              return {
                ...lesson,
                views: (lesson.views || 0) + 1,
              };
            }
            return lesson;
          }),
        }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEnded = async () => {
    try {
      await trackViewAPI(activeVideoId, videoRef.current.duration, true);
      console.log("✅ Full video counted");

      // Đánh dấu lesson hiện tại đã hoàn thành
      if (activeLesson?.id && courseId) {
        try {
          await completeLessonAPI(courseId, activeLesson.id);
          console.log("✅ Lesson marked as completed");

          // Cập nhật local state ngay lập tức
          setCompletedLessonIds((prev) => {
            const lessonIdStr = String(activeLesson.id);
            if (!prev.includes(lessonIdStr)) {
              return [...prev, lessonIdStr];
            }
            return prev;
          });
        } catch (err) {
          console.error("Failed to mark lesson completed:", err);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectLesson = (lesson) => {
    countedRef.current = false;
    setActiveLesson(lesson);
    setActiveRightTab("timeline");
    setIsPlaying(true);
  };

  const instructorInfo = {
    name: courseDetail?.instructor?.name || "Giảng viên EduSync",
    followers: "Giảng viên trên EduSync",
    avatar:
      courseDetail?.instructor?.avatar || "https://i.pravatar.cc/150?img=11",
  };

  if (loadingCourse) {
    return (
      <div className="w-full py-24 text-center text-slate-500">
        <FontAwesomeIcon icon={faClockRotateLeft} className="mr-2" />
        Đang tải nội dung khóa học...
      </div>
    );
  }

  if (courseError) {
    return (
      <div className="w-full py-24 text-center text-red-600">{courseError}</div>
    );
  }

  if (!activeLesson) {
    return (
      <div className="w-full py-24 text-center text-slate-500">
        Khóa học này chưa có bài giảng.
      </div>
    );
  }

  const handleSeekVideo = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(err => console.log("Play interrupted:", err));
      setIsPlaying(true);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 animate-fade-slide-up pb-20">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        <div className="w-full lg:flex-1 flex flex-col min-w-0">
          {/* Nút quay lại trang chi tiết khóa học */}
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors mb-4 text-sm font-bold group w-fit"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại trang khóa học</span>
          </button>

          <div className="w-full bg-black aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-800 relative">
            {activeLesson.videoUrl ? (
              <video
                ref={videoRef}
                src={activeLesson.videoUrl}
                controls
                className="absolute inset-0 w-full h-full object-contain bg-black"
                playsInline
                crossOrigin="anonymous"
                onTimeUpdate={handleProgress}
                onEnded={handleEnded}
                onLoadedMetadata={(e) => {
                  const seconds = Math.floor(e.target.duration);

                  const h = Math.floor(seconds / 3600);
                  const m = Math.floor((seconds % 3600) / 60);
                  const s = seconds % 60;

                  const formatted =
                    h > 0
                      ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
                      : `${m}:${s.toString().padStart(2, "0")}`;

                  setVideoDuration(formatted);
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 text-sm bg-gradient-to-br from-slate-900 to-slate-800 gap-4">
                <FontAwesomeIcon
                  icon={faPlayCircle}
                  className="text-5xl opacity-30"
                />
                <p>Bài giảng này chưa có video.</p>
              </div>
            )}
          </div>

          <div className="mt-6 mb-8 px-1">
            <h1 className="text-2xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug mb-3">
              {activeLesson.title}
            </h1>
            <p className="text-slate-600 text-base leading-relaxed mb-6">
              {activeLesson.description}
            </p>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <img
                  src={instructorInfo.avatar}
                  alt="Instructor"
                  className="w-12 h-12 rounded-full border border-slate-200 object-cover shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {instructorInfo.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {instructorInfo.followers}
                  </p>
                </div>
                <button className="ml-4 px-4 py-1.5 border-[1.5px] border-slate-800 text-slate-800 font-bold text-xs rounded-full hover:bg-slate-800 hover:text-white transition-all active:scale-95">
                  Theo dõi
                </button>
              </div>
            </div>
          </div>

          <div className="w-full mt-2">
            <div className="flex items-center border-b border-slate-200 overflow-x-auto custom-scrollbar">
              {[
                { id: "summary", label: "Tóm tắt" },
                { id: "mindmap", label: "Mindmap" },
                { id: "quiz", label: "Quiz" },
                { id: "chatbot", label: "Chatbot" },
                { id: "q&a", label: "Hỏi đáp" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveLeftTab(tab.id)}
                  className={`px-6 py-3.5 text-sm font-bold capitalize transition-all border-b-2 whitespace-nowrap ${activeLeftTab === tab.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white border border-t-0 border-slate-200 rounded-b-2xl p-6 sm:p-8 min-h-[400px] shadow-sm">
              {/* Summary & Mindmap: dùng display để giữ mounted, tránh call lại API */}
              <div style={{ display: activeLeftTab === "summary" ? "block" : "none" }}>
                <CourseSummary
                  lessonContext={lessonContext}
                  videoId={activeVideoId}
                />
              </div>
              <div style={{ display: activeLeftTab === "mindmap" ? "block" : "none" }}>
                <CourseMindmap
                  lessonContext={lessonContext}
                  videoId={activeVideoId}
                  isActive={activeLeftTab === "mindmap"}
                />
              </div>

              {/* Quiz, Chatbot, Q&A: conditional render (cần fresh state mỗi lần mở) */}
              {activeLeftTab === "quiz" && (
                <CourseQuiz
                  lessonContext={lessonContext}
                  videoId={activeVideoId}
                  onSwitchToDiscussion={() => setActiveLeftTab("q&a")}
                />
              )}
              {activeLeftTab === "chatbot" && (
                <CourseChatbot
                  lessonContext={lessonContext}
                  videoId={activeVideoId}
                />
              )}

              {/* Q&A Tab — truyền courseId và lessonId để component gửi câu hỏi đúng */}
              {activeLeftTab === "q&a" && (
                <CourseDiscussion
                  courseId={courseId}
                  lessonId={activeLesson?.id}
                />
              )}
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-[400px] xl:w-[420px] shrink-0 flex flex-col gap-6 lg:sticky lg:top-8">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[550px]">
            <div className="flex items-center border-b border-slate-200 bg-white pt-2">
              <button
                onClick={() => setActiveRightTab("timeline")}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeRightTab === "timeline" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                Timeline
              </button>
              <button
                onClick={() => setActiveRightTab("videos")}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeRightTab === "videos" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                Video
              </button>
            </div>

            {activeRightTab === "timeline" && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-white animate-fade-slide-up">
                <h4 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faClockRotateLeft}
                    className="text-blue-600"
                  />{" "}
                  Các mốc quan trọng
                </h4>
                {loadingTimeline && (
                  <p className="text-sm text-slate-500 italic text-center mt-6">
                    Đang tạo các mốc quan trọng...
                  </p>
                )}
                {timelineError && (
                  <p className="text-sm text-red-600 text-center mt-6 bg-red-50 p-2 rounded-lg">
                    {timelineError}
                  </p>
                )}
                {!loadingTimeline &&
                  !timelineError &&
                  aiTimeline &&
                  aiTimeline.length > 0 ? (
                  <div className="relative border-l-2 border-slate-100 ml-3 space-y-6 mt-6">
                    {aiTimeline.map((point, index) => (
                      <div
                        key={index}
                        className="relative pl-6 cursor-pointer group"
                        onClick={() => handleSeekVideo(point.seconds)}
                      >
                        <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-slate-300 rounded-full border-2 border-white group-hover:bg-blue-600 group-hover:scale-125 transition-all"></div>
                        <div className="group-hover:translate-x-1 transition-transform">
                          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-xs rounded mb-1 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {point.time}
                          </span>
                          <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                            {point.label}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !loadingTimeline &&
                  !timelineError && (
                    <p className="text-sm text-slate-500 text-center mt-10 italic">
                      Chưa có dữ liệu mốc thời gian cho video này.
                    </p>
                  )
                )}
              </div>
            )}

            {activeRightTab === "videos" && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-white animate-fade-slide-up">
                {playlist.map((lesson) => {
                  const isCurrent = activeLesson.id === lesson.id;
                  const isLiked = likedVideos.includes(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      className="relative flex items-center group"
                    >
                      <button
                        onClick={() => handleSelectLesson(lesson)}
                        className={`w-full flex items-center gap-3.5 p-3 rounded-xl transition-all text-left group-hover:bg-slate-50 border cursor-pointer ${isCurrent ? "bg-blue-50/50 border-blue-200 shadow-sm" : "border-transparent"}`}
                      >
                        <div className="flex-shrink-0 w-5 flex justify-center">
                          {lesson.completed ? (
                            <FontAwesomeIcon
                              icon={faCheckCircle}
                              className="text-green-500 text-[16px]"
                            />
                          ) : isCurrent ? (
                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shadow-sm">
                              <FontAwesomeIcon
                                icon={faPlay}
                                className="text-blue-600 text-[9px] ml-[1px]"
                              />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-blue-400 transition-colors"></div>
                          )}
                        </div>
                        <div className="relative w-24 shrink-0 aspect-video rounded-lg overflow-hidden bg-slate-200 shadow-sm border border-slate-200/60">
                          <img
                            src={lesson.image}
                            alt={lesson.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center pr-8">
                          <h5
                            className={`text-[13px] leading-snug line-clamp-2 ${isCurrent ? "font-bold text-blue-800" : "font-semibold text-slate-700 group-hover:text-blue-600"}`}
                          >
                            {lesson.title}
                          </h5>
                          <span className="text-[11px] font-medium text-slate-500 mt-1">
                            (
                            {lesson.id === activeLesson?.id
                              ? videoDuration
                              : lesson.duration}
                            )
                          </span>
                        </div>
                      </button>
                      {/* <div
                        onClick={(e) => handleToggleLike(e, lesson.id)}
                        className="absolute right-3 p-2 rounded-full hover:bg-slate-200 transition-colors cursor-pointer z-10"
                        title={isLiked ? "Bỏ yêu thích" : "Yêu thích"}
                      >
                        <FontAwesomeIcon
                          icon={faHeart}
                          className={`text-[15px] transition-all duration-300 ${isLiked ? "text-red-500 scale-110 drop-shadow-sm" : "text-slate-300 hover:text-red-400"}`}
                        />
                      </div> */}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CourseLearningWorkspace;