import { Routes, Route } from "react-router-dom";
import LearnerLayout from "../layouts/LearnerLayout";
import LearnerAuthPage from "../pages/Learner/LearnerAuthPage";

const LearnerRoutes = () => {
  return (
    <Routes>
      {/* 1. CỤM CÓ LAYOUT (Bị bọc bởi khung LearnerLayout) */}
      <Route element={<LearnerLayout />}>
        {/* Đường dẫn thực tế sẽ là /learner/home */}
        <Route
          path="home"
          element={
            <div className="p-4 text-xl">Đây là trang chủ cho người học</div>
          }
        />
      </Route>{" "}
      <Route path="login" element={<LearnerAuthPage />} />
      <Route path="register" element={<LearnerAuthPage />} />
    </Routes>
  );
};

export default LearnerRoutes;
