import { Routes, Route } from "react-router-dom";
import InstructorLayout from "../layouts/InstructorLayout";

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
        <Route
          path="courses"
          element={
            <div className="p-4 text-xl">Đây là trang Danh sách khóa học</div>
          }
        />
        {/* <Route path="courses/create" element={<CreateCourse />} /> */}
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
    </Routes>
  );
};

export default InstructorRoutes;
