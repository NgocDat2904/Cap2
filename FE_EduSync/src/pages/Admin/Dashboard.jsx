import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie,
  faUsersCog,
  faBook,
  faMoneyBillWave,
  faListCheck,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const AdminDashboard = () => {
  const cards = [
    {
      title: "User Management",
      description: "View learners, instructors, and account status.",
      icon: faUsersCog,
      path: "/admin/users",
      accent: "from-blue-600 to-indigo-600",
    },
    {
      title: "Course Management",
      description: "Browse courses, pricing, and moderation.",
      icon: faBook,
      path: "/admin/courses",
      accent: "from-emerald-600 to-teal-600",
    },
    {
      title: "Course Approvals",
      description: "Review pending submissions and content updates.",
      icon: faListCheck,
      path: "/admin/approvals",
      accent: "from-amber-600 to-orange-600",
    },
    {
      title: "Revenue Report",
      description: "Financial summaries and reporting.",
      icon: faMoneyBillWave,
      path: "/admin/revenue",
      accent: "from-violet-600 to-purple-600",
    },
  ];

  return (
    <div className="animate-fade-slide-up max-w-6xl mx-auto space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <FontAwesomeIcon icon={faChartPie} className="text-2xl" />
            <span className="text-xs font-black uppercase tracking-widest">
              Overview
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Admin dashboard
          </h1>
          <p className="text-slate-600 font-medium mt-2 max-w-xl">
            Quick access to the main areas of the EduSync admin panel.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className="group bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col"
          >
            <div
              className={`h-2 bg-gradient-to-r ${card.accent} shrink-0`}
              aria-hidden
            />
            <div className="p-6 sm:p-8 flex-1 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.accent} text-white flex items-center justify-center text-xl shadow-lg`}
                >
                  <FontAwesomeIcon icon={card.icon} />
                </div>
                <span className="text-slate-400 group-hover:text-blue-600 transition-colors">
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="text-lg group-hover:translate-x-1 transition-transform"
                  />
                </span>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 group-hover:text-blue-900 transition-colors">
                  {card.title}
                </h2>
                <p className="text-slate-600 text-sm font-medium mt-2 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
