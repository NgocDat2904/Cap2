import React, {
  useEffect,
  useState,
} from "react";

import { FontAwesomeIcon }
from "@fortawesome/react-fontawesome";

import {
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";

import {

  getQuizByVideoAPI,
  aiQuizAPI,

} from "../ai/aiAPI";

const CourseQuiz = ({

  lessonContext,
  videoId,
  onSwitchToDiscussion,

}) => {

  const [questions, setQuestions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [answers, setAnswers] =
    useState({});

  const [submitted, setSubmitted] =
    useState(false);

  const [score, setScore] =
    useState(null);

  // =========================================
  // LOAD QUIZ
  // =========================================

  useEffect(() => {

    let cancelled = false;

    const run = async () => {

      const token =
        localStorage.getItem(
          "access_token"
        );

      if (!token) {

        setError(
          "Please sign in to use AI."
        );

        setLoading(false);

        return;
      }

      setLoading(true);

      setError("");

      setQuestions([]);

      setAnswers({});

      setSubmitted(false);

      setScore(null);

      try {

        let data;

        // =========================
        // QUIZ BY VIDEO
        // =========================

        if (videoId) {

          data =
            await getQuizByVideoAPI(

              token,

              videoId,

              5,

              "vi"
            );
        }

        // =========================
        // NORMAL QUIZ
        // =========================

        else {

          data =
            await aiQuizAPI(

              token,

              lessonContext,

              5,

              "vi"
            );
        }

        if (!cancelled) {

          setQuestions(
            data?.questions || []
          );
        }

      } catch (err) {

        console.error(
          "QUIZ ERROR:",
          err
        );

        if (!cancelled) {

          setError(

            err?.response?.data?.detail ||

            err?.message ||

            "Failed to generate quiz."
          );
        }

      } finally {

        if (!cancelled) {

          setLoading(false);
        }
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

  // =========================================
  // SELECT ANSWER
  // =========================================

  const handleSelect = (
    qid,
    optIndex
  ) => {

    if (submitted) return;

    setAnswers(prev => ({

      ...prev,

      [qid]: optIndex,
    }));
  };

  // =========================================
  // SUBMIT QUIZ
  // =========================================

  const handleSubmit = () => {

    if (!questions.length) return;

    let correct = 0;

    questions.forEach((q, index) => {

      const userAnswer =
        answers[q.id || index];

      const correctIndex =
        q.correct_index;

      if (
        userAnswer === correctIndex
      ) {

        correct += 1;
      }
    });

    setScore(correct);

    setSubmitted(true);
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="animate-fade-slide-up py-8 text-center text-slate-500 text-sm">

        Generating AI quiz...

      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (error) {

    return (

      <div className="animate-fade-slide-up text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">

        {error}

      </div>
    );
  }

  return (

    <div className="animate-fade-slide-up">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="mb-6 flex justify-between items-center flex-wrap gap-2">

        <h3 className="text-lg font-bold text-slate-800">

          Knowledge Check (AI)

        </h3>

        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">

          {questions.length} Questions

        </span>

      </div>

      {/* =========================================
          SCORE
      ========================================= */}

      {submitted && score !== null && (

        <p className="mb-4 text-sm font-bold text-blue-700">

          Result: {score} / {questions.length} correct

        </p>
      )}

      {/* =========================================
          QUESTIONS
      ========================================= */}

      <div className="space-y-6">

        {questions.map((q, i) => {

          const qid =
            q.id || i;

          return (

            <div
              key={qid}
              className="p-5 bg-slate-50 border border-slate-200 rounded-xl relative group"
            >

              <p className="font-bold text-slate-800 mb-3 text-sm">

                {i + 1}. {q.question}

              </p>

              <div className="space-y-2">

                {q.options?.map(
                  (opt, j) => {

                    const picked =
                      answers[qid] === j;

                    const isCorrect =
                      j === q.correct_index;

                    let boxClass =
                      "flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors";

                    if (submitted) {

                      if (isCorrect) {

                        boxClass +=
                          " border-green-500 bg-green-50";
                      }

                      else if (
                        picked &&
                        !isCorrect
                      ) {

                        boxClass +=
                          " border-red-400 bg-red-50";
                      }
                    }

                    return (

                      <label
                        key={j}
                        className={boxClass}
                      >

                        <input
                          type="radio"
                          name={`quiz_${qid}`}
                          className="w-4 h-4 text-blue-600"
                          checked={picked}
                          onChange={() =>
                            handleSelect(
                              qid,
                              j
                            )
                          }
                          disabled={submitted}
                        />

                        <span className="text-sm text-slate-700">

                          {opt}

                        </span>

                      </label>
                    );
                  }
                )}

              </div>

              {/* =========================================
                  DISCUSSION
              ========================================= */}

              <div className="mt-4 flex justify-end">

                <button
                  type="button"
                  onClick={
                    onSwitchToDiscussion
                  }
                  className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1.5"
                >

                  <FontAwesomeIcon
                    icon={faCommentDots}
                  />

                  Have a question?

                </button>

              </div>

            </div>
          );
        })}

        {/* =========================================
            SUBMIT BUTTON
        ========================================= */}

        {questions.length > 0 && (

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitted}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-md"
          >

            {submitted
              ? "Submitted"
              : "Submit"}

          </button>
        )}

      </div>

    </div>
  );
};

export default CourseQuiz;