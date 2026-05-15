import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileInvoiceDollar,
  faFilter,
  faMagnifyingGlass,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faCalendarDays,
  faReceipt,
  faWallet,
  faCircleExclamation,
  faChevronRight,
  faSpinner,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { getPaymentHistoryAPI, deletePaymentHistoryAPI } from "../../services/paymentAPI";

const LearnerTransactionHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  // =========================================================================
  // LOAD DỮ LIỆU TỪ API
  // =========================================================================
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const data = await getPaymentHistoryAPI(token);
        setTransactions(data.transactions || []);
        setStats(data.stats || {
          total: 0,
          success: 0,
          pending: 0,
          failed: 0,
          total_amount: 0,
        });
      } catch (error) {
        console.error("Lỗi khi tải lịch sử giao dịch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusConfig = (status) => {
    const configs = {
      success: {
        label: "Thành công",
        icon: faCheckCircle,
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-700",
        iconColor: "text-emerald-600",
        borderColor: "border-emerald-200",
      },
      pending: {
        label: "Chờ thanh toán",
        icon: faClock,
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
        iconColor: "text-amber-600",
        borderColor: "border-amber-200",
      },
      failed: {
        label: "Thất bại",
        icon: faTimesCircle,
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        iconColor: "text-red-600",
        borderColor: "border-red-200",
      },
    };
    return configs[status] || configs.pending;
  };

  // =========================================================================
  // DELETE TRANSACTION
  // =========================================================================
  const handleDeleteTransaction = async (paymentId, courseName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa giao dịch "${courseName}" khỏi lịch sử?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      await deletePaymentHistoryAPI(paymentId, token);

      // Remove from state
      setTransactions((prev) => prev.filter((tx) => tx.id !== paymentId));

      // Update stats
      const deletedTx = transactions.find((tx) => tx.id === paymentId);
      if (deletedTx) {
        setStats((prev) => ({
          total: prev.total - 1,
          success: deletedTx.status === "success" ? prev.success - 1 : prev.success,
          failed: deletedTx.status === "failed" ? prev.failed - 1 : prev.failed,
          pending: deletedTx.status === "pending" ? prev.pending - 1 : prev.pending,
          total_amount: deletedTx.status === "success" ? prev.total_amount - deletedTx.amount : prev.total_amount,
        }));
      }

      window.alert("Đã xóa giao dịch khỏi lịch sử!");
    } catch (error) {
      console.error("Lỗi khi xóa giao dịch:", error);
      window.alert(error.response?.data?.detail || "Không thể xóa giao dịch!");
    }
  };

  const filteredTransactions = transactions
    .filter((tx) => {
      // Filter by status
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;

      // Filter by time
      if (timeFilter !== "all") {
        const txDate = new Date(tx.created_at);
        const now = new Date();
        const diffDays = Math.floor((now - txDate) / (1000 * 60 * 60 * 24));

        console.log("Debug filter:", {
          transaction: tx.transaction_id,
          created_at: tx.created_at,
          txDate: txDate,
          now: now,
          diffDays: diffDays,
          timeFilter: timeFilter
        });

        if (timeFilter === "7days" && diffDays > 7) return false;
        if (timeFilter === "30days" && diffDays > 30) return false;
        if (timeFilter === "90days" && diffDays > 90) return false;
      }

      // Filter by search keyword
      if (searchKeyword.trim()) {
        const keyword = searchKeyword.toLowerCase();
        return (
          tx.course_title?.toLowerCase().includes(keyword) ||
          tx.transaction_id?.toLowerCase().includes(keyword)
        );
      }

      return true;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // =========================================================================
  // LOADING STATE
  // =========================================================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-50 text-slate-400">
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-4xl animate-spin text-blue-500 mb-4"
        />
        <p className="font-bold">Đang tải lịch sử giao dịch...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-slide-up w-full pb-16">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <FontAwesomeIcon
                icon={faFileInvoiceDollar}
                className="text-blue-600"
              />
              Lịch sử Giao dịch
            </h1>
            <p className="text-slate-500 font-medium mt-2">
              Theo dõi tất cả các giao dịch mua khóa học của bạn trên nền tảng
            </p>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <FontAwesomeIcon
                icon={faReceipt}
                className="text-blue-600 text-xl"
              />
            </div>
            <p className="text-sm font-bold text-slate-500 mb-1">
              Tổng giao dịch
            </p>
            <h3 className="text-2xl font-black text-slate-900">
              {stats.total}
            </h3>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-emerald-600 text-xl"
              />
            </div>
            <p className="text-sm font-bold text-emerald-700 mb-1">
              Thành công
            </p>
            <h3 className="text-2xl font-black text-emerald-900">
              {stats.success}
            </h3>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 p-5 rounded-2xl border border-red-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <FontAwesomeIcon
                icon={faTimesCircle}
                className="text-red-600 text-xl"
              />
            </div>
            <p className="text-sm font-bold text-red-700 mb-1">
              Thất bại
            </p>
            <h3 className="text-2xl font-black text-red-900">
              {stats.failed}
            </h3>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <FontAwesomeIcon
                icon={faWallet}
                className="text-slate-600 text-xl"
              />
            </div>
            <p className="text-sm font-bold text-slate-500 mb-1">Tổng chi</p>
            <h3 className="text-xl font-black text-slate-900">
              {formatCurrency(stats.total_amount || stats.totalAmount || 0)}
            </h3>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-4 top-3.5 text-slate-400 text-sm"
              />
              <input
                type="text"
                placeholder="Tìm theo tên khóa học hoặc mã giao dịch..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FontAwesomeIcon
                icon={faFilter}
                className="absolute left-4 top-3.5 text-slate-400 text-sm pointer-events-none"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-11 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none appearance-none min-w-[160px]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="success">Thành công</option>
                <option value="failed">Thất bại</option>
              </select>
            </div>

            {/* Time Filter */}
            <div className="relative">
              <FontAwesomeIcon
                icon={faCalendarDays}
                className="absolute left-4 top-3.5 text-slate-400 text-sm pointer-events-none"
              />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="pl-11 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 cursor-pointer focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors outline-none appearance-none min-w-[160px]"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="7days">7 ngày qua</option>
                <option value="30days">30 ngày qua</option>
                <option value="90days">90 ngày qua</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TRANSACTIONS LIST */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <FontAwesomeIcon
            icon={faCircleExclamation}
            className="text-5xl text-slate-300 mb-4"
          />
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            Không tìm thấy giao dịch nào
          </h3>
          <p className="text-slate-500 font-medium mb-6">
            {searchKeyword || statusFilter !== "all" || timeFilter !== "all"
              ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
              : "Bạn chưa có giao dịch nào. Hãy khám phá và mua khóa học ngay!"}
          </p>
          {transactions.length === 0 && (
            <button
              onClick={() => navigate("/courses")}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-95"
            >
              Khám phá khóa học
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => {
            const statusConfig = getStatusConfig(transaction.status);

            return (
              <div
                key={transaction.id || transaction.transaction_id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Course Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        {transaction.course_thumbnail && (
                          <img
                            src={transaction.course_thumbnail}
                            alt={transaction.course_title}
                            className="w-20 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
                            {transaction.course_title || "Khóa học"}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1.5">
                              <FontAwesomeIcon icon={faReceipt} />
                              {transaction.transaction_id}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="flex items-center gap-1.5">
                              <FontAwesomeIcon icon={faCalendarDays} />
                              {formatDateTime(transaction.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Amount */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Số tiền
                        </p>
                        <p className="text-xl font-black text-slate-900">
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>

                      {/* Right: Status */}
                      <div
                        className={`px-4 py-2.5 ${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-xl flex items-center gap-2 shrink-0`}
                      >
                        <FontAwesomeIcon
                          icon={statusConfig.icon}
                          className={`${statusConfig.iconColor} text-sm`}
                        />
                        <span
                          className={`${statusConfig.textColor} font-bold text-sm whitespace-nowrap`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Delete Button */}
                        <button
                          onClick={() =>
                            handleDeleteTransaction(
                              transaction.id,
                              transaction.course_title
                            )
                          }
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all shrink-0"
                          title="Xóa khỏi lịch sử"
                        >
                          <FontAwesomeIcon icon={faTrash} className="text-sm" />
                        </button>

                        {/* View Course Button */}
                        {transaction.status === "success" &&
                          transaction.course_id && (
                            <button
                              onClick={() =>
                                navigate(`/courses/${transaction.course_id}`)
                              }
                              className="text-blue-600 hover:text-blue-700 transition-colors shrink-0"
                              title="Xem khóa học"
                            >
                              <FontAwesomeIcon
                                icon={faChevronRight}
                                className="text-lg"
                              />
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                {transaction.payment_method && (
                  <div className="px-5 sm:px-6 pb-5">
                    <div className="pt-4 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Phương thức thanh toán:{" "}
                      </span>
                      <span className="text-xs font-bold text-blue-600 uppercase">
                        {transaction.payment_method === "vnpay"
                          ? "VNPay"
                          : transaction.payment_method}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {filteredTransactions.length > 0 && (
        <div className="mt-6 text-center text-sm text-slate-500 font-medium">
          Hiển thị {filteredTransactions.length} giao dịch
          {(searchKeyword || statusFilter !== "all" || timeFilter !== "all") &&
            ` (đã lọc từ ${transactions.length} giao dịch)`}
        </div>
      )}
    </div>
  );
};

export default LearnerTransactionHistory;
