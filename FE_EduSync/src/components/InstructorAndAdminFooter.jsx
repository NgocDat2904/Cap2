import React from "react";
import { Link } from "react-router-dom";

const DashboardFooter = () => {
  return (
    <footer className="w-full py-4 px-6 border-t border-slate-200/60 mt-auto bg-transparent">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Bản quyền */}
        <div className="text-sm font-medium text-slate-400">
          © 2026 <span className="text-blue-600 font-bold">EduSync</span>. All
          rights reserved.
        </div>

        {/* Các đường link hỗ trợ */}
        <div className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-slate-400">
          <Link to="/support" className="hover:text-blue-600 transition-colors">
            Support Center
          </Link>
          <Link to="/terms" className="hover:text-blue-600 transition-colors">
            Terms of Service
          </Link>
          <Link to="/privacy" className="hover:text-blue-600 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
