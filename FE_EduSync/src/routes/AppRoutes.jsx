//File này đóng vai trò là "Tổng đài viên", nhận đường link từ trình duyệt và phân phát về đúng file Route tương ứng.

import { Routes, Route, Navigate } from "react-router-dom";
import InstructorRoutes from "./InstructorRoutes";
import LearnerRoutes from "./LearnerRoutes";
import PublicPage from "../pages/PublicPage";
import AdminRoutes from "./AdminRoutes";

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Trang chủ công khai cho khách vãng lai */}
      <Route path="/" element={<PublicPage />} />

      {/* 2. Dấu /* báo cho React biết bên trong InstructorRoutes còn nhiều đường dẫn con khác */}
      <Route path="/instructor/*" element={<InstructorRoutes />} />

      {/* Admin trước catch-all Learner để /admin/* luôn match đúng */}
      <Route path="/admin/*" element={<AdminRoutes />} />

      {/* Learner + trang công khai khác */}
      <Route path="/*" element={<LearnerRoutes />} />
    </Routes>
  );
};

export default AppRoutes;
