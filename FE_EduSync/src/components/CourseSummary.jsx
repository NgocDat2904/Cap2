import React from "react";

const CourseSummary = ({ lessonTitle }) => {
  return (
    <div className="animate-fade-slide-up text-slate-600">
      <h3 className="text-lg font-bold text-slate-800 mb-3">
        Tóm tắt bài học (AI Gen)
      </h3>
      <p>
        Hệ thống AI đang xử lý nội dung cho <strong>{lessonTitle}</strong>...
      </p>
    </div>
  );
};

export default CourseSummary;
