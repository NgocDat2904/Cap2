import { Routes, Route } from "react-router-dom";
import LearnerLayout from "../layouts/LearnerLayout";
import LoginPage from "../pages/Learner/LoginPage";
import RegisterPage from "../pages/Learner/RegisterPage";

const LearnerRoutes = () => {
  return (
    <Routes>
      <Route element={<LearnerLayout />}>
        {/* Đường dẫn thực tế sẽ là /learner/home */}
        <Route
          path="/home"
          element={
            <div className="p-4 text-xl">Đây là trang chủ cho người học</div>
          }
        />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
};

export default LearnerRoutes;
