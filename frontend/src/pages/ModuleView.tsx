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

  // Load existing progress
  useEffect(() => {
    if (!module) return;
    // We get progress for all blocks in this module from the course progress endpoint
    // For simplicity, just track locally what's completed
  }, [module]);

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
      <div className="p-8 text-center text-gray-500">Loading module...</div>
    );
  if (error)
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        <Link
          to={`/courses/${slug}`}
          className="mt-4 inline-block text-indigo-600 hover:underline"
        >
          Back to course
        </Link>
      </div>
    );
  if (!module) return null;

  const allCompleted = module.content_blocks.every((b) =>
    completedIds.has(b.id),
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to={`/courses/${slug}`}
        className="text-sm text-indigo-600 hover:underline"
      >
        &larr; Back to course
      </Link>
      <h1 className="text-3xl font-bold mt-4">
        Module {module.order_index}: {module.title}
      </h1>
      {module.description && (
        <p className="mt-2 text-gray-600">{module.description}</p>
      )}

      <div className="mt-8 space-y-8">
        {module.content_blocks.map((block) => (
          <div
            key={block.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            {block.title && (
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{block.title}</h3>
                <span className="text-xs px-2 py-0.5 bg-gray-200 rounded text-gray-600">
                  {block.type}
                </span>
              </div>
            )}
            <div className="p-6">
              {block.type === "video" && block.youtube_video_id && (
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${block.youtube_video_id}`}
                    title={block.title || "Video"}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              {block.type === "reading" && block.markdown_content && (
                <div className="prose prose-indigo max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {block.markdown_content}
                  </ReactMarkdown>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-100">
                {completedIds.has(block.id) ? (
                  <span className="text-green-600 text-sm font-medium">
                    Completed
                  </span>
                ) : (
                  <button
                    onClick={() => handleComplete(block.id)}
                    className="text-sm bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700"
                  >
                    Mark as Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {allCompleted && module.content_blocks.length > 0 && (
        <div className="mt-8 p-4 bg-green-50 text-green-700 rounded-lg text-center">
          Module complete! The next module is now unlocked.
        </div>
      )}
    </div>
  );
}
