import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faBan,
  faEye,
  faListCheck,
  faTags,
  faXmark,
  faInbox
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

// MOCK DATA: CHỈ CHỨA CÁC KHÓA HỌC PENDING
const mockPendingQueue = [
  {
    id: "CRS-102",
    title: "Java Backend Toàn tập với Spring Boot 3",
    instructor: "Nguyễn Văn Chuyên Gia",
    submittedAt: "27/03/2026 - 14:30",
    videoCount: 45,
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
  },
  {
    id: "CRS-105",
    title: "Master Tiếng Anh Giao Tiếp Trong 30 Ngày",
    instructor: "Trần Thị B",
    submittedAt: "28/03/2026 - 09:15",
    videoCount: 20,
    thumbnail: "https://images.unsplash.com/photo-1546410531-bea51804f283?w=800&q=80",
  }
];

const AdminApprovalQueue = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState(mockPendingQueue);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [priceInput, setPriceInput] = useState("");

  const openApproveModal = (course) => {
    setSelectedCourse(course);
    setPriceInput("");
    setIsModalOpen(true);
  };

  const handleConfirmApprove = (e) => {
    e.preventDefault();
    if (priceInput === "") {
      alert("Vui lòng nhập giá!");
      return;
    }
    // API: Cập nhật status thành APPROVED và set price
    alert(`✨ Khóa học "${selectedCourse.title}" đã lên sóng với giá ${priceInput} VNĐ!`);
    setQueue(queue.filter(c => c.id !== selectedCourse.id)); // Bay màu khỏi danh sách chờ
    setIsModalOpen(false);
  };

  const handleReject = (courseId) => {
    if (window.confirm("Từ chối khóa học này? Khóa học sẽ bị trả về cho Giảng viên.")) {
      // API: Cập nhật status thành REJECTED
      setQueue(queue.filter(c => c.id !== courseId)); // Bay màu khỏi danh sách chờ
    }
  };

  return (
    <div className="flex-1 p-6 sm:p-8 bg-slate-50 min-h-screen font-sans animate-fade-slide-up">
      {/* HEADER */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <FontAwesomeIcon icon={faListCheck} className="text-blue-600" />
            Hàng đợi Phê duyệt
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Giải quyết các yêu cầu xuất bản khóa học từ giảng viên.
          </p>
        </div>
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-bold text-sm border border-red-200 shadow-sm">
          Cần xử lý: <span className="text-lg">{queue.length}</span>
        </div>
      </div>

      {/* DANH SÁCH CHỜ DUYỆT */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {queue.length === 0 ? (
          // TRẠNG THÁI TRỐNG (KHI ĐÃ DUYỆT HẾT)
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-24 h-24 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center text-4xl mb-4">
              <FontAwesomeIcon icon={faInbox} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Tuyệt vời! Sếp đã hoàn thành công việc.</h3>
            <p className="text-slate-500 mt-2">Không còn khóa học nào đang chờ duyệt. Đi uống cà phê thôi! ☕</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="p-5 min-w-[300px]">Khóa học yêu cầu</th>
                  <th className="p-5">Thời gian gửi</th>
                  <th className="p-5 text-center">Số bài giảng</th>
                  <th className="p-5 text-right">Quyết định</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <img src={course.thumbnail} alt="" className="w-20 h-12 rounded-lg object-cover border border-slate-200 shadow-sm" />
                        <div>
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">{course.title}</p>
                          <p className="text-xs text-slate-500 mt-1">GV: <span className="font-semibold">{course.instructor}</span></p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-sm font-semibold text-slate-700">{course.submittedAt}</span>
                    </td>
                    <td className="p-5 text-center">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg text-sm">{course.videoCount}</span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Nút bẻ lái sang trang Xem chi tiết nội dung */}
                        <button 
                          onClick={() => navigate(`/admin/courses/${course.id}/approval`)}
                          className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faEye} /> Xem chi tiết
                        </button>
                        
                        {/* Nút Mở Modal Duyệt nhanh */}
                        <button 
                          onClick={() => openApproveModal(course)}
                          className="px-4 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-500 hover:text-white transition-colors text-sm flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faCheckCircle} /> Phê duyệt
                        </button>

                        <button 
                          onClick={() => handleReject(course.id)}
                          className="w-9 h-9 flex items-center justify-center bg-red-50 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <FontAwesomeIcon icon={faBan} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DUYỆT & ĐỊNH GIÁ (GIỮ NGUYÊN NHƯ CŨ) */}
      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-slide-up">
            <div className="bg-emerald-600 p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black mb-1">Xác nhận Xuất bản</h3>
                <p className="text-emerald-100 text-sm font-medium line-clamp-1">{selectedCourse.title}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-200 hover:text-white">
                <FontAwesomeIcon icon={faXmark} className="text-2xl" />
              </button>
            </div>
            <form onSubmit={handleConfirmApprove} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faTags} className="text-slate-400" /> Giá bán (VNĐ)
                </label>
                <input
                  type="number" min="0" required value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="Nhập giá (0 = Miễn phí)"
                  className="w-full text-lg px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/30">Lên sóng</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalQueue;