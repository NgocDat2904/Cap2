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
import PaymentResult from "../pages/Learner/PaymentResult";

const LearnerRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<LearnerAuthPage />} />
      <Route path="register" element={<LearnerAuthPage />} />

      {/* Khách: vào được layout + xem Home / Courses / chi tiết khóa / hồ sơ giảng viên công khai */}
      <Route element={<LearnerLayout />}>
        <Route path="home" element={<EduSyncHome />} />
        <Route path="courses" element={<LearnerCoursesPage />} />
        <Route path="courses/:courseId" element={<CourseDetailPage />} />
        <Route
          path="instructors/:instructorId"
          element={<InstructorPublicProfile />}
        />
        {/* Payment result can be accessed freely (it uses query params to display status) */}
        <Route path="payment-result" element={<PaymentResult />} />
      </Route>

      {/* Đã đăng nhập: học bài, giỏ hàng, profile, yêu thích, thông báo, khóa của tôi */}
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
