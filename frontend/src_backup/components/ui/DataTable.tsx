import { useVirtualizer } from "@tanstack/react-virtual"
import { useRef } from "react"

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  width?: number
}

interface Props<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
  isLoading?: boolean
}

export const DataTable = <T extends { id?: string | number }>({
  data,
  columns,
  onRowClick,
  isLoading,
}: Props<T>) => {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48, // 48px row height estimate
    overscan: 5,
  })

  return (
    <div className="rounded-md border border-gray-800 bg-bgCard overflow-hidden flex flex-col h-full max-h-[600px]">
      {/* Header */}
      <div className="flex items-center bg-gray-900 border-b border-gray-800 px-4 py-3 sticky top-0 z-10 font-bold text-xs text-gray-400 uppercase tracking-widest">
        {columns.map((col, idx) => (
          <div
            key={col.key.toString() + idx}
            className="flex-1 truncate"
            style={{ width: col.width }}
          >
            {col.header}
          </div>
        ))}
      </div>

      {/* Body */}
      <div ref={parentRef} className="flex-1 overflow-auto relative">
        {isLoading ? (
             <div className="flex items-center justify-center p-8 text-neonBlue animate-pulse">
                Loading data streams...
            </div>
        ) : (
            <div
            style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
            }}
            >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const item = data[virtualRow.index]
                return (
                <div
                    key={virtualRow.key}
                    onClick={() => onRowClick?.(item)}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    className={`absolute top-0 left-0 w-full flex items-center px-4 py-3 border-b border-gray-800/50 hover:bg-white/5 cursor-pointer transition-colors ${
                       virtualRow.index % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                    }`}
                    style={{
                       transform: `translateY(${virtualRow.start}px)`,
                    }}
                >
                    {columns.map((col, idx) => (
                    <div
                        key={col.key.toString() + idx}
                        className="flex-1 truncate text-sm text-gray-300"
                        style={{ width: col.width }}
                    >
                        {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key as string] as React.ReactNode}
                    </div>
                    ))}
                </div>
                )
            })}
            </div>
        )}
        
        {!isLoading && data.length === 0 && (
            <div className="p-8 text-center text-gray-500">No records found.</div>
        )}
      </div>
    </div>
  )
}
