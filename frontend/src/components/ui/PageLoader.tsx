import { colors } from '../../theme/tokens';

/**
 * Page Loader Component
 * Skeleton layout for route lazy loading fallback
 */
export function PageLoader() {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.bgPrimary }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="h-12 rounded-lg animate-pulse" style={{ backgroundColor: colors.bgSecondary }} />
        
        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-lg animate-pulse"
              style={{ backgroundColor: colors.bgSecondary }}
            />
          ))}
        </div>

        {/* Main content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 rounded-lg animate-pulse" style={{ backgroundColor: colors.bgSecondary }} />
          <div className="h-96 rounded-lg animate-pulse" style={{ backgroundColor: colors.bgSecondary }} />
        </div>

        {/* Table skeleton */}
        <div className="h-64 rounded-lg animate-pulse" style={{ backgroundColor: colors.bgSecondary }} />
      </div>

      {/* Loading indicator */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg"
           style={{ backgroundColor: colors.bgCard, borderColor: colors.borderAccent, borderWidth: '1px' }}>
        <div className="w-4 h-4 rounded-full animate-spin border-2 border-t-transparent"
             style={{ borderColor: colors.neonBlue }} />
        <span style={{ color: colors.textSecondary }}>Loading...</span>
      </div>
    </div>
  );
}
