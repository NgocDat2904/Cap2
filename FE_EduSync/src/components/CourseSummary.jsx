import React, { useEffect, useState } from "react";
import { getSummaryByVideoAPI } from "../services/aiAPI";
import ReactMarkdown from "react-markdown";

const CourseSummary = ({ lessonContext, videoId }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("loading"); // loading | ready | pending | error

  const fetchSummary = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Vui lòng đăng nhập để xem tóm tắt bài học.");
      setStatus("error");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    setSummary("");
    setStatus("loading");
    try {
      if (!videoId) {
        setStatus("pending");
        setLoading(false);
        return;
      }
      const data = await getSummaryByVideoAPI(token, videoId, "vi");
      if (data && data.summary) {
        setSummary(data.summary);
        setStatus("ready");
      } else {
        setStatus("pending");
      }
    } catch (e) {
      console.error("Summary fetch error:", e);
      setError(e.message || "Failed to load summary.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await fetchSummary();
    };
    run();
    return () => { cancelled = true; };
  }, [
    lessonContext?.title,
    lessonContext?.description,
    lessonContext?.transcript,
    videoId,
  ]);

  if (status === "pending" && !loading) {
    return (
      <div className="animate-fade-slide-up text-slate-600">
        <h3 className="text-lg font-bold text-slate-800 mb-3">
          Lesson Summary
        </h3>
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <p className="text-sm font-bold text-slate-600">
            Summary đang được chuẩn bị
          </p>
          <p className="text-xs text-slate-500 text-center max-w-sm">
            Hệ thống đang xử lý transcript. Summary sẽ tự động hiện khi hoàn tất, vui lòng quay lại sau ít phút.
          </p>
          <button
            onClick={() => fetchSummary()}
            className="mt-2 px-5 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-300 transition-all active:scale-95 shadow-sm"
          >
            Kiểm tra lại
          </button>
        </div>
      </div>
    );
  }

  return (
    // THAY ĐỔI 1: Thêm w-full và overflow-hidden để block cha không phình ra
    <div className="animate-fade-slide-up text-slate-600 w-full overflow-hidden">
      <h3 className="text-lg font-bold text-slate-800 mb-3">
        Lesson Summary
      </h3>
      {loading && (
        <p className="text-sm text-slate-500 italic">Đang tải summary...</p>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {!loading && !error && summary && (
        // THAY ĐỔI 2: Thêm max-w-full, overflow-x-auto, break-words cho khối render Markdown
        <div className="prose prose-sm max-w-full w-full overflow-x-auto break-words text-slate-700 custom-scrollbar">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      )}
      {!lessonContext?.transcript && !loading && !error && summary && (
        <p className="text-xs text-slate-400 mt-3">
          Tip: add a transcript (subtitle file / STT) to the video for a more accurate summary.
        </p>
      )}
    </div>
  );
};

export default CourseSummary;