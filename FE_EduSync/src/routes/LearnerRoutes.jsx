import { Routes, Route } from "react-router-dom";
import LearnerLayout from "../layouts/LearnerLayout";

const LearnerRoutes = () => {
  return (
    <Routes>
      <Route element={<LearnerLayout />}>
        {/* Đường dẫn thực tế sẽ là /learner/home */}
        <Route
          path="home"
          element={
            <div className="p-4 text-xl">Đây là trang chủ cho người học</div>
          }
        />
      </Route>
    </Routes>
  );
};

export default LearnerRoutes;
