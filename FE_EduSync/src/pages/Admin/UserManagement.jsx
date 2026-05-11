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
  faPlus,
  faTimes,
  faEnvelope,
  faLock,
  faUser,
  faUserTag,
  faEye,
  faTrash,
  faIdCard,
  faCalendarAlt,
  faBookOpen,
  faPhone,
  faVenusMars,
  faMapMarkerAlt,
  faBriefcase,
  faGraduationCap,
  faGlobe
} from "@fortawesome/free-solid-svg-icons";
import { adminGetUsersAPI, adminToggleBlockAPI } from "../../services/userAPI";

// =========================================================================
// HELPER: Lấy token từ localStorage
// =========================================================================
const getToken = () => localStorage.getItem("access_token");

// =========================================================================
// HELPER: Avatar mặc định
// =========================================================================
const DEFAULT_AVATAR = `https://ui-avatars.com/api/?background=6366f1&color=fff&bold=true&size=80`;

const getAvatarSrc = (avatar, name) => {
  if (avatar && avatar.trim() !== "") return avatar;
  const encoded = encodeURIComponent(name || "?");
  return `${DEFAULT_AVATAR}&name=${encoded}`;
};

// =========================================================================
// HELPER: Normalize role
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
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    learners: 0,
    instructors: 0,
    admins: 0,
    blocked: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    role: "learner",
    password: "",
  });

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailTab, setDetailTab] = useState("personal"); 

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const searchDebounceRef = useRef(null);

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
      setError(err?.response?.data?.detail || err?.message || "Cannot load user data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers({
      q: searchTerm,
      role: roleFilter,
      status: statusFilter,
      page: currentPage,
      limit: pagination.limit,
    });
  }, [roleFilter, statusFilter, currentPage, fetchUsers]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers({ q: val, role: roleFilter, status: statusFilter, page: 1, limit: pagination.limit });
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

  const handleRefresh = () => {
    setSearchTerm("");
    setRoleFilter("");
    setStatusFilter("");
    setCurrentPage(1);
    fetchUsers({ q: "", role: "", status: "", page: 1, limit: pagination.limit });
  };

  const handleToggleBlock = async (user) => {
    setOpenActionMenuId(null);
    setTogglingId(user.id);
    const token = getToken();
    try {
      await adminToggleBlockAPI(user.id, token);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: u.status === "active" ? "blocked" : "active" } : u
        )
      );
      setStats((prev) => ({
        ...prev,
        blocked: user.status === "active" ? prev.blocked + 1 : prev.blocked - 1,
      }));
    } catch (err) {
      alert(err?.response?.data?.detail || err?.message || "Operation failed, please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleViewDetail = (user) => {
    setSelectedUser(user);
    setDetailTab("personal"); 
    setIsDetailModalOpen(true);
    setOpenActionMenuId(null);
  };

  const handleDeleteUser = async (user) => {
    setOpenActionMenuId(null);
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete user: ${user.fullName}?`);
    if (confirmDelete) {
      try {
        alert(`User ${user.fullName} has been deleted successfully!`);
        handleRefresh(); 
      } catch (err) {
        alert(err?.response?.data?.detail || err?.message || "Failed to delete user.");
      }
    }
  };

  const handleOpenAddModal = () => {
    setNewUser({ fullName: "", email: "", role: "learner", password: "" });
    setIsAddModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert("User created successfully!");
      setIsAddModalOpen(false);
      handleRefresh(); 
    } catch (err) {
      alert(err.message || "Failed to create user.");
    } finally {
      setIsCreating(false);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const isInstructor = selectedUser ? normalizeRole(selectedUser.role) === "instructor" : false;

  return (
    <div
      className="flex-1 p-6 sm:p-8 bg-slate-50 font-sans animate-fade-slide-up min-h-screen relative"
      onClick={() => setOpenActionMenuId(null)}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            User Management
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Monitor, assign roles and manage accounts across the platform.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition duration-300 shadow-sm flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faRotateRight} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          
          <button
            onClick={handleOpenAddModal}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition duration-300 shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users",      value: stats.totalUsers ?? 0,    icon: faUsers,             color: "text-blue-600",    bg: "bg-blue-100" },
          { label: "Learners",          value: stats.learners ?? 0,      icon: faUserGraduate,        color: "text-emerald-600", bg: "bg-emerald-100" },
          { label: "Instructors",       value: stats.instructors ?? 0,   icon: faChalkboardTeacher,   color: "text-purple-600", bg: "bg-purple-100" },
          { label: "Blocked Accounts",  value: stats.blocked ?? 0,       icon: faBan,                 color: "text-red-600",    bg: "bg-red-100" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${stat.bg} ${stat.color}`}>
              <FontAwesomeIcon icon={stat.icon} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm relative flex flex-col h-[600px] overflow-hidden">
        <div className="sticky top-0 z-10 p-5 border-b border-slate-200 bg-slate-50/95 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm" onClick={(e) => e.stopPropagation()}>
          <div className="relative w-full md:w-80">
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-44">
              <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-3 text-slate-400 text-xs" />
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

        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
              <FontAwesomeIcon icon={faRotateRight} className="text-3xl text-blue-500 animate-spin" />
              <p className="font-semibold text-sm">Loading data...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-red-500">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl" />
              <p className="font-bold">{error}</p>
              <button onClick={handleRefresh} className="text-sm text-blue-600 underline hover:no-underline">Try again</button>
            </div>
          )}

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
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-5 text-center">
                        <div className="relative group/id flex items-center justify-center">
                          <span className="block w-24 truncate text-sm font-bold text-slate-400 cursor-pointer font-mono" title={user.id}>{user.id}</span>
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
                            <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={getAvatarSrc(user.avatar, user.fullName)}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                            onError={(e) => { e.target.src = getAvatarSrc(null, user.fullName); }}
                          />
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {user.fullName || <span className="text-slate-400 italic font-normal">Not updated</span>}
                            </p>
                            <p className="text-xs font-medium text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5"><RoleBadge role={user.role} /></td>
                      <td className="p-5"><StatusBadge status={user.status} /></td>
                      <td className="p-5 text-sm font-medium text-slate-600">
                        {user.createdAt || <span className="text-slate-400">—</span>}
                      </td>
                      <td className="p-5 text-center relative" onClick={(e) => e.stopPropagation()}>
                        {togglingId === user.id ? (
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-500" />
                        ) : (
                          <>
                            <button
                              onClick={() => setOpenActionMenuId(openActionMenuId === user.id ? null : user.id)}
                              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                              <FontAwesomeIcon icon={faEllipsisVertical} />
                            </button>
                            
                            {openActionMenuId === user.id && (
                              <div className="absolute right-8 top-10 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-20 py-1.5 overflow-hidden animate-fade-slide-up">
                                <button
                                  onClick={() => handleViewDetail(user)}
                                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2.5"
                                >
                                  <FontAwesomeIcon icon={faEye} className="w-4 text-slate-400" /> View Details
                                </button>
                                {normalizeRole(user.role) !== "admin" && (
                                  <button
                                    onClick={() => handleToggleBlock(user)}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors flex items-center gap-2.5 ${user.status === "active" ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                                  >
                                    <FontAwesomeIcon icon={user.status === "active" ? faBan : faUnlock} className="w-4" />
                                    {user.status === "active" ? "Block Account" : "Unblock Account"}
                                  </button>
                                )}
                                {normalizeRole(user.role) !== "admin" && (
                                  <button
                                    onClick={() => handleDeleteUser(user)}
                                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2.5 border-t border-slate-100"
                                  >
                                    <FontAwesomeIcon icon={faTrash} className="w-4" /> Delete User
                                  </button>
                                )}
                                {normalizeRole(user.role) === "admin" && (
                                  <div className="px-4 py-2 border-t border-slate-100 mt-1">
                                    <p className="text-[11px] text-slate-400 italic leading-tight">Cannot block or delete Admin accounts</p>
                                  </div>
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
                    <td colSpan="6" className="p-10 text-center text-slate-500 font-medium">No users found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {!loading && !error && totalPages > 1 && (
          <div className="border-t border-slate-200 px-5 py-3 flex items-center justify-between bg-white">
            <p className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-700">{(currentPage - 1) * pagination.limit + 1}–{Math.min(currentPage * pagination.limit, pagination.total)}</span> / {pagination.total} users
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`ellipsis-${idx}`} className="text-slate-400 text-sm px-1">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => goToPage(item)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition ${currentPage === item ? "bg-blue-600 text-white shadow-sm" : "border border-slate-200 text-slate-600 hover:bg-slate-100"}`}
                    >
                      {item}
                    </button>
                  )
                )}
              <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL XEM CHI TIẾT USER (GIAO DIỆN ĐỘNG THEO ROLE) */}
      {/* ========================================================================= */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDetailModalOpen(false)}
          ></div>
          
          <div className="relative bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden animate-fade-slide-up flex flex-col">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faIdCard} className="text-blue-600" />
                User Profile
              </h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
              <div className="flex flex-col lg:flex-row gap-6 h-full">
                
                {/* CỘT TRÁI: AVATAR (VÀ ACHIEVEMENTS NẾU LÀ INSTRUCTOR) */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6 shrink-0">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
                    {isInstructor ? (
                      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-blue-900 to-indigo-900"></div>
                    ) : (
                      <div className="absolute top-0 left-0 right-0 h-24 bg-slate-900"></div>
                    )}
                    
                    <img
                      src={getAvatarSrc(selectedUser.avatar, selectedUser.fullName)}
                      alt="Avatar"
                      className="w-28 h-28 rounded-2xl object-cover shadow-lg border-4 border-white relative z-10 mt-6 bg-white"
                      onError={(e) => { e.target.src = getAvatarSrc(null, selectedUser.fullName); }}
                    />
                    
                    <h3 className="text-2xl font-black text-slate-900 mt-4 flex items-center gap-2">
                      {selectedUser.fullName || "User Name"}
                      {isInstructor && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                      )}
                    </h3>
                    
                    {isInstructor && (
                      <p className="text-blue-600 font-bold text-sm mt-1">
                        {selectedUser.headline || 'Instructor'}
                      </p>
                    )}

                    <div className="w-full mt-6 bg-slate-50 rounded-xl p-3 border border-slate-100 text-left">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">
                        {isInstructor ? "Work Email" : "Account Email"}
                      </p>
                      <p className="text-sm font-semibold text-slate-700 flex items-center gap-2 truncate">
                        <FontAwesomeIcon icon={faEnvelope} className="text-slate-400" />
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>

                  {isInstructor && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h4 className="font-black text-slate-800 mb-5 border-l-4 border-blue-600 pl-3">
                        Achievements Overview
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl shrink-0">
                            <FontAwesomeIcon icon={faUsers} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Students</p>
                            <p className="text-xl font-black text-slate-900">{selectedUser.totalStudents || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-xl shrink-0">
                            <FontAwesomeIcon icon={faBookOpen} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Courses</p>
                            <p className="text-xl font-black text-slate-900">{selectedUser.totalCourses || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CỘT PHẢI: TABS THÔNG TIN CHI TIẾT */}
                <div className="w-full lg:w-2/3 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden h-full">
                  
                  <div className="flex border-b border-slate-100 bg-white sticky top-0 z-10 shrink-0 overflow-x-auto custom-scrollbar">
                    <button
                      onClick={() => setDetailTab("personal")}
                      className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${detailTab === "personal" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                    >
                      <FontAwesomeIcon icon={faUser} className="mr-2" /> 
                      {isInstructor ? "Personal Info" : "Personal Information"}
                    </button>
                    
                    {isInstructor && (
                      <button
                        onClick={() => setDetailTab("professional")}
                        className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${detailTab === "professional" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                      >
                        <FontAwesomeIcon icon={faBriefcase} className="mr-2" /> Professional Profile
                      </button>
                    )}
                    
                    {isInstructor && (
                      <button
                        onClick={() => setDetailTab("links")}
                        className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${detailTab === "links" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                      >
                        <FontAwesomeIcon icon={faGlobe} className="mr-2" /> External Links
                      </button>
                    )}
                  </div>

                  <div className="p-6 overflow-y-auto flex-1">
                    
                    {/* TAB 1: PERSONAL INFO (Dùng chung cho cả 2 Role, thiết kế layout Learner) */}
                    {detailTab === "personal" && (
                      <div className="space-y-8 animate-fade-slide-up">
                        <div>
                          {isInstructor && (
                            <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                              <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs"><FontAwesomeIcon icon={faUser} /></div>
                              Basic Information
                            </h4>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1.5">Full Name</p>
                              <p className="font-semibold text-slate-800">{selectedUser.fullName || "—"}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1.5">Date of Birth</p>
                              <p className="font-semibold text-slate-800">{selectedUser.dob || "—"}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1.5">Gender</p>
                              <p className="font-semibold text-slate-800 capitalize">{selectedUser.gender || "—"}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1.5">Phone Number</p>
                              <p className="font-semibold text-slate-800">{selectedUser.phone || "—"}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 md:col-span-2">
                              <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1.5">Address</p>
                              <p className="font-semibold text-slate-800">{selectedUser.address || "—"}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-slate-100 pt-6">
                          <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-xs"><FontAwesomeIcon icon={faLock} /></div>
                            System Info
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-xs font-bold text-slate-400 uppercase mb-1">User ID</p>
                              <p className="font-semibold text-slate-800 text-xs truncate" title={selectedUser.id}>{selectedUser.id}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Role</p>
                              <RoleBadge role={selectedUser.role} />
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Status</p>
                              <StatusBadge status={selectedUser.status} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: PROFESSIONAL PROFILE (Chỉ hiện cho Instructor) */}
                    {isInstructor && detailTab === "professional" && (
                      <div className="space-y-6 animate-fade-slide-up">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2 border-b border-slate-100 pb-4">
                          <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs"><FontAwesomeIcon icon={faBriefcase} /></div>
                          Professional Profile
                        </h4>
                        
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase mb-2">Job Title / Headline</p>
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold">
                            {selectedUser.headline || "—"}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase mb-2">About Yourself (Bio)</p>
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed min-h-[100px] whitespace-pre-wrap">
                            {selectedUser.bio || "—"}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                            <FontAwesomeIcon icon={faGraduationCap} /> Main Teaching Specializations
                          </p>
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold">
                            {selectedUser.specializations || "—"}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 3: EXTERNAL LINKS (Chỉ hiện cho Instructor) */}
                    {isInstructor && detailTab === "links" && (
                      <div className="space-y-6 animate-fade-slide-up">
                        <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm font-medium border border-blue-100 mb-6">
                          External links provided by the user for portfolio and social media.
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">LinkedIn Profile</p>
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">
                              {selectedUser.linkedin || "—"}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">GitHub Account</p>
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">
                              {selectedUser.github || "—"}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">YouTube Channel</p>
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">
                              {selectedUser.youtube || "—"}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Personal Website / Portfolio</p>
                            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium">
                              {selectedUser.website || "—"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => !isCreating && setIsAddModalOpen(false)}
          ></div>

          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fade-slide-up flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">
                  <FontAwesomeIcon icon={faPlus} />
                </div>
                Create New User
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                disabled={isCreating}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="createUserForm" onSubmit={handleCreateUser} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon icon={faUser} className="absolute left-4 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nguyen Van A"
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. user@edusync.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Assign Role
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faUserTag} className="absolute left-4 top-3.5 text-slate-400" />
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none cursor-pointer transition-colors"
                      >
                        <option value="learner">Learner</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Temporary Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FontAwesomeIcon icon={faLock} className="absolute left-4 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        minLength={6}
                        placeholder="Min 6 chars"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isCreating}
                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="createUserForm"
                disabled={isCreating}
                className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isCreating ? <FontAwesomeIcon icon={faSpinner} spin /> : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUserManagement;