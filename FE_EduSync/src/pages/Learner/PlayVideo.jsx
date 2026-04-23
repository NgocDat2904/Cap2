import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlayCircle,
  faBrain,
  faCircleQuestion,
  faCheckCircle,
  faLock,
  faClockRotateLeft,
  faPlay,
  faCrown,
  faUnlock,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { getCourseDetailAPI } from "../../services/learnerCourseAPI";

import CourseMindmap from "../../components/CourseMindmap";
import CourseSummary from "../../components/CourseSummary";
import CourseQuiz from "../../components/CourseQuiz";
import CourseChatbot from "../../components/CourseChatbot";
import CourseDiscussion from "../../components/CourseDiscussion";

const CourseLearningWorkspace = () => {
  const { courseId, lessonId } = useParams();

  const [activeLeftTab, setActiveLeftTab] = useState("summary");
  const [activeRightTab, setActiveRightTab] = useState("videos");
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [likedVideos, setLikedVideos] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [courseDetail, setCourseDetail] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [courseError, setCourseError] = useState("");
  const [activeLesson, setActiveLesson] = useState(null);
  const playerRef = React.useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadCourseDetail = async () => {
      if (!courseId) {
        setCourseError("Thiếu courseId.");
        setLoadingCourse(false);
        return;
      }
      setLoadingCourse(true);
      setCourseError("");
      try {
        const data = await getCourseDetailAPI(courseId);
        if (!cancelled) setCourseDetail(data);
      } catch (error) {
        if (!cancelled) setCourseError(error.message || "Không tải được dữ liệu khóa học");
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
    const sections = courseDetail?.sections || [];
    return sections.flatMap((section) =>
      (section.lessons || []).map((lesson) => ({
        id: lesson.id,
        title: lesson.title || "Untitled lesson",
        duration: lesson.duration || "00:00",
        description: lesson.description || "",
        transcript: lesson.transcript || "",
        image: lesson.image || courseDetail?.thumbnail || "",
        videoUrl: lesson.play_url || lesson.url || "",
        completed: false,
        locked: false,
        timeline: [],
        views: lesson.views || 0,
      })),
    );
  }, [courseDetail]);

  useEffect(() => {
    if (playlist.length === 0) {
      setActiveLesson(null);
      return;
    }
    const matched = playlist.find((lesson) => String(lesson.id) === String(lessonId));
    setActiveLesson(matched || playlist[0]);
  }, [playlist, lessonId]);

  const lessonContext = useMemo(
    () => ({
      title: activeLesson?.title || "",
      description: activeLesson?.description || "",
      transcript: activeLesson?.transcript || undefined,
    }),
    [
      activeLesson?.title,
      activeLesson?.description,
      activeLesson?.transcript,
    ],
  );
  const activeVideoId = activeLesson?._id || activeLesson?.id;

  const handleSelectLesson = (lesson) => {
    if (lesson.locked && !isPremiumUser) {
      alert("Bạn cần thanh toán khóa học để xem video này nhé!");
      return;
    }
    setActiveLesson(lesson);
    setActiveRightTab("timeline");
    setIsPlaying(true);
  };

  const instructorInfo = {
    name: courseDetail?.instructor?.name || "Giảng viên EduSync",
    followers: "Giảng viên trên EduSync",
    avatar: courseDetail?.instructor?.avatar || "https://i.pravatar.cc/150?img=11",
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
    return <div className="w-full py-24 text-center text-red-600">{courseError}</div>;
  }

  if (!activeLesson) {
    return (
      <div className="w-full py-24 text-center text-slate-500">
        Khóa học chưa có bài giảng để phát.
      </div>
    );
  }

  const handleToggleLike = (e, lessonId) => {
    e.stopPropagation();
    setLikedVideos((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId],
    );
  };

  const handleSeekVideo = (seconds) => {
    if (playerRef.current) {
      playerRef.current.currentTime = seconds;
      setIsPlaying(true);
    }
  };

  const renderPaywall = (featureName) => (
    <div className="flex flex-col items-center justify-center h-[350px] bg-slate-50 border border-slate-200 rounded-xl text-center p-6 relative overflow-hidden animate-fade-slide-up">
      <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
        <FontAwesomeIcon icon={faLock} className="text-2xl" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">
        Tính năng Premium
      </h3>
      <p className="text-sm text-slate-600 mb-6 max-w-md">
        Nâng cấp khóa học để mở khóa <strong>{featureName}</strong> và toàn bộ
        video bị khóa nhé!
      </p>
      <button
        onClick={() => setIsPremiumUser(true)}
        className="px-6 py-3 bg-[#2da44e] text-white font-bold rounded-xl shadow-md hover:bg-[#268c41] transition-colors hover:scale-105 active:scale-95 duration-200"
      >
        <FontAwesomeIcon icon={faCrown} className="mr-2 text-yellow-300" />{" "}
        Thanh toán $10 để mở khóa
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 animate-fade-slide-up pb-20">
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsPremiumUser(!isPremiumUser)}
          className="text-xs font-bold text-slate-500 border px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 shadow-sm flex items-center gap-2"
        >
          <FontAwesomeIcon
            icon={isPremiumUser ? faUnlock : faLock}
            className={isPremiumUser ? "text-green-500" : "text-amber-500"}
          />
          [Nút Test] Đổi quyền:{" "}
          {isPremiumUser ? "Đã thanh toán (Mở full)" : "Dùng thử (Bị khóa)"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        <div className="w-full lg:flex-1 flex flex-col min-w-0">
          <div className="w-full bg-black aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-800 relative">
            {activeLesson.videoUrl ? (
              <video
                ref={playerRef}
                src={activeLesson.videoUrl}
                controls
                className="absolute inset-0 w-full h-full object-contain bg-black"
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 text-sm bg-gradient-to-br from-slate-900 to-slate-800 gap-4">
                <FontAwesomeIcon icon={faPlayCircle} className="text-5xl opacity-30" />
                <p>Bài giảng này chưa có URL phát video hợp lệ.</p>
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
                  Follow
                </button>
              </div>
            </div>
          </div>

          <div className="w-full mt-2">
            <div className="flex items-center border-b border-slate-200 overflow-x-auto custom-scrollbar">
              {["Summary", "Mindmap", "Quiz", "Chatbot", "Discussion"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveLeftTab(tab.toLowerCase())}
                    className={`px-6 py-3.5 text-sm font-bold capitalize transition-all border-b-2 whitespace-nowrap ${activeLeftTab === tab.toLowerCase() ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                  >
                    {tab === "Mindmap" || tab === "Quiz" ? (
                      <span className="flex items-center gap-1.5">
                        {tab}{" "}
                        {!isPremiumUser && (
                          <FontAwesomeIcon
                            icon={faLock}
                            className="text-[10px] text-amber-500 mb-1"
                          />
                        )}
                      </span>
                    ) : (
                      tab
                    )}
                  </button>
                ),
              )}
            </div>

            <div className="bg-white border border-t-0 border-slate-200 rounded-b-2xl p-6 sm:p-8 min-h-[400px] shadow-sm">
              {activeLeftTab === "summary" && (
                <CourseSummary lessonContext={lessonContext} videoId={activeVideoId} />
              )}
              {activeLeftTab === "mindmap" &&
                (!isPremiumUser ? (
                  renderPaywall("Sơ đồ tư duy AI")
                ) : (
                  <CourseMindmap
                    lessonContext={lessonContext}
                    videoId={activeVideoId}
                  />
                ))}
              {activeLeftTab === "quiz" &&
                (!isPremiumUser ? (
                  renderPaywall("Bài tập trắc nghiệm AI")
                ) : (
                  <CourseQuiz
                    lessonContext={lessonContext}
                    videoId={activeVideoId}
                    onSwitchToDiscussion={() => setActiveLeftTab("discussion")}
                  />
                ))}
              {activeLeftTab === "chatbot" && (
                <CourseChatbot lessonContext={lessonContext} videoId={activeVideoId} />
              )}
              {(activeLeftTab === "discussion" ||
                activeLeftTab === "review") && <CourseDiscussion />}
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
                Videos
              </button>
            </div>

            {activeRightTab === "timeline" && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-white animate-fade-slide-up">
                <h4 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faClockRotateLeft}
                    className="text-blue-600"
                  />{" "}
                  Key Moments
                </h4>
                {activeLesson.timeline && activeLesson.timeline.length > 0 ? (
                  <div className="relative border-l-2 border-slate-100 ml-3 space-y-6 mt-6">
                    {activeLesson.timeline.map((point, index) => (
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
                  <p className="text-sm text-slate-500 text-center mt-10 italic">
                    Chưa có dữ liệu timeline.
                  </p>
                )}
              </div>
            )}

            {activeRightTab === "videos" && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-white animate-fade-slide-up">
                {playlist.map((lesson) => {
                  const isCurrent = activeLesson.id === lesson.id;
                  const isActuallyLocked = lesson.locked && !isPremiumUser;
                  const isLiked = likedVideos.includes(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      className="relative flex items-center group"
                    >
                      <button
                        onClick={() => handleSelectLesson(lesson)}
                        className={`w-full flex items-center gap-3.5 p-3 rounded-xl transition-all text-left group-hover:bg-slate-50 border ${isCurrent ? "bg-blue-50/50 border-blue-200 shadow-sm" : isActuallyLocked ? "opacity-60 cursor-not-allowed border-transparent" : "border-transparent cursor-pointer"}`}
                      >
                        <div className="flex-shrink-0 w-5 flex justify-center">
                          {isActuallyLocked ? (
                            <FontAwesomeIcon
                              icon={faLock}
                              className="text-slate-400 text-sm"
                            />
                          ) : lesson.completed ? (
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
                            ({lesson.duration})
                          </span>
                        </div>
                      </button>
                      <div
                        onClick={(e) => handleToggleLike(e, lesson.id)}
                        className="absolute right-3 p-2 rounded-full hover:bg-slate-200 transition-colors cursor-pointer z-10"
                        title={isLiked ? "Bỏ yêu thích" : "Yêu thích"}
                      >
                        <FontAwesomeIcon
                          icon={faHeart}
                          className={`text-[15px] transition-all duration-300 ${isLiked ? "text-red-500 scale-110 drop-shadow-sm" : "text-slate-300 hover:text-red-400"}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {!isPremiumUser && (
            <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-5 shadow-sm animate-fade-slide-up">
              <p className="text-sm text-slate-700 font-medium leading-relaxed mb-5">
                Thanh toán khóa học ngay để có thể xem nhiều video và sử dụng
                được các tính năng như gen ra mindmap và các câu hỏi trắc nghiệm
                từ bài giảng nhé!
              </p>
              <div className="space-y-3 mb-6">
                <div className="w-full bg-white border border-blue-200 text-blue-800 font-bold text-sm py-2 px-4 rounded-lg flex items-center gap-2 shadow-sm">
                  <FontAwesomeIcon icon={faBrain} className="text-blue-500" />{" "}
                  Sơ đồ tư duy AI
                </div>
                <div className="w-full bg-white border border-blue-200 text-blue-800 font-bold text-sm py-2 px-4 rounded-lg flex items-center gap-2 shadow-sm">
                  <FontAwesomeIcon
                    icon={faCircleQuestion}
                    className="text-blue-500"
                  />{" "}
                  Bài tập Trắc nghiệm (Quiz)
                </div>
              </div>
              <button
                onClick={() => setIsPremiumUser(true)}
                className="w-full bg-[#2da44e] hover:bg-[#268c41] text-white font-bold py-3.5 rounded-xl shadow-md transition-all active:scale-95 flex justify-center items-center text-[15px]"
              >
                <FontAwesomeIcon
                  icon={faCrown}
                  className="mr-2 text-yellow-300"
                />{" "}
                Thanh toán ngay $10
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default CourseLearningWorkspace;
