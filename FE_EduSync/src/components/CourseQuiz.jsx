import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";

// Mang data Quiz về đây cho gọn nhà gọn cửa
const mockQuiz = [
  {
    id: 1,
    question: "Component trong React được dùng để làm gì?",
    options: [
      "Quản lý Database",
      "Chia nhỏ UI thành các phần độc lập",
      "Tạo API",
      "Style CSS",
    ],
  },
  {
    id: 2,
    question: "Đâu là cú pháp đúng để tạo Functional Component?",
    options: [
      "function MyComponent() {}",
      "class MyComponent {}",
      "create component MyComponent",
      "new Component()",
    ],
  },
];

const CourseQuiz = ({ onSwitchToDiscussion }) => {
  return (
    <div className="animate-fade-slide-up">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Kiểm tra kiến thức</h3>
        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
          {mockQuiz.length} Câu hỏi
        </span>
      </div>
      <div className="space-y-6">
        {mockQuiz.map((q, i) => (
          <div
            key={q.id}
            className="p-5 bg-slate-50 border border-slate-200 rounded-xl relative group"
          >
            <p className="font-bold text-slate-800 mb-3 text-sm">
              {i + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, j) => (
                <label
                  key={j}
                  className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <input
                    type="radio"
                    name={`quiz_${q.id}`}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-slate-700">{opt}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={onSwitchToDiscussion}
                className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1.5"
              >
                <FontAwesomeIcon icon={faCommentDots} /> Thắc mắc về câu này?
              </button>
            </div>
          </div>
        ))}
        <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md">
          Nộp bài
        </button>
      </div>
    </div>
  );
};

export default CourseQuiz;
