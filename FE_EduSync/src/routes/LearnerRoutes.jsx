import { Routes, Route } from "react-router-dom";
import LearnerLayout from "../layouts/LearnerLayout";
import LearnerAuthPage from "../pages/Learner/LearnerAuthPage";
import ProtectedRoute from "./ProtectedRoute";
import EduSyncHome from "../pages/Learner/Home";
import LearnerCoursesPage from "../pages/Learner/Courses";
import CourseDetailPage from "../pages/Learner/CourseDetail";
import CourseLearningWorkspace from "../pages/Learner/PlayVideo";
import LearnerFavoritesPage from "../pages/Learner/FavoriteVideo";
import LearnerMyCoursesPage from "../pages/Learner/MyCourse";
import LearnerCheckoutPage from "../pages/Learner/Check";

const LearnerRoutes = () => {
  return (
    <Routes>
      {/* 1. CỤM CÓ LAYOUT (Bị bọc bởi khung LearnerLayout) */}
      <Route element={<LearnerLayout />}>
        {/* Đường dẫn thực tế sẽ là /learner/home */}
        <Route path="home" element={<EduSyncHome />} />
        <Route path="courses" element={<LearnerCoursesPage />} />
        <Route path="my-courses" element={<LearnerMyCoursesPage />} />
        <Route path="checkout" element={<LearnerCheckoutPage />} />
        <Route path="courses/:courseId" element={<CourseDetailPage />} />
        <Route
          path="courses/:courseId/lessons/:lessonId"
          element={<CourseLearningWorkspace />}
        />
        <Route path="favorites" element={<LearnerFavoritesPage />} />
      </Route>{" "}
      <Route path="login" element={<LearnerAuthPage />} />
      <Route path="register" element={<LearnerAuthPage />} />
      {/* ========================================== */}
      {/* VÙNG CẤM: Bắt buộc phải đăng nhập mới được vào */}
      {/* ========================================== */}
      {/* 2. Dùng ProtectedRoute để khóa nguyên cái khu vực này lại */}
      {/* <Route element={<ProtectedRoute />}>
        
        <Route element={<LearnerLayout />}>
          
          <Route path="/home" element={<div className="p-4 text-xl">Đây là trang chủ Learner</div>} />
          <Route path="/courses" element={<div className="p-4 text-xl">Khóa học của tôi</div>} />
          <Route path="/favorites" element={<div className="p-4 text-xl">Video yêu thích</div>} />
          
        </Route>
      </Route> */}
    </Routes>
  );
};

export default LearnerRoutes;
