import { Link } from "react-router-dom";

const cards = [
  {
    to: "/admin/waitlist",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    ),
    title: "Waitlist",
    desc: "Manage approved emails allowed to register",
  },
  {
    to: "/admin/courses",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    title: "Courses",
    desc: "Create and manage courses, modules, and content blocks",
  },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-light dark:bg-brand/20 text-brand text-xs font-semibold uppercase tracking-wide">
          Admin
        </span>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="group flex items-start gap-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-brand/30 dark:hover:border-brand/30 hover:shadow-md transition-all duration-200"
          >
            <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-brand-light dark:bg-brand/20 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
              {card.icon}
            </span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white group-hover:text-brand transition-colors">
                {card.title}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {card.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
