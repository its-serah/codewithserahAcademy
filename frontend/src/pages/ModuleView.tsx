import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getModule, completeBlock } from "../api/endpoints";

interface ContentBlock {
  id: number;
  type: string;
  title: string | null;
  order_index: number;
  markdown_content: string | null;
  youtube_video_id: string | null;
}

interface ModuleData {
  id: number;
  title: string;
  description: string | null;
  order_index: number;
  content_blocks: ContentBlock[];
}

export default function ModuleView() {
  const { slug, moduleId } = useParams<{ slug: string; moduleId: string }>();
  const [module, setModule] = useState<ModuleData | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug || !moduleId) return;
    getModule(slug, Number(moduleId))
      .then((res) => setModule(res.data))
      .catch((err) =>
        setError(err.response?.data?.detail || "Failed to load module"),
      )
      .finally(() => setLoading(false));
  }, [slug, moduleId]);

  const handleComplete = async (blockId: number) => {
    try {
      await completeBlock(blockId);
      setCompletedIds((prev) => new Set(prev).add(blockId));
    } catch {
      /* ignore */
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800 text-sm">
          {error}
        </div>
        <Link
          to={`/courses/${slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm text-brand hover:underline"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to course
        </Link>
      </div>
    );

  if (!module) return null;

  const allCompleted =
    module.content_blocks.length > 0 &&
    module.content_blocks.every((b) => completedIds.has(b.id));

  const completedCount = module.content_blocks.filter((b) =>
    completedIds.has(b.id),
  ).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        to={`/courses/${slug}`}
        className="inline-flex items-center gap-1 text-sm text-brand hover:underline mb-6"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to course
      </Link>

      {/* Module header */}
      <div className="mb-8">
        <span className="inline-flex items-center text-xs font-semibold text-brand bg-brand-light dark:bg-brand/20 px-3 py-1 rounded-full mb-3">
          Module {module.order_index}
        </span>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {module.title}
        </h1>
        {module.description && (
          <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
            {module.description}
          </p>
        )}

        {module.content_blocks.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 max-w-xs h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all duration-500"
                style={{
                  width: `${(completedCount / module.content_blocks.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {completedCount}/{module.content_blocks.length} completed
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {module.content_blocks.map((block) => (
          <div
            key={block.id}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {block.title && (
              <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {block.title}
                </h3>
                <span className="text-xs px-2.5 py-1 bg-brand-light dark:bg-brand/20 text-brand rounded-full font-medium capitalize">
                  {block.type}
                </span>
              </div>
            )}
            <div className="p-6">
              {block.type === "video" && block.youtube_video_id && (
                <div className="aspect-video rounded-xl overflow-hidden">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${block.youtube_video_id}`}
                    title={block.title || "Video"}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              {block.type === "reading" && block.markdown_content && (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {block.markdown_content}
                  </ReactMarkdown>
                </div>
              )}
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                {completedIds.has(block.id) ? (
                  <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-semibold">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Completed
                  </span>
                ) : (
                  <button
                    onClick={() => handleComplete(block.id)}
                    className="text-sm bg-brand text-white px-5 py-2 rounded-full hover:bg-brand-dark transition-colors font-semibold shadow-sm shadow-brand/20"
                  >
                    Mark as complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {allCompleted && (
        <div className="mt-8 flex items-center gap-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-2xl border border-green-200 dark:border-green-800 px-6 py-4">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-semibold">Module complete!</p>
            <p className="text-sm opacity-80 mt-0.5">
              The next module is now unlocked. Keep going!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
