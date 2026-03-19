import { Routes, Route } from "react-router-dom";
import InstructorLayout from "../layouts/InstructorLayout";
import InstructorRegisterPage from "../pages/Instructor/RegisterPage";
import InstructorLoginPage from "../pages/Instructor/LoginPage";
import InstructorMyCourses from "../pages/Instructor/MyCourse";
import InstructorCreateCourse from "../pages/Instructor/CreateCourse";

const InstructorRoutes = () => {
  return (
    <Routes>
      <Route element={<InstructorLayout />}>
        {/* Đường dẫn thực tế sẽ là /instructor/dashboard */}
        <Route
          path="dashboard"
          element={
            <div className="p-4 text-xl">Đây là trang Dashboard tổng quan</div>
          }
        />
        <Route path="courses" element={<InstructorMyCourses />} />
        <Route path="courses/create" element={<InstructorCreateCourse />} />
        <Route
          path="students"
          element={
            <div className="p-4 text-xl">Đây là trang Quản lý học viên</div>
          }
        />
        <Route
          path="performance"
          element={
            <div className="p-4 text-xl">Đây là trang Báo cáo doanh thu</div>
          }
        />
      </Route>
      <Route path="login" element={<InstructorLoginPage />} />
      <Route path="register" element={<InstructorRegisterPage />} />
    </Routes>
  );
};

export default InstructorRoutes;
