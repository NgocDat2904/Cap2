import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faChalkboardTeacher,
  faSearch,
  faCommentDots,
  faUserGraduate,
  faReply,
  faSpinner,
  faTrash
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";

import { getLessonQuestionsAPI, postQuestionAPI, postReplyAPI, deleteQuestionAPI, deleteReplyAPI } from "../services/learnerCourseAPI";

const formatDateTime = (dateStr) => {
  if (!dateStr) return "Vừa xong";
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN') + " " + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

// =========================================================================
// HÀM PHỤ: Giải mã JWT token để lấy thông tin user hiện tại
// =========================================================================
// JWT token có dạng: header.payload.signature (3 phần cách nhau bởi dấu chấm)
// Phần payload (phần giữa) chứa thông tin user: tên, email, avatar, role...
// Hàm này decode phần payload từ base64 sang JSON để lấy ra thông tin user
// =========================================================================
const getCurrentUserInfo = () => {
  try {
    // Bước 1: Lấy token từ localStorage
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    // Bước 2: Tách JWT thành 3 phần, lấy phần [1] là payload
    // Ví dụ: "abc.def.ghi" → lấy "def"
    const base64Url = token.split('.')[1];

    // Bước 3: Chuyển đổi base64url thành base64 chuẩn
    // (Thay - thành + và _ thành /)
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Bước 4: Decode base64 thành chuỗi JSON
    const jsonPayload = decodeURIComponent(
      atob(base64)  // atob = decode base64 thành string
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    // Bước 5: Parse JSON string thành object
    const payload = JSON.parse(jsonPayload);

    // Bước 6: Trích xuất thông tin user từ payload
    // JWT thường có cấu trúc: { sub: user_id, name: "Tên", email: "...", role: "..." }
    return {
      id: payload.sub || payload.user_id || payload.id,
      // Ưu tiên lấy name, nếu không có thì lấy fullName,
      // nếu không có thì lấy phần trước @ của email,
      // cuối cùng mới dùng "Anonymous User"
      name: payload.name || payload.fullName || payload.email?.split('@')[0] || "Anonymous User",
      email: payload.email || "",
      avatar: payload.avatar || null,
      role: payload.role || "learner"
    };
  } catch (error) {
    // Nếu decode bị lỗi (token sai format, hết hạn, v.v.)
    // thì trả về thông tin mặc định thay vì crash app
    console.error("Lỗi khi decode token:", error);
    return {
      name: "Anonymous User",
      avatar: null,
      role: "learner"
    };
  }
};
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
    if (e) e.preventDefault();
    if (!newQuestion.trim() || isSubmitting) return; // Chặn gửi nếu đang loading hoặc rỗng

    if (!lessonId) {
      toast.error("Lỗi: Không tìm thấy lesson_id. Bạn đang học bài nào vậy?");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");

      // Gọi API gửi câu hỏi lên server
      const response = await postQuestionAPI(courseId, lessonId, newQuestion, token);

      // FIX LỖI: Lấy thông tin user từ token JWT thay vì dùng fallback "You"
      // Trước đây: dùng response.user (nhưng API không trả về) → hiển thị "You"
      // Bây giờ: decode token để lấy tên thật, avatar thật
      const currentUser = getCurrentUserInfo();

      // Tạo object câu hỏi mới với đầy đủ thông tin
      const newQuestionObj = {
        id: response.question_id || response.id || Date.now().toString(), // ID từ API, hoặc tạo tạm
        content: newQuestion, // Nội dung câu hỏi
        created_at: new Date().toISOString(), // Thời gian tạo
        user: {
          name: currentUser.name,     // Tên thật từ JWT (ví dụ: "Nguyễn Văn A")
          avatar: currentUser.avatar, // Avatar URL từ JWT
          role: currentUser.role      // Role từ JWT (learner/instructor)
        },
        replies: [] // Mảng replies rỗng (câu hỏi mới chưa có ai trả lời)
      };

      // Thêm câu hỏi mới vào đầu danh sách (không cần reload trang)
      // prev = danh sách cũ, [newQuestionObj, ...prev] = thêm mới vào đầu
      setQnaList(prev => [newQuestionObj, ...prev]);

      // Xóa sạch input sau khi gửi thành công
      setNewQuestion("");

      // Trước đây gọi fetchQnA() → reload toàn bộ danh sách → tốn thời gian, mất scroll
      // Bây giờ: cập nhật trực tiếp state → mượt mà, không reload!
    } catch (error) {
      toast.error("Không thể gửi câu hỏi. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDownNewQuestion = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Bấm Enter (không kèm Shift) thì gửi
      e.preventDefault(); // Ngăn việc rớt xuống dòng mới
      handleAskQuestion();
    }
  };

  // =========================================================================
  // XỬ LÝ REPLY
  // =========================================================================
  const handleSubmitReply = async (questionId) => {
    if (!replyText.trim() || isSubmitting) return; // Chặn gửi nếu đang loading hoặc rỗng
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");

      // Gọi API gửi reply (câu trả lời) lên server
      const response = await postReplyAPI(questionId, replyText, token);

      // FIX LỖI: Lấy thông tin user từ token JWT
      const currentUser = getCurrentUserInfo();

      // Tạo object reply mới với đầy đủ thông tin
      const newReply = {
        id: response.reply_id || response.id || Date.now().toString(), // ID từ API
        content: replyText, // Nội dung câu trả lời
        created_at: new Date().toISOString(), // Thời gian tạo
        user: {
          name: currentUser.name,     // Tên thật từ JWT
          avatar: currentUser.avatar, // Avatar từ JWT
          role: currentUser.role      // Role từ JWT
        }
      };

      // Cập nhật danh sách câu hỏi: tìm câu hỏi có id = questionId,
      // rồi thêm reply mới vào array replies của câu hỏi đó
      setQnaList(prev => prev.map(q =>
        q.id === questionId
          ? {
              ...q, // Giữ nguyên các field khác của câu hỏi
              replies: [...(q.replies || []), newReply] // Thêm reply mới vào cuối mảng
            }
          : q // Các câu hỏi khác giữ nguyên
      ));

      // Xóa sạch input và đóng form reply
      setReplyText("");
      setActiveReplyId(null);

      // ❌ ĐÃ XÓA: fetchQnA();
      // Không cần reload toàn bộ nữa → UI mượt hơn!
    } catch (error) {
      toast.error("Không thể gửi câu trả lời. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleKeyDownReply = (e, questionId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitReply(questionId);
    }
  };

  // =========================================================================
  // XỬ LÝ XÓA CÂU HỎI (DELETE QUESTION)
  // =========================================================================
  const handleDeleteQuestion = async (questionId) => {
    // Xác nhận trước khi xóa
    if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này không? Hành động này không thể hoàn tác.")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      await deleteQuestionAPI(questionId, token);

      // ✅ Cập nhật local state: Loại bỏ question khỏi danh sách (KHÔNG reload)
      setQnaList(prev => prev.filter(q => q.id !== questionId));
    } catch (error) {
      console.error("Failed to delete question:", error);
      toast.error(error.response?.data?.detail || "Không thể xóa câu hỏi. Vui lòng thử lại.");
    }
  };

  // =========================================================================
  // XỬ LÝ XÓA REPLY (DELETE REPLY)
  // =========================================================================
  const handleDeleteReply = async (questionId, replyId) => {
    // Xác nhận trước khi xóa
    if (!window.confirm("Bạn có chắc chắn muốn xóa câu trả lời này không?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      await deleteReplyAPI(questionId, replyId, token);

      // ✅ Cập nhật local state: Loại bỏ reply khỏi mảng replies của question (KHÔNG reload)
      setQnaList(prev => prev.map(q =>
        q.id === questionId
          ? { ...q, replies: q.replies.filter(r => r.id !== replyId) }
          : q
      ));
    } catch (error) {
      console.error("Failed to delete reply:", error);
      toast.error(error.response?.data?.detail || "Không thể xóa câu trả lời. Vui lòng thử lại.");
    }
  };

  const filteredQnA = qnaList.filter(q => 
    q.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center h-40 text-slate-500">
  //       <FontAwesomeIcon icon={faSpinner} spin className="text-2xl mr-2" /> Loading discussion...
  //     </div>
  //   );
  // }

  return (
    <div className="animate-fade-slide-up h-full flex flex-col">
      
      {/* HEADER & SEARCH */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <FontAwesomeIcon icon={faCommentDots} className="text-blue-600" />
          Hỏi đáp khóa học
        </h3>
        
        <div className="relative w-full sm:w-64">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi..."
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
            Đặt câu hỏi mới
          </label>
          <div className="flex flex-col gap-3">
            <textarea
              rows="3"
              placeholder="Bạn muốn hỏi gì về bài học này? (Enter để gửi, Shift+Enter để xuống dòng)"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={handleKeyDownNewQuestion} // 🚨 BẮT PHÍM Ở ĐÂY NÈ MÁ
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-y"
            ></textarea>
            <div className="flex justify-between items-center">
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Hãy thử tìm kiếm trước khi đặt câu hỏi. Có thể ai đó đã trả lời rồi!
              </p>
              <button
                type="submit"
                disabled={!newQuestion.trim() || isSubmitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md active:scale-95 text-sm flex items-center gap-2 ml-auto"
              >
                {isSubmitting ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPaperPlane} />} 
                {isSubmitting ? "Đang gửi..." : "Gửi câu hỏi"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* DANH SÁCH CÂU HỎI VÀ LUỒNG THẢO LUẬN */}
      <div className="space-y-5 pb-8">
        {filteredQnA.length > 0 ? (
          filteredQnA.map((q) => {
            // Lấy thông tin user hiện tại để kiểm tra quyền xóa
            const currentUser = getCurrentUserInfo();
            const canDeleteQuestion = currentUser && q.user?.id === currentUser.id;

            return (
              <div key={q.id} className="p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl shadow-sm relative">
                {/* CÂU HỎI GỐC */}
                <div className="flex items-center gap-3 mb-3">
                  {q.user?.avatar && !q.user.avatar.includes("null") ? (
                    <img src={q.user.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-xs font-bold">
                      {q.user?.name ? q.user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}

                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      {q.user?.name || "Người dùng ẩn danh"}
                      {q.user?.role === "instructor" && (
                        <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded uppercase font-black">Giảng viên</span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">{formatDateTime(q.created_at)}</p>
                  </div>

                  {/* NÚT XÓA QUESTION - Chỉ hiện nếu user là chủ nhân */}
                  {canDeleteQuestion && (
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa câu hỏi"
                    >
                      <FontAwesomeIcon icon={faTrash} className="text-sm" />
                    </button>
                  )}
                </div>

                <p className="text-sm text-slate-700 mb-4 leading-relaxed font-medium">
                  {q.content}
                </p>

              {/* LUỒNG REPLIES (Trả lời) */}
              {q.replies && q.replies.length > 0 ? (
                <div className="mt-4 ml-4 sm:ml-6 pl-4 border-l-2 border-slate-200 space-y-4">
                  {q.replies.map(reply => {
                    // Kiểm tra quyền xóa reply
                    const canDeleteReply = currentUser && reply.user?.id === currentUser.id;

                    return (
                      <div key={reply.id} className={`p-4 rounded-2xl relative ${reply.user?.role === 'instructor' ? 'bg-blue-50/70 border border-blue-100' : 'bg-slate-50 border border-slate-100'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          {reply.user?.role === 'instructor' ? (
                            <FontAwesomeIcon icon={faChalkboardTeacher} className="text-blue-600 text-sm" />
                          ) : (
                            <FontAwesomeIcon icon={faUserGraduate} className="text-emerald-600 text-sm" />
                          )}
                          <p className={`text-xs font-black tracking-wider ${reply.user?.role === 'instructor' ? 'text-blue-800' : 'text-emerald-800'}`}>
                            {reply.user?.name || "Ẩn danh"} {reply.user?.role === 'instructor' && "(Giảng viên)"}
                          </p>
                          <span className="text-[10px] text-slate-400 ml-auto font-medium">{formatDateTime(reply.created_at)}</span>

                          {/* NÚT XÓA REPLY - Chỉ hiện nếu user là chủ nhân */}
                          {canDeleteReply && (
                            <button
                              onClick={() => handleDeleteReply(q.id, reply.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-2"
                              title="Xóa câu trả lời"
                            >
                              <FontAwesomeIcon icon={faTrash} className="text-xs" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">
                          {reply.content}
                        </p>
                      </div>
                    );
                  })}

                  {/* KHUNG GÕ FOLLOW-UP DÀNH CHO HỌC VIÊN */}
                  {activeReplyId === q.id ? (
                    <div className="mt-3 animate-fade-slide-up bg-white p-3 rounded-xl border border-blue-200 shadow-sm">
                      <textarea
                        autoFocus
                        rows="2"
                        placeholder="Viết câu trả lời... (Enter để gửi)"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => handleKeyDownReply(e, q.id)} // 🚨 BẮT PHÍM Ở ĐÂY NỮA
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 transition-colors resize-y mb-2"
                      />
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setActiveReplyId(null); setReplyText(""); }}
                          className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          Hủy
                        </button>
                        <button 
                          onClick={() => handleSubmitReply(q.id)}
                          disabled={!replyText.trim() || isSubmitting}
                          className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1"
                        >
                          {isSubmitting ? <FontAwesomeIcon icon={faSpinner} spin /> : "Trả lời"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setActiveReplyId(q.id)}
                      className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 mt-2 transition-colors"
                    >
                      <FontAwesomeIcon icon={faReply} /> Trả lời chủ đề
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-4 ml-4 sm:ml-6 flex flex-col gap-2">
                  {/* <div className="flex items-center gap-2 text-slate-400">
                    <FontAwesomeIcon icon={faChalkboardTeacher} className="text-sm" />
                    <p className="text-xs font-medium italic">Đang chờ giảng viên trả lời...</p>
                  </div> */}
                  {activeReplyId === q.id ? (
                    <div className="mt-2 animate-fade-slide-up bg-white p-3 rounded-xl border border-blue-200 shadow-sm">
                      <textarea
                        autoFocus
                        rows="2"
                        placeholder="Viết câu trả lời... (Enter để gửi)"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => handleKeyDownReply(e, q.id)} // 🚨 BẮT PHÍM LUÔN CHO CHẮC
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 transition-colors resize-y mb-2"
                      />
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setActiveReplyId(null); setReplyText(""); }}
                          className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          Hủy
                        </button>
                        <button 
                          onClick={() => handleSubmitReply(q.id)}
                          disabled={!replyText.trim() || isSubmitting}
                          className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                        >
                          {isSubmitting ? <FontAwesomeIcon icon={faSpinner} spin /> : "Trả lời"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setActiveReplyId(q.id)}
                      className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 mt-1 transition-colors w-fit"
                    >
                      <FontAwesomeIcon icon={faReply} /> Trả lời
                    </button>
                  )}
                </div>
              )}
            </div>
          );
          })
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <FontAwesomeIcon icon={faSearch} className="text-3xl text-slate-300 mb-3" />
            <p className="text-slate-500 font-bold text-sm">Chưa có câu hỏi nào.</p>
            <p className="text-slate-400 text-xs mt-1">Hãy là người đầu tiên đặt câu hỏi!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDiscussion;