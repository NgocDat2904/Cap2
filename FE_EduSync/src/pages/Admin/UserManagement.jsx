import React, { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faEllipsisVertical,
  faBan,
  faUnlock,
  faUserShield,
  faUserGraduate,
  faChalkboardTeacher,
  faUsers,
  faSpinner,
  faExclamationTriangle,
  faChevronLeft,
  faChevronRight,
  faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { adminGetUsersAPI, adminToggleBlockAPI } from "../../services/userAPI";

// =========================================================================
// HELPER: Lấy token từ localStorage (giống pattern các trang khác)
// =========================================================================
const getToken = () => localStorage.getItem("access_token");

// =========================================================================
// HELPER: Avatar mặc định khi null / rỗng
// =========================================================================
const DEFAULT_AVATAR = `https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=80`;

const getAvatarSrc = (avatar, name) => {
  if (avatar && avatar.trim() !== "") return avatar;
  const encoded = encodeURIComponent(name || "?");
  return `${DEFAULT_AVATAR}&name=${encoded}`;
};

// =========================================================================
// HELPER: Normalize role về chữ thường (API có thể trả "INSTRUCTOR")
// =========================================================================
const normalizeRole = (role) => (role || "").toLowerCase();

// =========================================================================
// COMPONENT BADGE
// =========================================================================
const RoleBadge = ({ role }) => {
  const r = normalizeRole(role);
  if (r === "admin")
    return (
      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg flex items-center gap-1.5 w-max">
        <FontAwesomeIcon icon={faUserShield} /> Administrator
      </span>
    );
  if (r === "instructor")
    return (
      <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg flex items-center gap-1.5 w-max">
        <FontAwesomeIcon icon={faChalkboardTeacher} /> Instructor
      </span>
    );
  return (
    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1.5 w-max">
      <FontAwesomeIcon icon={faUserGraduate} /> Learner
    </span>
  );
};

const StatusBadge = ({ status }) =>
  status === "active" ? (
    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1.5 w-max">
      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
      Active
    </span>
  ) : (
    <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg flex items-center gap-1.5 w-max">
      <FontAwesomeIcon icon={faBan} /> Blocked
    </span>
  );

// =========================================================================
// MAIN COMPONENT
// =========================================================================
const AdminUserManagement = () => {
  // --- State dữ liệu ---
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    learners: 0,
    instructors: 0,
    admins: 0,
    blocked: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // --- State UI ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null); // ID đang xử lý block/unblock
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

  // --- State bộ lọc (server-side) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce ref cho search
  const searchDebounceRef = useRef(null);

  // =========================================================================
  // FETCH DATA
  // =========================================================================
  const fetchUsers = useCallback(async (params) => {
    const token = getToken();
    if (!token) {
      setError("You are not logged in or do not have admin access.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetUsersAPI(token, params);
      setUsers(data.users || []);
      setStats(data.stats || {});
      setPagination(data.pagination || { page: 1, limit: 10, total: 0 });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Cannot load user data.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Gọi API mỗi khi filter/page thay đổi
  useEffect(() => {
    fetchUsers({
      q: searchTerm,
      role: roleFilter,
      status: statusFilter,
      page: currentPage,
      limit: pagination.limit,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter, currentPage]);

  // Debounce search 400ms
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers({
        q: val,
        role: roleFilter,
        status: statusFilter,
        page: 1,
        limit: pagination.limit,
      });
    }, 400);
  };

  const handleRoleChange = (e) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // =========================================================================
  // HÀM REFRESH/RESET (Giống hệt trang AdminCourseManagement)
  // =========================================================================
  const handleRefresh = () => {
    // 1. Đưa tất cả các filters về rỗng (trạng thái mặc định)
    setSearchTerm("");
    setRoleFilter("");
    setStatusFilter("");
    setCurrentPage(1);
    
    // 2. Fetch API ngay lập tức với các thông số rỗng
    fetchUsers({
      q: "",
      role: "",
      status: "",
      page: 1,
      limit: pagination.limit,
    });
  };

  // =========================================================================
  // TOGGLE BLOCK / UNBLOCK
  // =========================================================================
  const handleToggleBlock = async (user) => {
    setOpenActionMenuId(null);
    setTogglingId(user.id);
    const token = getToken();
    try {
      await adminToggleBlockAPI(user.id, token);
      // Cập nhật local state ngay lập tức (không cần re-fetch)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, status: u.status === "active" ? "blocked" : "active" }
            : u
        )
      );
      // Cập nhật lại thống kê blocked
      setStats((prev) => ({
        ...prev,
        blocked:
          user.status === "active" ? prev.blocked + 1 : prev.blocked - 1,
      }));
    } catch (err) {
      alert(
        err?.response?.data?.detail ||
          err?.message ||
          "Operation failed, please try again."
      );
    } finally {
      setTogglingId(null);
    }
  };

  // =========================================================================
  // PAGINATION
  // =========================================================================
  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div
      className="flex-1 p-6 sm:p-8 bg-slate-50 font-sans animate-fade-slide-up h-full"
      onClick={() => setOpenActionMenuId(null)}
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            User Management
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Monitor, assign roles and manage accounts across the platform.
          </p>
        </div>
        
        {/* NÚT REFRESH (Thêm trạng thái loading & khóa nút) */}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition duration-300 shadow-sm shadow-blue-600/20 flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <FontAwesomeIcon 
            icon={faRotateRight} 
            className={loading ? "animate-spin" : ""} 
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* WIDGETS THỐNG KÊ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users",      value: stats.totalUsers ?? 0,    icon: faUsers,             color: "text-blue-600",    bg: "bg-blue-100" },
          { label: "Learners",          value: stats.learners ?? 0,      icon: faUserGraduate,        color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "Instructors",       value: stats.instructors ?? 0,   icon: faChalkboardTeacher,   color: "text-purple-600", bg: "bg-purple-100" },
          { label: "Blocked Accounts",  value: stats.blocked ?? 0,       icon: faBan,                 color: "text-red-600",    bg: "bg-red-100" },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.bg} ${stat.color}`}
            >
              <FontAwesomeIcon icon={stat.icon} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* BẢNG + BỘ LỌC */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm relative flex flex-col h-[600px] overflow-hidden">
        {/* TOOLBAR */}
        <div
          className="sticky top-0 z-10 p-5 border-b border-slate-200 bg-slate-50/95 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search */}
          <div className="relative w-full md:w-80">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-3 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 w-full md:w-auto">
            {/* Role filter */}
            <div className="relative flex-1 md:w-44">
              <FontAwesomeIcon
                icon={faFilter}
                className="absolute left-3 top-3 text-slate-400 text-xs"
              />
              <select
                value={roleFilter}
                onChange={handleRoleChange}
                className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer"
              >
                <option value="">All roles</option>
                <option value="learner">Learner</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="flex-1 md:w-44 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        {/* TABLE BODY */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
              <FontAwesomeIcon
                icon={faRotateRight}
                className="text-3xl text-blue-500 animate-spin"
              />
              <p className="font-semibold text-sm">Loading data...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-red-500">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-3xl"
              />
              <p className="font-bold">{error}</p>
              <button
                onClick={handleRefresh}
                className="text-sm text-blue-600 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm shadow-sm">
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-extrabold">
                  <th className="p-5 text-center">ID</th>
                  <th className="p-5">User</th>
                  <th className="p-5">Role</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Joined Date</th>
                  <th className="p-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >

                    {/* ID */}
                      <td className="p-5 text-center">
    <div className="relative group/id flex items-center justify-center">
      <span
        className="block w-24 truncate text-sm font-bold text-slate-400 cursor-pointer font-mono"
        title={user.id}
      >
        {user.id}
      </span>

      {/* Tooltip hiện full ID khi hover */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 hidden group-hover/id:flex flex-col items-center animate-fade-slide-up">
        <div className="bg-slate-900 text-white text-xs font-mono px-3 py-2 rounded-xl shadow-xl whitespace-nowrap flex items-center gap-2 border border-slate-700">
          <span className="select-all">{user.id}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(user.id);
              e.currentTarget.innerText = "✓";
              setTimeout(() => { e.currentTarget.innerText = "Copy"; }, 1500);
            }}
            className="ml-1 px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-md transition-colors shrink-0"
          >
            Copy
          </button>
        </div>
        {/* Mũi tên nhỏ */}
        <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
      </div>
    </div>
  </td>
                      {/* Người dùng */}
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={getAvatarSrc(user.avatar, user.fullName)}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                            onError={(e) => {
                              e.target.src = getAvatarSrc(null, user.fullName);
                            }}
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {user.fullName || (
                                <span className="text-slate-400 italic font-normal">
                                  Not updated
                                </span>
                              )}
                            </p>
                            <p className="text-xs font-medium text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-5">
                        <RoleBadge role={user.role} />
                      </td>

                      {/* Status */}
                      <td className="p-5">
                        <StatusBadge status={user.status} />
                      </td>

                      {/* Ngày tham gia */}
                      <td className="p-5 text-sm font-medium text-slate-600">
                        {user.createdAt || (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td
                        className="p-5 text-center relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {togglingId === user.id ? (
                          <FontAwesomeIcon
                            icon={faSpinner}
                            className="animate-spin text-blue-500"
                          />
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                setOpenActionMenuId(
                                  openActionMenuId === user.id ? null : user.id
                                )
                              }
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                              <FontAwesomeIcon icon={faEllipsisVertical} />
                            </button>

                            {openActionMenuId === user.id && (
                              <div className="absolute right-8 top-10 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden animate-fade-slide-up">
                                {/* Không cho block/unblock admin */}
                                {normalizeRole(user.role) !== "admin" && (
                                  <button
                                    onClick={() => handleToggleBlock(user)}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors flex items-center gap-2 ${
                                      user.status === "active"
                                        ? "text-amber-600 hover:bg-amber-50"
                                        : "text-emerald-600 hover:bg-emerald-50"
                                    }`}
                                  >
                                    <FontAwesomeIcon
                                      icon={
                                        user.status === "active"
                                          ? faBan
                                          : faUnlock
                                      }
                                      className="w-4"
                                    />
                                    {user.status === "active"
                                      ? "Block account"
                                      : "Unblock"}
                                  </button>
                                )}

                                {normalizeRole(user.role) === "admin" && (
                                  <p className="px-4 py-2.5 text-xs text-slate-400 italic">
                                    Cannot perform actions on Admin
                                  </p>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-10 text-center text-slate-500 font-medium"
                    >
                      No users found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        {!loading && !error && totalPages > 1 && (
          <div className="border-t border-slate-200 px-5 py-3 flex items-center justify-between bg-white">
            <p className="text-xs text-slate-500 font-medium">
              Showing{" "}
              <span className="font-bold text-slate-700">
                {(currentPage - 1) * pagination.limit + 1}–
                {Math.min(currentPage * pagination.limit, pagination.total)}
              </span>{" "}
              / {pagination.total} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1
                )
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1)
                    acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`ellipsis-${idx}`} className="text-slate-400 text-sm px-1">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => goToPage(item)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition ${
                        currentPage === item
                          ? "bg-blue-600 text-white shadow-sm"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;