import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faUserPlus,
  faEllipsisVertical,
  faBan,
  faUnlock,
  faTrash,
  faUserShield,
  faUserGraduate,
  faChalkboardTeacher,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

// =========================================================================
// MOCK DATA: DỮ LIỆU NGƯỜI DÙNG GIẢ LẬP (Sẽ thay bằng API GET /admin/users)
// =========================================================================
const initialUsers = [
  {
    id: "USR-001",
    name: "Nguyễn Thị Mến",
    email: "mennguyen.student@gmail.com",
    role: "learner",
    status: "active",
    joinDate: "15/10/2025",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: "USR-002",
    name: "Trần Việt Anh",
    email: "vietanh.dev@gmail.com",
    role: "instructor",
    status: "active",
    joinDate: "01/11/2025",
    avatar: "https://i.pravatar.cc/150?img=14",
  },
  {
    id: "USR-003",
    name: "Lê Admin",
    email: "admin.edusync@gmail.com",
    role: "admin",
    status: "active",
    joinDate: "01/01/2025",
    avatar: "https://i.pravatar.cc/150?img=50",
  },
  {
    id: "USR-004",
    name: "Kẻ Gian Lận",
    email: "spammer.123@yahoo.com",
    role: "learner",
    status: "banned",
    joinDate: "20/02/2026",
    avatar: "https://i.pravatar.cc/150?img=33",
  },
  {
    id: "USR-005",
    name: "Phạm Giảng Viên",
    email: "pham.gv@edusync.vn",
    role: "instructor",
    status: "active",
    joinDate: "14/02/2026",
    avatar: "https://i.pravatar.cc/150?img=68",
  },
];

const AdminUserManagement = () => {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

  // =========================================================================
  // LOGIC THỐNG KÊ & BỘ LỌC
  // =========================================================================
  const stats = {
    total: users.length,
    instructors: users.filter((u) => u.role === "instructor").length,
    learners: users.filter((u) => u.role === "learner").length,
    banned: users.filter((u) => u.status === "banned").length,
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // =========================================================================
  // LOGIC HÀNH ĐỘNG (Sẽ gọi API ở đây)
  // =========================================================================
  const toggleUserStatus = (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "banned" : "active";
    setUsers(
      users.map((user) =>
        user.id === id ? { ...user, status: newStatus } : user,
      ),
    );
    setOpenActionMenuId(null);
    // TODO: Bắn API cập nhật trạng thái xuống Backend
    alert(`Đã ${newStatus === "banned" ? "khóa" : "mở khóa"} người dùng!`);
  };

  const deleteUser = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này?")) {
      setUsers(users.filter((user) => user.id !== id));
      setOpenActionMenuId(null);
      // TODO: Bắn API Delete xuống Backend
    }
  };

  // =========================================================================
  // CÁC HÀM TIỆN ÍCH (RENDER BADGES)
  // =========================================================================
  const renderRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg flex items-center gap-1.5 w-max">
            <FontAwesomeIcon icon={faUserShield} /> Quản trị viên
          </span>
        );
      case "instructor":
        return (
          <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg flex items-center gap-1.5 w-max">
            <FontAwesomeIcon icon={faChalkboardTeacher} /> Giảng viên
          </span>
        );
      case "learner":
        return (
          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg flex items-center gap-1.5 w-max">
            <FontAwesomeIcon icon={faUserGraduate} /> Học viên
          </span>
        );
      default:
        return null;
    }
  };

  const renderStatusBadge = (status) => {
    return status === "active" ? (
      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1.5 w-max">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>{" "}
        Hoạt động
      </span>
    ) : (
      <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg flex items-center gap-1.5 w-max">
        <FontAwesomeIcon icon={faBan} /> Đã khóa
      </span>
    );
  };

  // =========================================================================
  // GIAO DIỆN CHÍNH
  // =========================================================================
  return (
    <div className="flex-1 p-6 sm:p-8 bg-slate-50 min-h-screen font-sans animate-fade-slide-up">
      {/* HEADER & THÊM MỚI */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Quản lý Người dùng
          </h1>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Theo dõi, phân quyền và quản lý tài khoản trên toàn hệ thống.
          </p>
        </div>
        <button className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition duration-300 shadow-sm shadow-blue-600/20 flex items-center gap-2 active:scale-95">
          <FontAwesomeIcon icon={faUserPlus} /> Thêm người dùng
        </button>
      </div>

      {/* WIDGETS THỐNG KÊ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Tổng người dùng",
            value: stats.total,
            icon: faUsers,
            color: "text-blue-600",
            bg: "bg-blue-100",
          },
          {
            label: "Học viên",
            value: stats.learners,
            icon: faUserGraduate,
            color: "text-emerald-600",
            bg: "bg-emerald-100",
          },
          {
            label: "Giảng viên",
            value: stats.instructors,
            icon: faChalkboardTeacher,
            color: "text-purple-600",
            bg: "bg-purple-100",
          },
          {
            label: "Tài khoản bị khóa",
            value: stats.banned,
            icon: faBan,
            color: "text-red-600",
            bg: "bg-red-100",
          },
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

      {/* VÙNG CHỨA BẢNG VÀ BỘ LỌC */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden relative">
        {/* THANH CÔNG CỤ LỌC & TÌM KIẾM */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-3 text-slate-400"
            />
            <input
              type="text"
              placeholder="Tìm tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-40">
              <FontAwesomeIcon
                icon={faFilter}
                className="absolute left-3 top-3 text-slate-400 text-xs"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none cursor-pointer"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="learner">Học viên</option>
                <option value="instructor">Giảng viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 md:w-40 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
            >
              <option value="all">Mọi trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="banned">Bị khóa</option>
            </select>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU (DATA TABLE) */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-extrabold">
                <th className="p-5 w-16 text-center">ID</th>
                <th className="p-5">Người dùng</th>
                <th className="p-5">Vai trò</th>
                <th className="p-5">Trạng thái</th>
                <th className="p-5">Ngày tham gia</th>
                <th className="p-5 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="p-5 text-center text-sm font-bold text-slate-400">
                      {user.id.replace("USR-", "#")}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {user.name}
                          </p>
                          <p className="text-xs font-medium text-slate-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">{renderRoleBadge(user.role)}</td>
                    <td className="p-5">{renderStatusBadge(user.status)}</td>
                    <td className="p-5 text-sm font-medium text-slate-600">
                      {user.joinDate}
                    </td>
                    <td className="p-5 text-center relative">
                      <button
                        onClick={() =>
                          setOpenActionMenuId(
                            openActionMenuId === user.id ? null : user.id,
                          )
                        }
                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                      </button>

                      {/* Dropdown Menu Hành động */}
                      {openActionMenuId === user.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenActionMenuId(null)}
                          ></div>
                          <div className="absolute right-8 top-10 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden animate-fade-slide-up">
                            {user.role !== "admin" && (
                              <button
                                onClick={() =>
                                  toggleUserStatus(user.id, user.status)
                                }
                                className={`w-full text-left px-4 py-2.5 text-sm font-bold transition-colors flex items-center gap-2 ${
                                  user.status === "active"
                                    ? "text-amber-600 hover:bg-amber-50"
                                    : "text-emerald-600 hover:bg-emerald-50"
                                }`}
                              >
                                <FontAwesomeIcon
                                  icon={
                                    user.status === "active" ? faBan : faUnlock
                                  }
                                  className="w-4"
                                />
                                {user.status === "active"
                                  ? "Khóa tài khoản"
                                  : "Mở khóa"}
                              </button>
                            )}
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-slate-100"
                            >
                              <FontAwesomeIcon icon={faTrash} className="w-4" />
                              Xóa vĩnh viễn
                            </button>
                          </div>
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
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
