import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
// Tạm thời comment API thật lại để dùng Mock Data
// import { aiQuizAPI, aiQuizByVideoAPI } from "../services/aiAPI";

// =========================================================================
// MOCK DATA: Giả lập dữ liệu câu hỏi trắc nghiệm từ AI
// =========================================================================
const MOCK_QUESTIONS = [
  {
    id: "q1",
    question: "What is the primary purpose of React?",
    options: [
      "To build database schemas",
      "To build user interfaces",
      "To style web pages",
      "To handle server-side logic"
    ],
    correct_index: 1
  },
  {
    id: "q2",
    question: "Which of the following is used to pass data to a component from outside?",
    options: [
      "setState",
      "render with arguments",
      "PropTypes",
      "props"
    ],
    correct_index: 3
  },
  {
    id: "q3",
    question: "What does the useState hook return?",
    options: [
      "A state object and a function to update it",
      "A single state value",
      "A state variable and a function to update it in an array",
      "A function to update the state"
    ],
    correct_index: 2
  },
  {
    id: "q4",
    question: "What is JSX?",
    options: [
      "A syntax extension for JavaScript",
      "A new programming language",
      "A built-in React component",
      "A database query language"
    ],
    correct_index: 0
  },
  {
    id: "q5",
    question: "Which hook is used to perform side effects in a functional component?",
    options: [
      "useContext",
      "useEffect",
      "useReducer",
      "useMemo"
    ],
    correct_index: 1
  }
];

const CourseDiscussion = ({ lessonContext, videoId, onSwitchToDiscussion }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // 🚨 Bỏ block check token để Demo dễ dàng hơn
      // const token = localStorage.getItem("access_token");
      // if (!token) {
      //   setError("Please sign in to take the AI quiz.");
      //   setLoading(false);
      //   return;
      // }

      setLoading(true);
      setError("");
      setQuestions([]);
      setAnswers({});
      setSubmitted(false);
      setScore(null);
      
      try {
        // Gọi API thật (Đã comment)
        // const data = videoId
        //   ? await aiQuizByVideoAPI(token, videoId, 5, "vi")
        //   : await aiQuizAPI(token, lessonContext, 5, "vi");
        
        // Giả lập thời gian AI tạo câu hỏi mất 1.5s
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        if (!cancelled) setQuestions(MOCK_QUESTIONS);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to generate quiz.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    
    run();
    
    return () => {
      cancelled = true;
    };
  }, [
    lessonContext?.title,
    lessonContext?.description,
    lessonContext?.transcript,
    videoId,
  ]);

  const handleSelect = (qid, optIndex) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qid]: optIndex }));
  };

  const handleSubmit = () => {
    if (!questions.length) return;
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_index) correct += 1;
    });
    setScore(correct);
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="animate-fade-slide-up py-8 text-center text-slate-500 text-sm font-medium">
        Generating questions from lesson content...
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-slide-up text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-medium">
        {error}
      </div>
    );
  }

  return (
    <div className="animate-fade-slide-up">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-lg font-bold text-slate-800">Knowledge Check (AI)</h3>
        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
          {questions.length} Questions
        </span>
      </div>
      
      {submitted && score !== null && (
        <p className={`mb-6 text-sm font-bold px-4 py-3 rounded-xl border ${score === questions.length ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
          Result: {score} / {questions.length} correct
        </p>
      )}

      <div className="space-y-6">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className="p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl relative group shadow-sm"
          >
            <p className="font-bold text-slate-800 mb-4 text-sm leading-relaxed">
              {i + 1}. {q.question}
            </p>
            <div className="space-y-2.5">
              {q.options.map((opt, j) => {
                const picked = answers[q.id] === j;
                const isCorrect = j === q.correct_index;
                let boxClass =
                  "flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 transition-all font-medium text-sm text-slate-700 shadow-sm";
                
                if (submitted) {
                  if (isCorrect) boxClass += " border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 text-emerald-800 font-bold";
                  else if (picked && !isCorrect)
                    boxClass += " border-red-400 bg-red-50 text-red-700";
                } else if (picked) {
                  boxClass += " border-blue-500 ring-1 ring-blue-500 bg-blue-50/50";
                }

                return (
                  <label key={j} className={boxClass}>
                    <input
                      type="radio"
                      name={`quiz_${q.id}`}
                      className="w-4 h-4 text-blue-600 accent-blue-600 cursor-pointer"
                      checked={picked}
                      onChange={() => handleSelect(q.id, j)}
                      disabled={submitted}
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
            
            <div className="mt-5 flex justify-end border-t border-slate-200/60 pt-4">
              <button
                type="button"
                onClick={onSwitchToDiscussion}
                className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1.5"
              >
                <FontAwesomeIcon icon={faCommentDots} /> Have a question about this?
              </button>
            </div>
          </div>
        ))}

        {questions.length > 0 && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitted || Object.keys(answers).length < questions.length}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md active:scale-95 text-sm"
          >
            {submitted ? "Quiz Submitted" : Object.keys(answers).length < questions.length ? "Answer all questions to submit" : "Submit Quiz"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseDiscussion;