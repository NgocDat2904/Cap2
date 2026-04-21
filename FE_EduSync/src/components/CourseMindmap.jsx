import React, { useRef, useEffect, useState } from "react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";
import { aiMindmapAPI, aiMindmapByVideoAPI } from "../services/aiAPI";

const transformer = new Transformer();

const CourseMindmap = ({ lessonContext, videoId }) => {
  const svgRef = useRef(null);
  const [mindmapMd, setMindmapMd] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Vui lòng đăng nhập để xem mindmap AI.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      setMindmapMd("");
      try {
        const data = videoId
          ? await aiMindmapByVideoAPI(token, videoId, "vi")
          : await aiMindmapAPI(token, lessonContext, "vi");
        if (!cancelled) {
          setMindmapMd(data.mindmap_markdown || "");
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Không tải được mindmap.");
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

  useEffect(() => {
    if (svgRef.current && mindmapMd) {
      const { root } = transformer.transform(mindmapMd);
      svgRef.current.innerHTML = "";
      Markmap.create(svgRef.current, null, root);
    }
  }, [mindmapMd]);

  return (
    <div className="w-full h-[400px] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative">
      {loading && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-slate-500 bg-slate-50/90 z-10">
          Đang sinh mindmap từ nội dung video...
        </p>
      )}
      {error && !loading && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-red-600 bg-red-50/90 z-10 px-4 text-center">
          {error}
        </p>
      )}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
      <p className="absolute bottom-2 left-0 w-full text-center text-[10px] font-semibold text-slate-400 pointer-events-none">
        * Cuộn chuột để Thu/Phóng - Kéo thả để Di chuyển sơ đồ
      </p>
    </div>
  );
};

export default CourseMindmap;
