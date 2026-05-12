import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faChalkboardTeacher,
  faSearch,
  faCommentDots,
  faUserGraduate,
  faReply,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";

// Nhớ import lại hàm postQuestionAPI đã được cập nhật nha má
import { getLessonQuestionsAPI, postQuestionAPI, postReplyAPI } from "../services/learnerCourseAPI"; 

const formatDateTime = (dateStr) => {
  if (!dateStr) return "Just now";
  const date = new Date(dateStr);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// 🚨 Nhận thêm lessonId từ trang cha
const CourseDiscussion = ({ courseId, lessonId }) => {
  const [qnaList, setQnaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newQuestion, setNewQuestion] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // =========================================================================
  // LOAD DỮ LIỆU TỪ API (GET)
  // =========================================================================
  const fetchQnA = useCallback(async () => {
    if (!lessonId) {
      setQnaList([]);
      setLoading(false); 
      return; 
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const data = await getLessonQuestionsAPI(lessonId, token);
      setQnaList(data || []); 
    } catch (error) {
      console.error("Failed to load Q&A:", error);
    } finally {
      setLoading(false); 
    }
  }, [lessonId]);

  useEffect(() => {
    fetchQnA();
  }, [fetchQnA]);

  // =========================================================================
  // XỬ LÝ GỬI CÂU HỎI MỚI (POST)
  // =========================================================================
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    
    if (!lessonId) {
      alert("Lỗi: Không tìm thấy lesson_id. Bạn đang học bài nào vậy?");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      //Truyền đủ courseId, lessonId, nội dung, token
      await postQuestionAPI(courseId, lessonId, newQuestion, token);
      setNewQuestion("");
      fetchQnA(); 
    } catch (error) {
      alert("Failed to post question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // XỬ LÝ REPLY
  // =========================================================================
  const handleSubmitReply = async (questionId) => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      await postReplyAPI(questionId, replyText, token);
      setReplyText("");
      setActiveReplyId(null);
      fetchQnA(); 
    } catch (error) {
      alert("Failed to post reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQnA = qnaList.filter(q => 
    q.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-slate-500">
        <FontAwesomeIcon icon={faSpinner} spin className="text-2xl mr-2" /> Loading discussion...
      </div>
    );
  }

  return (
    <div className="animate-fade-slide-up h-full flex flex-col">
      {/* ... (Toàn bộ phần giao diện UI bên dưới giữ y chang đoạn code cũ của má) ... */}
      
      {/* HEADER & SEARCH */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <FontAwesomeIcon icon={faCommentDots} className="text-blue-600" />
          Course Q&A
        </h3>
        
        <div className="relative w-full sm:w-64">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search all questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* FORM ĐẶT CÂU HỎI CHÍNH */}
      <div className="mb-8 bg-white p-5 rounded-2xl border border-blue-100 shadow-sm shadow-blue-50/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
        <form onSubmit={handleAskQuestion}>
          <label className="block text-sm font-bold text-slate-800 mb-2">
            Ask a new question
          </label>
          <div className="flex flex-col gap-3">
            <textarea
              rows="3"
              placeholder="What do you want to know about this lesson?"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-y"
            ></textarea>
            <div className="flex justify-between items-center">
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Try searching before you ask. Someone might have already answered it!
              </p>
              <button
                type="submit"
                disabled={!newQuestion.trim() || isSubmitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md active:scale-95 text-sm flex items-center gap-2 ml-auto"
              >
                {isSubmitting ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPaperPlane} />} 
                {isSubmitting ? "Posting..." : "Ask Question"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* DANH SÁCH CÂU HỎI VÀ LUỒNG THẢO LUẬN */}
      <div className="space-y-5 pb-8">
        {filteredQnA.length > 0 ? (
          filteredQnA.map((q) => (
            <div key={q.id} className="p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
              {/* CÂU HỎI GỐC */}
              <div className="flex items-center gap-3 mb-3">
                {q.user?.avatar && !q.user.avatar.includes("null") ? (
                  <img src={q.user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-xs font-bold">
                    {q.user?.name ? q.user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}

                <div>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    {q.user?.name || "Anonymous Learner"}
                    {q.user?.role === "instructor" && (
                      <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded uppercase font-black">Instructor</span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">{formatDateTime(q.created_at)}</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 mb-4 leading-relaxed font-medium">
                {q.content}
              </p>

              {/* LUỒNG REPLIES (Trả lời) */}
              {q.replies && q.replies.length > 0 ? (
                <div className="mt-4 ml-4 sm:ml-6 pl-4 border-l-2 border-slate-200 space-y-4">
                  {q.replies.map(reply => (
                    <div key={reply.id} className={`p-4 rounded-2xl ${reply.user?.role === 'instructor' ? 'bg-blue-50/70 border border-blue-100' : 'bg-slate-50 border border-slate-100'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {reply.user?.role === 'instructor' ? (
                          <FontAwesomeIcon icon={faChalkboardTeacher} className="text-blue-600 text-sm" />
                        ) : (
                          <FontAwesomeIcon icon={faUserGraduate} className="text-emerald-600 text-sm" />
                        )}
                        <p className={`text-xs font-black tracking-wider ${reply.user?.role === 'instructor' ? 'text-blue-800' : 'text-emerald-800'}`}>
                          {reply.user?.name || "Anonymous"} {reply.user?.role === 'instructor' && "(Instructor)"}
                        </p>
                        <span className="text-[10px] text-slate-400 ml-auto font-medium">{formatDateTime(reply.created_at)}</span>
                      </div>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">
                        {reply.content}
                      </p>
                    </div>
                  ))}

                  {/* KHUNG GÕ FOLLOW-UP DÀNH CHO HỌC VIÊN */}
                  {activeReplyId === q.id ? (
                    <div className="mt-3 animate-fade-slide-up bg-white p-3 rounded-xl border border-blue-200 shadow-sm">
                      <textarea
                        autoFocus
                        rows="2"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 transition-colors resize-y mb-2"
                      />
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setActiveReplyId(null); setReplyText(""); }}
                          className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleSubmitReply(q.id)}
                          disabled={!replyText.trim() || isSubmitting}
                          className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1"
                        >
                          {isSubmitting ? <FontAwesomeIcon icon={faSpinner} spin /> : "Reply"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setActiveReplyId(q.id)}
                      className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 mt-2 transition-colors"
                    >
                      <FontAwesomeIcon icon={faReply} /> Reply to thread
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-4 ml-4 sm:ml-6 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <FontAwesomeIcon icon={faChalkboardTeacher} className="text-sm" />
                    <p className="text-xs font-medium italic">Waiting for instructor's reply...</p>
                  </div>
                  {activeReplyId === q.id ? (
                    <div className="mt-2 animate-fade-slide-up bg-white p-3 rounded-xl border border-blue-200 shadow-sm">
                      <textarea
                        autoFocus
                        rows="2"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 transition-colors resize-y mb-2"
                      />
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setActiveReplyId(null); setReplyText(""); }}
                          className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleSubmitReply(q.id)}
                          disabled={!replyText.trim() || isSubmitting}
                          className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                        >
                          {isSubmitting ? <FontAwesomeIcon icon={faSpinner} spin /> : "Reply"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setActiveReplyId(q.id)}
                      className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 mt-1 transition-colors w-fit"
                    >
                      <FontAwesomeIcon icon={faReply} /> Add more details (Reply)
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <FontAwesomeIcon icon={faSearch} className="text-3xl text-slate-300 mb-3" />
            <p className="text-slate-500 font-bold text-sm">No questions found.</p>
            <p className="text-slate-400 text-xs mt-1">Be the first to ask a question!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDiscussion;