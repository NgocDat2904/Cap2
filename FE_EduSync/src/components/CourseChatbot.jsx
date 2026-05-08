import React, {
  useState,
  useRef,
  useEffect,
} from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faRobot,
  faUserCircle,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";

import {
  aiChatAPI,
  aiChatByVideoAPI,
} from "../ai/aiAPI";

const CourseChatbot = ({
  lessonContext,
  videoId,
}) => {

  const [chatMessages, setChatMessages] =
    useState([
      {
        isAi: true,
        text:
          "Chào bạn! Mình là AI trợ giảng. Hỏi mình về nội dung bài học nhé.",
      },
    ]);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const bottomRef = useRef(null);

  // =========================================
  // AUTO SCROLL CHAT
  // =========================================

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [chatMessages]);

  // =========================================
  // SEND CHAT
  // =========================================

  const handleSendChat = async (e) => {

    e.preventDefault();

    const input =
      e.target.elements.chatInput.value;

    if (!input.trim() || sending) {
      return;
    }

    const token =
      localStorage.getItem(
        "access_token"
      );

    if (!token) {

      setError(
        "Please log in to use AI."
      );

      return;
    }

    setError("");

    const userMsg = {

      isAi: false,

      text: input.trim(),
    };

    const nextMessages = [

      ...chatMessages,

      userMsg,
    ];

    setChatMessages(nextMessages);

    e.target.reset();

    setSending(true);

    try {

      let data;

      // =========================
      // CHAT BY VIDEO
      // =========================

      if (videoId) {

        data =
          await aiChatByVideoAPI(

            token,

            videoId,

            nextMessages
          );

      }

      // =========================
      // NORMAL CHAT
      // =========================

      else {

        data = await aiChatAPI(

          token,

          lessonContext,

          nextMessages
        );
      }

      setChatMessages([

        ...nextMessages,

        {

          isAi: true,

          text:
            data?.reply ||
            "AI không có phản hồi.",
        },
      ]);

    } catch (err) {

      console.error(
        "AI CHAT ERROR:",
        err
      );

      setChatMessages([

        ...nextMessages,

        {

          isAi: true,

          text:
            err?.response?.data?.detail ||
            err?.message ||
            "AI đang gặp lỗi.",
        },
      ]);

    } finally {

      setSending(false);
    }
  };

  return (

    <div className="animate-fade-slide-up flex flex-col h-[400px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center gap-3 shadow-sm z-10">

        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-inner">

          <FontAwesomeIcon icon={faRobot} />

        </div>

        <div>

          <p className="text-sm font-bold text-slate-800">

            EduSync AI (Gemini)

          </p>

          <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">

            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span>

            {sending
              ? "Đang trả lời..."
              : "Sẵn sàng"}

          </p>

        </div>

      </div>

      {/* =========================================
          ERROR
      ========================================= */}

      {error && (

        <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-b border-red-100">

          {error}

        </div>
      )}

      {/* =========================================
          CHAT BODY
      ========================================= */}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

        {chatMessages.map((msg, idx) => (

          <div
            key={idx}
            className={`flex gap-3 ${
              msg.isAi
                ? ""
                : "flex-row-reverse"
            }`}
          >

            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                msg.isAi
                  ? "bg-blue-100 text-blue-600"
                  : "bg-slate-200 text-slate-600"
              }`}
            >

              <FontAwesomeIcon
                icon={
                  msg.isAi
                    ? faRobot
                    : faUserCircle
                }
              />

            </div>

            <div
              className={`p-3 rounded-2xl max-w-[80%] text-sm shadow-sm whitespace-pre-wrap ${
                msg.isAi
                  ? "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
                  : "bg-blue-600 text-white rounded-tr-none"
              }`}
            >

              {msg.text}

            </div>

          </div>
        ))}

        <div ref={bottomRef}></div>

      </div>

      {/* =========================================
          INPUT
      ========================================= */}

      <form
        onSubmit={handleSendChat}
        className="p-3 bg-white border-t border-slate-200 flex gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]"
      >

        <input
          name="chatInput"
          type="text"
          placeholder="Hỏi AI về nội dung bài giảng..."
          className="flex-1 bg-slate-100 border-transparent focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-400 rounded-lg px-4 py-2 text-sm outline-none transition-all"
          autoComplete="off"
          disabled={sending}
        />

        <button
          type="submit"
          disabled={sending}
          className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg flex items-center justify-center transition-colors shadow-sm"
        >

          <FontAwesomeIcon
            icon={faPaperPlane}
          />

        </button>

      </form>

    </div>
  );
};

export default CourseChatbot;