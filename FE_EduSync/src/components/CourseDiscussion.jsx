import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faChalkboardTeacher,
  faSearch,
  faCommentDots,
  faUserGraduate,
  faReply
} from "@fortawesome/free-solid-svg-icons";

// =========================================================================
// MOCK DATA: Giả lập dữ liệu có THREAD (Luồng chat nhiều tầng)
// =========================================================================
const INITIAL_QNA = [
  {
    id: "q1",
    studentName: "Hương Lan",
    avatarInitials: "HL",
    timeAgo: "1 day ago",
    question: "Why do we need to use className instead of class in JSX?",
    isMine: true, // Giả sử mình đang đăng nhập là Hương Lan
    isAnswered: true,
    replies: [
      {
        id: "r1",
        author: "Instructor",
        name: "Mr. Sgh",
        timeAgo: "20 hours ago",
        text: "Great question! Because 'class' is a reserved keyword in standard JavaScript. Since JSX is compiled into plain JS, the React team chose 'className' to avoid conflicts.",
      },
      {
        id: "r2",
        author: "Student",
        name: "Hương Lan",
        timeAgo: "15 hours ago",
        text: "Ah, that makes perfect sense! Thank you teacher.",
      }
    ]
  },
  {
    id: "q2",
    studentName: "Việt Anh",
    avatarInitials: "VA",
    timeAgo: "2 days ago",
    question: "Can I use inline styles in JSX?",
    isMine: false,
    isAnswered: true,
    replies: [
      {
        id: "r3",
        author: "Instructor",
        name: "Mr. Sgh",
        timeAgo: "1 day ago",
        text: "Yes, you can! But remember to pass it as an object using camelCase properties, like this: style={{ backgroundColor: 'red' }}.",
      }
    ]
  },
  {
    id: "q3",
    studentName: "Hoàng Nguyễn",
    avatarInitials: "HN",
    timeAgo: "3 days ago",
    question: "Is React better than Vue?",
    isMine: false,
    isAnswered: false,
    replies: []
  }
];

const CourseDiscussion = () => {
  const [qnaList, setQnaList] = useState(INITIAL_QNA);
  const [newQuestion, setNewQuestion] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // State quản lý việc học viên đang gõ câu trả lời nối tiếp
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // =========================================================================
  // XỬ LÝ GỬI CÂU HỎI MỚI
  // =========================================================================
  const handleAskQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const newQ = {
      id: `q_new_${Date.now()}`,
      studentName: "Hương Lan", // Tên mock hiện tại
      avatarInitials: "HL",
      timeAgo: "Just now",
      question: newQuestion,
      isMine: true,
      isAnswered: false,
      replies: []
    };

    setQnaList([newQ, ...qnaList]);
    setNewQuestion("");
  };

  // =========================================================================
  // XỬ LÝ HỌC VIÊN REPLY LẠI GIẢNG VIÊN
  // =========================================================================
  const handleSubmitReply = (questionId) => {
    if (!replyText.trim()) return;

    const newReply = {
      id: `r_new_${Date.now()}`,
      author: "Student",
      name: "Hương Lan",
      timeAgo: "Just now",
      text: replyText,
    };

    setQnaList(prevList => 
      prevList.map(q => {
        if (q.id === questionId) {
          return { ...q, replies: [...q.replies, newReply] };
        }
        return q;
      })
    );

    setReplyText("");
    setActiveReplyId(null);
  };

  const filteredQnA = qnaList.filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-slide-up h-full flex flex-col">
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
                disabled={!newQuestion.trim()}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md active:scale-95 text-sm flex items-center gap-2 ml-auto"
              >
                <FontAwesomeIcon icon={faPaperPlane} /> Ask Question
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
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${q.isMine ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                  {q.avatarInitials}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    {q.studentName}
                    {q.isMine && <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded uppercase">You</span>}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">{q.timeAgo}</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 mb-4 leading-relaxed font-medium">
                {q.question}
              </p>

              {/* LUỒNG REPLIES */}
              {q.replies.length > 0 ? (
                <div className="mt-4 ml-4 sm:ml-6 pl-4 border-l-2 border-slate-200 space-y-4">
                  {q.replies.map(reply => (
                    <div key={reply.id} className={`p-4 rounded-2xl ${reply.author === 'Instructor' ? 'bg-blue-50/70 border border-blue-100' : 'bg-slate-50 border border-slate-100'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {reply.author === 'Instructor' ? (
                          <FontAwesomeIcon icon={faChalkboardTeacher} className="text-blue-600 text-sm" />
                        ) : (
                          <FontAwesomeIcon icon={faUserGraduate} className="text-emerald-600 text-sm" />
                        )}
                        <p className={`text-xs font-black uppercase tracking-wider ${reply.author === 'Instructor' ? 'text-blue-800' : 'text-emerald-800'}`}>
                          {reply.name} {reply.author === 'Instructor' && "(Instructor)"}
                        </p>
                        <span className="text-[10px] text-slate-400 ml-auto font-medium">{reply.timeAgo}</span>
                      </div>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">
                        {reply.text}
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
                          disabled={!replyText.trim()}
                          className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                        >
                          Reply
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
                <div className="mt-4 ml-4 sm:ml-6 flex items-center gap-2 text-slate-400">
                  <FontAwesomeIcon icon={faChalkboardTeacher} className="text-sm" />
                  <p className="text-xs font-medium italic">Waiting for instructor's reply...</p>
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