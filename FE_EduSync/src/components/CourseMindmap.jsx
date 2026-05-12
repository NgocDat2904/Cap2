import React, { useRef, useEffect, useState, useCallback } from "react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";
import { aiMindmapAPI, aiMindmapByVideoAPI } from "../services/aiAPI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faDiagramProject,
  faRotateRight,
  faExpand,
  faCompress,
  faClockRotateLeft,
} from "@fortawesome/free-solid-svg-icons";

const transformer = new Transformer();

const CourseMindmap = ({ lessonContext, videoId }) => {
  const svgRef = useRef(null);
  const markmapRef = useRef(null);
  const [markmapCode, setMarkmapCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("loading");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch markmap code from API
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Vui lòng đăng nhập để xem mindmap AI.");
        setStatus("error");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      setMarkmapCode("");
      setStatus("loading");
      try {
        const data = videoId
          ? await aiMindmapByVideoAPI(token, videoId, "vi")
          : await aiMindmapAPI(token, lessonContext, "vi");

        if (!cancelled) {
          const code = data.markmap_code || "";
          if (code) {
            setMarkmapCode(code);
            setStatus("ready");
          } else {
            setStatus("pending");
          }
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e.message || "";
          if (
            msg.includes("chưa có transcript") ||
            msg.includes("409") ||
            msg.includes("pending")
          ) {
            setStatus("pending");
          } else {
            setError(msg || "Không thể tải mindmap.");
            setStatus("error");
          }
        }
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

  // Render markmap diagram
  useEffect(() => {
    if (!svgRef.current || !markmapCode) return;

    try {
      const { root } = transformer.transform(markmapCode);
      svgRef.current.innerHTML = "";

      if (markmapRef.current) {
        markmapRef.current.destroy();
      }

      markmapRef.current = Markmap.create(svgRef.current, {
        autoFit: true,
        duration: 500,
        maxWidth: 300,
        paddingX: 16,
        colorFreezeLevel: 2,
        initialExpandLevel: 3,
      }, root);
    } catch (renderErr) {
      console.error("Markmap render error:", renderErr);
      if (svgRef.current) {
        const parent = svgRef.current.parentElement;
        if (parent) {
          const fallbackDiv = document.createElement("div");
          fallbackDiv.style.cssText =
            "padding:24px;font-family:monospace;font-size:13px;white-space:pre-wrap;color:#475569;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;width:100%;height:100%;overflow:auto;";
          fallbackDiv.textContent = markmapCode;
          parent.replaceChild(fallbackDiv, svgRef.current);
        }
      }
    }
  }, [markmapCode]);

  // Fit markmap when fullscreen changes
  useEffect(() => {
    if (markmapRef.current && status === "ready") {
      setTimeout(() => {
        markmapRef.current.fit();
      }, 300);
    }
  }, [isFullscreen, status]);

  const handleRetry = useCallback(() => {
    setMarkmapCode("");
    setLoading(true);
    setError("");
    setStatus("loading");

    if (markmapRef.current) {
      markmapRef.current.destroy();
      markmapRef.current = null;
    }

    const token = localStorage.getItem("access_token");
    if (!token) return;

    const run = async () => {
      try {
        const data = videoId
          ? await aiMindmapByVideoAPI(token, videoId, "vi")
          : await aiMindmapAPI(token, lessonContext, "vi");
        const code = data.markmap_code || "";
        if (code) {
          setMarkmapCode(code);
          setStatus("ready");
        } else {
          setStatus("pending");
        }
      } catch (e) {
        setError(e.message || "Không thể tải mindmap.");
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [videoId, lessonContext]);

  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  // ─── LOADING STATE ───
  if (status === "loading") {
    return (
      <div className="w-full h-[450px] bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-2xl border border-slate-200 overflow-hidden relative flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center animate-pulse">
            <FontAwesomeIcon
              icon={faDiagramProject}
              className="text-indigo-500 text-2xl"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-indigo-200 flex items-center justify-center">
            <FontAwesomeIcon
              icon={faSpinner}
              className="text-indigo-500 text-xs animate-spin"
            />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-700">
            Đang tạo mindmap từ nội dung bài giảng...
          </p>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            AI đang phân tích và tổ chức ý chính
          </p>
        </div>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ─── PENDING STATE ───
  if (status === "pending") {
    return (
      <div className="w-full h-[450px] bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-2xl border border-amber-200/60 overflow-hidden relative flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
          <FontAwesomeIcon
            icon={faClockRotateLeft}
            className="text-amber-500 text-2xl"
          />
        </div>
        <div className="text-center max-w-sm">
          <p className="text-sm font-bold text-slate-700">
            Mindmap đang được chuẩn bị
          </p>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">
            Hệ thống đang xử lý transcript của video. Mindmap sẽ tự động hiện
            khi quá trình hoàn tất. Vui lòng quay lại sau ít phút.
          </p>
        </div>
        <button
          onClick={handleRetry}
          className="mt-2 px-5 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-all active:scale-95 flex items-center gap-2 shadow-sm"
        >
          <FontAwesomeIcon icon={faRotateRight} />
          Thử lại
        </button>
      </div>
    );
  }

  // ─── ERROR STATE ───
  if (status === "error") {
    return (
      <div className="w-full h-[450px] bg-gradient-to-br from-red-50/50 to-rose-50/30 rounded-2xl border border-red-200/60 overflow-hidden relative flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <div className="text-center max-w-sm">
          <p className="text-sm font-bold text-red-700">
            Không thể tải mindmap
          </p>
          <p className="text-xs text-red-500/80 mt-2 leading-relaxed font-medium">
            {error}
          </p>
        </div>
        <button
          onClick={handleRetry}
          className="mt-2 px-5 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-all active:scale-95 flex items-center gap-2 shadow-sm"
        >
          <FontAwesomeIcon icon={faRotateRight} />
          Thử lại
        </button>
      </div>
    );
  }

  // ─── READY STATE ───
  return (
    <div
      className={`${
        isFullscreen
          ? "fixed inset-0 z-50 bg-white p-4"
          : "w-full h-[450px] relative"
      } bg-gradient-to-br from-white to-indigo-50/20 rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all`}
    >
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <button
          onClick={handleRetry}
          title="Tạo lại mindmap"
          className="w-8 h-8 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all active:scale-90 shadow-sm"
        >
          <FontAwesomeIcon icon={faRotateRight} className="text-xs" />
        </button>
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Thu nhỏ" : "Phóng to"}
          className="w-8 h-8 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all active:scale-90 shadow-sm"
        >
          <FontAwesomeIcon
            icon={isFullscreen ? faCompress : faExpand}
            className="text-xs"
          />
        </button>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ minHeight: "100%" }}
      />

      <p className="absolute bottom-2 left-0 w-full text-center text-[10px] font-semibold text-slate-400 pointer-events-none">
        * Cuộn để phóng to/thu nhỏ — Kéo để di chuyển sơ đồ
      </p>
    </div>
  );
};

export default CourseMindmap;
