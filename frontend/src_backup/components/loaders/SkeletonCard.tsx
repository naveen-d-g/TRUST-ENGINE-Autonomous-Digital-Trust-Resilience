export const SkeletonCard = () => {
  return (
    <div className="rounded-xl bg-bgCard border border-gray-800 p-6 animate-pulse">
      <div className="h-6 w-1/3 bg-gray-700 rounded mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-700/50 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-700/50 rounded"></div>
        <div className="h-4 w-4/6 bg-gray-700/50 rounded"></div>
      </div>
    </div>
  )
}
