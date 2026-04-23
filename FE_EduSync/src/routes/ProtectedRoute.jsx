import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const normalize = (value) => {
  if (!value) return "";
  let str = value;
  if (typeof str !== "string") str = String(str);
  // nếu value là JSON string từ setItem(JSON.stringify(...))
  try {
    const parsed = JSON.parse(str);
    if (typeof parsed === "string") str = parsed;
  } catch (error) {
    // ignore
  }
  return str.trim().replace(/"/g, "").toLowerCase();
};

const ProtectedRoute = ({ allowedRoles }) => {
  const token = normalize(localStorage.getItem("access_token"));
  const userRole = normalize(localStorage.getItem("user_role"));
  const location = useLocation();

  if (!token) {
    if (location.pathname.includes("/instructor")) {
      return <Navigate to="/instructor/login" replace />;
    }
    if (location.pathname.includes("/admin")) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  const allowed =
    !allowedRoles ||
    (Array.isArray(allowedRoles)
      ? allowedRoles.map(normalize).includes(userRole)
      : normalize(allowedRoles) === userRole);

  if (!allowed) {
    alert("Bạn không có quyền truy cập vào khu vực này!");
    if (userRole === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (userRole === "instructor")
      return <Navigate to="/instructor/dashboard" replace />;
    return <Navigate to="/home" replace />;
  }

  // Nếu đang ở /login /instructor/login /admin/login mà đã login đúng role
  if (
    location.pathname.includes("instructor/login") &&
    userRole === "instructor"
  ) {
    return <Navigate to="/instructor/dashboard" replace />;
  }
  if (location.pathname.includes("admin/login") && userRole === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
