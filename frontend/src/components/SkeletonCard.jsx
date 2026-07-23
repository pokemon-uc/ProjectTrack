export default function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-gray-100 rounded mb-2"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-gray-200 rounded w-16" />
        <div className="h-8 bg-gray-200 rounded w-16" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-100 flex gap-8">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-24" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-gray-50 flex gap-8">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-3 bg-gray-100 rounded" style={{ width: `${60 + j * 20}px` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="w-60 bg-slate-900 animate-pulse" />
      <div className="flex-1 p-8">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-100 rounded w-64 mb-8 animate-pulse" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white border border-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-white border border-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}
