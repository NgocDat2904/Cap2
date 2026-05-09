import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import {
  faSearch,
  faPlus,
  faEdit,
  faTrash,
  faBookOpen,
  faUserGroup,
  faTag,
  faSpinner,
  faExclamationTriangle,
  faFolderOpen,
  faEye
} from "@fortawesome/free-solid-svg-icons";
import { getInstructorCoursesAPI, deleteCourseAPI } from "../../services/instructorAPI";

const InstructorMyCourses = () => {
  // ==================== STATES ====================
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allCourses, searchQuery, activeFilter]);

  // ==================== FUNCTIONS ====================
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Token not found. Please log in again.");
        setIsLoading(false);
        return;
      }
      const data = await getInstructorCoursesAPI(token);
      setAllCourses(data || []);
    } catch (err) {
      setError(err.message || "Error loading course list");
      console.error("Error fetching courses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = allCourses;

    if (activeFilter !== "all") {
      result = result.filter(
        (course) => course.status.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query)
      );
    }

    setFilteredCourses(result);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;

    try {
      setDeletingId(courseId);
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        return;
      }
      await deleteCourseAPI(courseId, token);
      setAllCourses(prev => prev.filter(c => c.id !== courseId));
    } catch (err) {
      setError(err.message || "Error deleting course");
      console.error("Error deleting course:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // ==================== HELPER COMPONENTS ====================
  // Format tiền chuyên nghiệp
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);
  };

  // Status Badge chuẩn UI/UX Dashboard
  const StatusBadge = ({ status }) => {
    const normalizedStatus = status?.toLowerCase() || "draft";
    let styles = {
      published: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20",
      dot_published: "bg-emerald-500",
      pending: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20",
      dot_pending: "bg-amber-500",
      draft: "bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/20",
      dot_draft: "bg-slate-500"
    };

    const currentStyle = styles[normalizedStatus] || styles.draft;
    const dotStyle = styles[`dot_${normalizedStatus}`] || styles.dot_draft;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${currentStyle}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`}></span>
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  // ==================== SKELETON LOADER ====================
  const CourseSkeleton = () => (
    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm animate-pulse flex flex-col">
      <div className="aspect-[4/3] bg-slate-100"></div>
      <div className="p-5 flex-1 space-y-4">
        <div className="flex justify-between">
          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 rounded-md w-1/5"></div>
        </div>
        <div className="h-5 bg-slate-200 rounded w-full"></div>
        <div className="h-5 bg-slate-200 rounded w-2/3"></div>
        <div className="pt-4 flex gap-4">
          <div className="h-8 bg-slate-100 rounded flex-1"></div>
          <div className="h-8 bg-slate-100 rounded flex-1"></div>
        </div>
      </div>
    </div>
  );

  // ==================== RENDER ====================
  return (
    <main className="animate-fade-slide-up flex-1 p-6 sm:p-8 md:p-10 bg-[#fafafa] font-sans min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Course Management
            </h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">
              Create, edit, and monitor the performance of your courses.
            </p>
          </div>
          <Link
            to="/instructor/courses/create"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-all duration-300 shadow-sm active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} />
            Create Course
          </Link>
        </div>

        {/* ================= SEARCH & FILTER BAR ================= */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input chuẩn SaaS */}
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-slate-400 text-sm" />
            </div>
            <input
              type="search"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 bg-white border border-slate-200/80 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-800 outline-none shadow-sm placeholder:text-slate-400"
            />
          </div>

          {/* Segmented Control Filter (Đẳng cấp hơn dạng nút rời rạc) */}
          <div className="inline-flex bg-slate-100/80 p-1 rounded-lg border border-slate-200/50 w-full md:w-auto">
            {["all", "published", "pending", "draft"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 capitalize ${
                  activeFilter === filter
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* ================= STATES ================= */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <CourseSkeleton key={i} />)}
          </div>
        )}

        {error && !isLoading && (
          <div className="bg-red-50/50 border border-red-100 rounded-xl p-5 flex items-start gap-4">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-xl mt-0.5" />
            <div>
              <h4 className="text-red-800 font-bold text-sm">Failed to load courses</h4>
              <p className="text-red-600/80 text-sm mt-1 mb-3">{error}</p>
              <button
                onClick={fetchCourses}
                className="px-4 py-1.5 bg-white border border-red-200 text-red-600 text-xs font-bold rounded-md hover:bg-red-50 transition-colors shadow-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!isLoading && !error && filteredCourses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-dashed border-slate-300 rounded-2xl">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FontAwesomeIcon icon={faFolderOpen} className="text-slate-400 text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {searchQuery || activeFilter !== "all" ? "No matches found" : "No courses created yet"}
            </h3>
            <p className="text-slate-500 text-sm mb-6 text-center max-w-sm">
              {searchQuery || activeFilter !== "all"
                ? "We couldn't find any courses matching your current filters. Try adjusting them."
                : "Your dashboard is looking a bit empty. Start creating your first course to share your knowledge!"}
            </p>
            {!(searchQuery || activeFilter !== "all") && (
              <Link
                to="/instructor/courses/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                <FontAwesomeIcon icon={faPlus} />
                Create First Course
              </Link>
            )}
          </div>
        )}

        {/* ================= COURSES GRID ================= */}
        {!isLoading && !error && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col group relative"
              >
                {/* IMAGE & BADGE */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img
                    src={course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} // Dùng ảnh placeholder xịn hơn
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={course.status} />
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-2">
                    <FontAwesomeIcon icon={faTag} />
                    <span className="line-clamp-1">{course.category}</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-2 mb-4 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>

                  {/* MINI STATS ROW - Clean & Minimal */}
                  <div className="flex items-center gap-4 mt-auto text-sm text-slate-600 font-medium pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-1.5" title="Students enrolled">
                      <FontAwesomeIcon icon={faUserGroup} className="text-slate-400 text-xs" />
                      {course.students || 0}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                    <div className="flex items-center gap-1.5" title="Total lessons">
                      <FontAwesomeIcon icon={faBookOpen} className="text-slate-400 text-xs" />
                      {course.lessons || 0}
                    </div>
                  </div>

                  {/* FOOTER ACTIONS */}
                  <div className="flex items-center justify-between pt-4">
                    <span className="font-extrabold text-slate-900">
                      {formatCurrency(course.price)}
                    </span>
                    
                    {/* Action Toolbar */}
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/instructor/courses/${course.id || course._id}`}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View details"
                      >
                        <FontAwesomeIcon icon={faEye} className="text-sm" />
                      </Link>
                      <Link
                        to={`/instructor/courses/${course.id}/edit`}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Edit course"
                      >
                        <FontAwesomeIcon icon={faEdit} className="text-sm" />
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        disabled={deletingId === course.id}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete course"
                      >
                        <FontAwesomeIcon
                          icon={deletingId === course.id ? faSpinner : faTrash}
                          className={`text-sm ${deletingId === course.id ? "animate-spin" : ""}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default InstructorMyCourses;