import React, {
  useEffect,
  useState,
} from "react";

import {

  aiSummaryAPI,
  getSummaryByVideoAPI,

} from "../ai/aiAPI";

const CourseSummary = ({

  lessonContext,
  videoId,

}) => {

  const [summary, setSummary] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================================
  // LOAD SUMMARY
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

      setSummary("");

      try {

        let data;

        // =========================
        // SUMMARY BY VIDEO
        // =========================

        if (videoId) {

          data =
            await getSummaryByVideoAPI(

              token,

              videoId,

              "vi"
            );
        }

        // =========================
        // NORMAL SUMMARY
        // =========================

        else {

          data =
            await aiSummaryAPI(

              token,

              lessonContext,

              "vi"
            );
        }

        if (!cancelled) {

          setSummary(
            data?.summary || ""
          );
        }

      } catch (err) {

        console.error(
          "SUMMARY ERROR:",
          err
        );

        if (!cancelled) {

          setError(

            err?.response?.data?.detail ||

            err?.message ||

            "Failed to generate summary."
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

  return (

    <div className="animate-fade-slide-up text-slate-600">

      {/* =========================================
          TITLE
      ========================================= */}

      <h3 className="text-lg font-bold text-slate-800 mb-3">

        Lesson Summary (AI)

      </h3>

      {/* =========================================
          LOADING
      ========================================= */}

      {loading && (

        <p className="text-sm text-slate-500 italic">

          Generating summary...

        </p>
      )}

      {/* =========================================
          ERROR
      ========================================= */}

      {error && (

        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">

          {error}

        </p>
      )}

      {/* =========================================
          SUMMARY
      ========================================= */}

      {!loading &&
        !error &&
        summary && (

        <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">

          {summary}

        </div>
      )}

      {/* =========================================
          NO TRANSCRIPT
      ========================================= */}

      {!lessonContext?.transcript &&
        !loading &&
        !error &&
        summary && (

        <p className="text-xs text-slate-400 mt-3">

          Tip: transcript helps AI generate more accurate summaries.

        </p>
      )}

    </div>
  );
};

export default CourseSummary;