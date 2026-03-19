import { Routes, Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminLoginPage from "../pages/Admin/LoginPage";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route
          path="dashboard"
          element={
            <div className="p-4 text-xl">Đây là trang Dashboard tổng quan</div>
          }
        />
      </Route>
      <Route path="login" element={<AdminLoginPage />} />
    </Routes>
  );
};

export default AdminRoutes;
