import React from "react";

export function PageSkeleton({ className = "" }) {
  return (
    <div className={`min-h-[calc(100vh-200px)] py-6 bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-8 w-48 bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
            >
              <div className="h-40 bg-gray-100 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-full bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title = "Nothing here yet",
  subtitle = "Check back later",
  icon = "📭",
  action,
  className = "",
}) {
  return (
    <div
      className={`bg-gray-50 rounded-xl p-10 text-center text-gray-600 ${className}`}
    >
      <div className="text-5xl mb-2">{icon}</div>
      <p className="text-xl font-semibold mb-1">{title}</p>
      <p className="text-sm">{subtitle}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function InlineLoader({ text = "Loading...", className = "" }) {
  return (
    <div
      className={`flex items-center justify-center py-10 text-gray-500 ${className}`}
    >
      <span className="w-2.5 h-2.5 rounded-full bg-gray-400 animate-pulse mr-2" />
      {text}
    </div>
  );
}
