import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminLoginPage from "../pages/Admin/LoginPage";
import AdminUserManagement from "../pages/Admin/UserManagement";
import AdminCourseManagement from "../pages/Admin/CourseManagement";
import AdminCourseDetail from "../pages/Admin/CourseDetail";
import AdminRevenueReport from "../pages/Admin/RevenueReport";
import AdminProfile from "../pages/Admin/Profile";
import AdminSettings from "../pages/Admin/SystemSetting";
import AdminApprovalQueue from "../pages/Admin/ApprovalQueue";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route
            path="dashboard"
            element={
              <div className="p-4 text-xl">
                Đây là trang Dashboard tổng quan
              </div>
            }
          />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="courses" element={<AdminCourseManagement />} />
          <Route path="courses/:id/approval" element={<AdminCourseDetail />} />
          <Route path="revenue" element={<AdminRevenueReport />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="approvals" element={<AdminApprovalQueue />} />
        </Route>
      </Route>
      <Route path="login" element={<AdminLoginPage />} />
    </Routes>
  );
};

export default AdminRoutes;
