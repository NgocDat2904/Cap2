import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply } from "@fortawesome/free-solid-svg-icons";

const CourseDiscussion = () => {
  // Chuyển Data Comments vào đây
  const [comments, setComments] = useState([
    {
      id: 1,
      name: "Hoàng Nguyễn",
      time: "2 giờ trước",
      text: "Thầy cho em hỏi Functional Component khác Class Component chỗ nào ạ?",
      avatar: "HN",
    },
    {
      id: 2,
      name: "Trần Minh",
      time: "1 ngày trước",
      text: "Bài này giải thích dễ hiểu quá, em xem 1 lần là làm được luôn.",
      avatar: "TM",
    },
  ]);

  return (
    <div className="animate-fade-slide-up flex flex-col h-full">
      <div className="flex gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0 border border-blue-200">
          Bạn
        </div>
        <div className="flex-1 relative">
          <textarea
            placeholder="Bạn có thắc mắc gì về video hoặc bài quiz này?"
            className="w-full bg-white border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl p-3 text-sm outline-none resize-none min-h-[80px] transition-all shadow-sm"
          />
          <div className="flex justify-end mt-3">
            <button className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
              Đăng câu hỏi
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-5">
        <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-3">
          {comments.length} bình luận
        </h4>
        {comments.map((c) => (
          <div key={c.id} className="flex gap-4 group">
            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-300">
              {c.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-slate-800 text-sm">
                  {c.name}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {c.time}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-2 leading-relaxed">
                {c.text}
              </p>
              <button className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
                <FontAwesomeIcon icon={faReply} className="mr-1" /> Phản hồi
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDiscussion;
