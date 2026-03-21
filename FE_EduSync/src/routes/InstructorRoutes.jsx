import { Routes, Route, Router } from "react-router-dom";
import InstructorLayout from "../layouts/InstructorLayout";
import InstructorRegisterPage from "../pages/Instructor/RegisterPage";
import InstructorLoginPage from "../pages/Instructor/LoginPage";
import InstructorMyCourses from "../pages/Instructor/MyCourse";
import InstructorCreateCourse from "../pages/Instructor/CreateCourse";
import InstructorCourseViewPage from "../pages/Instructor/MyCourseView";
import InstructorCourseEditPage from "../pages/Instructor/EditCourse";
import InstructorStudentsPage from "../pages/Instructor/StudentsPage";
import InstructorDashboardPage from "../pages/Instructor/DashboardPage";

const InstructorRoutes = () => {
  return (
    <Routes>
      <Route element={<InstructorLayout />}>
        {/* Đường dẫn thực tế sẽ là /instructor/dashboard */}
        <Route path="dashboard" element={<InstructorDashboardPage />} />
        <Route path="courses" element={<InstructorMyCourses />} />
        <Route path="courses/create" element={<InstructorCreateCourse />} />
        <Route path="students" element={<InstructorStudentsPage />} />
        <Route
          path="performance"
          element={
            <div className="p-4 text-xl">Đây là trang Báo cáo doanh thu</div>
          }
        />
        <Route
          path="courses/:courseId"
          element={<InstructorCourseViewPage />}
        />
        <Route
          path="courses/:courseId/edit"
          element={<InstructorCourseEditPage />}
        />
      </Route>
      <Route path="login" element={<InstructorLoginPage />} />
      <Route path="register" element={<InstructorRegisterPage />} />
    </Routes>
  );
};

export default InstructorRoutes;
