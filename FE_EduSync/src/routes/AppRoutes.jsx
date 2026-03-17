//File này đóng vai trò là "Tổng đài viên", nhận đường link từ trình duyệt và phân phát về đúng file Route tương ứng.

import { Routes, Route, Navigate } from "react-router-dom";
import InstructorRoutes from "./InstructorRoutes";
import LearnerRoutes from "./LearnerRoutes";
import PublicPage from "../pages/PublicPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Trang chủ công khai cho khách vãng lai */}
      <Route path="/" element={<PublicPage />} />

      {/* Compat: route cũ -> route mới */}
      <Route path="/login" element={<Navigate to="/learner/login" replace />} />
      <Route
        path="/register"
        element={<Navigate to="/learner/register" replace />}
      />

      {/* 2. Dấu /* báo cho React biết bên trong InstructorRoutes còn nhiều đường dẫn con khác */}
      <Route path="/instructor/*" element={<InstructorRoutes />} />

      {/* 3. Tương tự cho Learner */}
      <Route path="/learner/*" element={<LearnerRoutes />} />
    </Routes>
  );
};

export default AppRoutes;
