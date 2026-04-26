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
} from "@fortawesome/free-solid-svg-icons";
import { getInstructorCoursesAPI } from "../../services/instructorAPI";

const InstructorMyCourses = () => {
  // ==================== STATES ====================
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchCourses();
  }, []);

  // Khi allCourses hoặc filter/search thay đổi, cập nhật filteredCourses
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
        setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        setIsLoading(false);
        return;
      }
      const data = await getInstructorCoursesAPI(token);
      setAllCourses(data || []);
    } catch (err) {
      setError(err.message || "Lỗi khi tải danh sách khóa học");
      console.error("Error fetching courses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let result = allCourses;

    // Lọc theo status
    if (activeFilter !== "all") {
      result = result.filter(
        (course) => course.status.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    // Lọc theo search query
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  // ==================== SKELETON LOADER ====================
  const CourseSkeleton = () => (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-lg shadow-blue-900/5 animate-pulse">
      <div className="aspect-video bg-slate-200"></div>
      <div className="p-6 space-y-4">
        <div className="h-4 bg-slate-200 rounded w-24"></div>
        <div className="h-6 bg-slate-200 rounded w-3/4"></div>
        <div className="grid grid-cols-3 gap-2 pt-4">
          <div className="h-16 bg-slate-100 rounded"></div>
          <div className="h-16 bg-slate-100 rounded"></div>
          <div className="h-16 bg-slate-100 rounded"></div>
        </div>
      </div>
    </div>
  );

  // ==================== RENDER ====================
  return (
    <main className="animate-fade-slide-up flex-1 p-6 sm:p-8 md:p-10 bg-blue-50/50 font-sans min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            My Courses
          </h1>
          <p className="text-slate-600 mt-1.5 text-base font-medium">
            Manage, edit, and create your educational content here.
          </p>
        </div>
        <Link
          to="/instructor/courses/create"
          className="flex items-center gap-2.5 px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition duration-300 shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <FontAwesomeIcon icon={faPlus} />
          Create Course
        </Link>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-10">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-slate-400" />
          </div>
          <input
            type="search"
            placeholder="Search by course title or category..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-full bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition text-base"
          />
        </div>

        <div className="flex items-center gap-2.5 p-1.5 bg-white border border-slate-100 rounded-full shadow-inner w-full lg:w-auto justify-center sm:justify-start">
          <button
            onClick={() => handleFilterClick("all")}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition duration-300 ${
              activeFilter === "all"
                ? "text-blue-800 bg-blue-100"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterClick("published")}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition duration-300 ${
              activeFilter === "published"
                ? "text-blue-800 bg-blue-100"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Published
          </button>
          <button
            onClick={() => handleFilterClick("draft")}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition duration-300 ${
              activeFilter === "draft"
                ? "text-blue-800 bg-blue-100"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Draft
          </button>
          <button
            onClick={() => handleFilterClick("pending")}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition duration-300 ${
              activeFilter === "pending"
                ? "text-blue-800 bg-blue-100"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Pending
          </button>
        </div>
      </div>

      {/* LOADING STATE */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CourseSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ERROR STATE */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-red-600 text-3xl mb-3"
          />
          <p className="text-red-700 font-semibold">{error}</p>
          <button
            onClick={fetchCourses}
            className="mt-4 px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && !error && filteredCourses.length === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <FontAwesomeIcon
            icon={faFolderOpen}
            className="text-slate-300 text-5xl mb-4"
          />
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            {searchQuery || activeFilter !== "all"
              ? "No courses found"
              : "No courses yet"}
          </h3>
          <p className="text-slate-600 mb-6">
            {searchQuery || activeFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first course!"}
          </p>
          <Link
            to="/instructor/courses/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
          >
            <FontAwesomeIcon icon={faPlus} />
            Create Course
          </Link>
        </div>
      )}

      {/* COURSES GRID */}
      {!isLoading && !error && filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group"
            >
              {/* IMAGE */}
              <div className="relative aspect-video overflow-hidden cursor-pointer">
                <img
                  src={course.image || "https://via.placeholder.com/400x225?text=No+Image"}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-slate-200"
                />
                <span
                  className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm ${
                    course.status === "Published"
                      ? "bg-green-100 text-green-800"
                      : course.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {course.status}
                </span>
              </div>

              {/* CONTENT */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-widest">
                  <FontAwesomeIcon icon={faTag} />
                  <span className="line-clamp-1">{course.category}</span>
                </div>

                <h3 className="font-bold text-xl text-slate-950 mt-2.5 line-clamp-2 leading-tight group-hover:text-blue-700 transition cursor-pointer">
                  {course.title}
                </h3>

                <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 rounded-2xl p-4 mt-6 border border-gray-100 shadow-inner">
                  <div>
                    <div className="flex items-center justify-center gap-1.5 text-blue-600">
                      <FontAwesomeIcon icon={faUserGroup} className="text-sm" />
                      <span className="font-extrabold text-2xl text-slate-950">
                        {course.students || 0}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-semibold mt-1">
                      Students
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1.5 text-purple-600">
                      <FontAwesomeIcon icon={faBookOpen} className="text-sm" />
                      <span className="font-extrabold text-2xl text-slate-950">
                        {course.lessons || 0}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-semibold mt-1">
                      Lessons
                    </div>
                  </div>
                  <div>
                    <div className="font-extrabold text-2xl text-green-700">
                      ${parseFloat(course.price || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500 font-semibold mt-1">
                      Price
                    </div>
                  </div>
                </div>

                <hr className="my-6 border-gray-100" />

                <div className="mt-auto pt-1 flex items-center justify-between">
                  <Link
                    to={`/instructor/courses/${course.id}/edit`}
                    className="text-slate-500 hover:text-blue-600 p-2.5 rounded-lg hover:bg-blue-50 transition active:scale-90"
                    title="Edit course"
                  >
                    <FontAwesomeIcon icon={faEdit} className="text-lg" />
                  </Link>
                  <Link
                    to={`/instructor/courses/${course.id}`}
                    className="font-bold text-sm text-slate-800 hover:text-blue-700 transition hover:underline"
                  >
                    View Details
                  </Link>
                  <button
                    className="text-slate-500 hover:text-red-600 p-2.5 rounded-lg hover:bg-red-50 transition active:scale-90"
                    title="Delete course"
                    onClick={() => alert("Delete functionality coming soon")}
                  >
                    <FontAwesomeIcon icon={faTrash} className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default InstructorMyCourses;
