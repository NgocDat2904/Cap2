// file này đóng vai trò bảo vệ , check xem người dùng đã đăng nhập chưa, nếu chưa thì đá văng về trang login

import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // 1. Kiểm tra xem trong bộ nhớ trình duyệt đã có vé (access_token) chưa
  const token = localStorage.getItem("access_token");

  // 2. Nếu chưa có vé (chưa đăng nhập) -> Đá văng về trang Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 3. Nếu có vé rồi -> Mở cổng cho phép đi tiếp vào giao diện bên trong (<Outlet />)
  return <Outlet />;
};

export default ProtectedRoute;

// import vào LearnerRoutes.jsx
