export default function SkeletonCard() {
  return (
    <div className="flight-card overflow-hidden">
      {/* Top bar */}
      <div className="bg-gray-50 dark:bg-gray-700/50 px-5 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
        <div className="h-4 w-48 rounded-full shimmer dark:bg-gray-600" />
        <div className="h-3 w-24 rounded-full shimmer dark:bg-gray-600" />
      </div>

      {/* Body */}
      <div className="p-5 flex items-center gap-6">
        {/* Route */}
        <div className="flex items-center gap-6 flex-[2]">
          <div className="text-center space-y-2">
            <div className="h-7 w-14 rounded-lg shimmer dark:bg-gray-600" />
            <div className="h-3 w-8 rounded-full shimmer dark:bg-gray-600 mx-auto" />
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="h-3 w-16 rounded-full shimmer dark:bg-gray-600" />
            <div className="w-full h-px bg-gray-200 dark:bg-gray-600" />
            <div className="h-3 w-12 rounded-full shimmer dark:bg-gray-600" />
          </div>
          <div className="text-center space-y-2">
            <div className="h-7 w-14 rounded-lg shimmer dark:bg-gray-600" />
            <div className="h-3 w-8 rounded-full shimmer dark:bg-gray-600 mx-auto" />
          </div>
        </div>

        {/* Separator */}
        <div className="hidden lg:block w-px h-14 border-r border-dashed border-gray-200 dark:border-gray-600" />

        {/* Price */}
        <div className="flex-1 flex flex-col items-end gap-2">
          <div className="h-8 w-24 rounded-lg shimmer dark:bg-gray-600" />
          <div className="h-3 w-16 rounded-full shimmer dark:bg-gray-600" />
          <div className="h-5 w-20 rounded-full shimmer dark:bg-gray-600" />
        </div>

        {/* Action */}
        <div className="flex flex-col items-end gap-3">
          <div className="h-4 w-20 rounded-full shimmer dark:bg-gray-600" />
          <div className="h-9 w-24 rounded-lg shimmer dark:bg-gray-600" />
        </div>
      </div>
    </div>
  )
}
