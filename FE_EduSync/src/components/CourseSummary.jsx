import React, { useEffect, useState } from "react";
import { aiSummaryAPI, aiSummaryByVideoAPI } from "../services/aiAPI";

const CourseSummary = ({ lessonContext, videoId }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Vui lòng đăng nhập để xem tóm tắt AI.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      setSummary("");
      try {
        const data = videoId
          ? await aiSummaryByVideoAPI(token, videoId, "vi")
          : await aiSummaryAPI(token, lessonContext, "vi");
        if (!cancelled) setSummary(data.summary || "");
      } catch (e) {
        if (!cancelled) setError(e.message || "Không tải được tóm tắt.");
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

  return (
    <div className="animate-fade-slide-up text-slate-600">
      <h3 className="text-lg font-bold text-slate-800 mb-3">
        Tóm tắt bài học (Gemini)
      </h3>
      {loading && (
        <p className="text-sm text-slate-500 italic">Đang tạo tóm tắt...</p>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {!loading && !error && summary && (
        <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
          {summary}
        </div>
      )}
      {!lessonContext?.transcript && !loading && !error && summary && (
        <p className="text-xs text-slate-400 mt-3">
          Gợi ý: thêm transcript (file phụ đề / STT) cho video để tóm tắt sát nội dung hơn.
        </p>
      )}
    </div>
  );
};

export default CourseSummary;
