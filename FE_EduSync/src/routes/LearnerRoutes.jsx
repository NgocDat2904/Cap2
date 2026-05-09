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
import LearnerProfilePage from "../pages/Learner/ProfilePage";
import LearnerNotifications from "../pages/Learner/Notifications";
import InstructorPublicProfile from "../pages/Learner/InstructorProfile";

const LearnerRoutes = () => {
  return (
    <Routes>
      {/* 1. CỤM CÓ LAYOUT (Bị bọc bởi khung LearnerLayout) */}
      <Route path="login" element={<LearnerAuthPage />} />
      <Route path="register" element={<LearnerAuthPage />} />
      {/* 2. Vùng có thể vào để xem ngay cả khi chưa có tài khoản */}
      <Route element={<LearnerLayout />}>
        <Route path="home" element={<EduSyncHome />} />
        <Route path="courses" element={<LearnerCoursesPage />} />
        <Route path="courses/:courseId" element={<CourseDetailPage />} />
        <Route
          path="instructors/:instructorId"
          element={<InstructorPublicProfile />}
        />
      </Route>

      {/* 3. Vùng tính năng: bắt buộc đăng nhập */}
      <Route element={<ProtectedRoute />}>
        <Route element={<LearnerLayout />}>
          <Route path="my-courses" element={<LearnerMyCoursesPage />} />
          <Route path="checkout" element={<LearnerCheckoutPage />} />
          <Route path="profile" element={<LearnerProfilePage />} />
          <Route
            path="courses/:courseId/lessons/:lessonId"
            element={<CourseLearningWorkspace />}
          />
          <Route path="favorites" element={<LearnerFavoritesPage />} />
          <Route path="notifications" element={<LearnerNotifications />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default LearnerRoutes;
