import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const features = [
  {
    icon: "🎬",
    title: "Video Lessons",
    desc: "Watch clear, engaging walkthroughs for every concept — pause, rewind, rewatch anytime.",
  },
  {
    icon: "📈",
    title: "Structured Progress",
    desc: "Modules unlock as you complete them, keeping you on a clear, focused path.",
  },
  {
    icon: "🤝",
    title: "Student Community",
    desc: "Ask questions, share wins, and grow alongside fellow learners.",
  },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="bg-cream dark:bg-gray-900">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-24 text-center">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-brand/10 dark:bg-brand/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 w-[380px] h-[380px] rounded-full bg-brand/5 dark:bg-brand/3 blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 mb-5 px-4 py-1.5 rounded-full bg-brand-light dark:bg-brand/20 text-brand text-sm font-semibold">
            ✨ Courses are live
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-gray-900 dark:text-white">
            Learn to Code
            <br />
            <span className="text-brand">with Serah</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
            Master programming step by step. Video lessons, structured paths,
            and a community of learners behind you.
          </p>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link
              to="/courses"
              className="bg-brand text-white px-8 py-3.5 rounded-full text-base font-semibold shadow-md shadow-brand/20 hover:bg-brand-dark hover:shadow-lg hover:shadow-brand/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              Browse Courses
            </Link>
            {!user && (
              <Link
                to="/register"
                className="border-2 border-brand/25 text-brand dark:text-brand-light px-8 py-3.5 rounded-full text-base font-semibold hover:border-brand hover:bg-brand-light dark:hover:bg-brand/10 hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started Free →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 border-t border-gray-200/70 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-3">
            Everything you need to <span className="text-brand">level up</span>
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12 text-base">
            Built for beginners, loved by learners who take it seriously.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-7 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-brand/30 dark:hover:border-brand/30 hover:-translate-y-1 transition-all duration-200"
              >
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
