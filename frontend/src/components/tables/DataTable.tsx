import React, { useState } from "react"
import clsx from "clsx"

interface Column<T> {
  header: string
  accessorKey?: keyof T
  cell?: (item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  onRowClick?: (item: T) => void
  renderExpandedRow?: (item: T) => React.ReactNode
}

export const DataTable = <T extends { id: string | number }>({
  data,
  columns,
  isLoading,
  onRowClick,
  renderExpandedRow,
}: DataTableProps<T>) => {
  const [expandedRowId, setExpandedRowId] = useState<string | number | null>(null)

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-bgCard/50 animate-pulse rounded-lg border border-gray-800" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-bgCard/30 rounded-lg border border-gray-800 border-dashed">
        No data available to display
      </div>
    )
  }

  const handleRowClick = (item: T) => {
    if (renderExpandedRow) {
      setExpandedRowId(expandedRowId === item.id ? null : item.id)
    }
    if (onRowClick) {
      onRowClick(item)
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800 shadow-xl bg-bgCard/50 backdrop-blur-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-700 bg-bgSecondary/80">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={clsx(
                  "py-4 px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {data.map((item) => (
            <React.Fragment key={item.id}>
              <tr
                onClick={() => handleRowClick(item)}
                className={clsx(
                  "group hover:bg-white/5 transition-colors duration-200",
                  (onRowClick || renderExpandedRow) && "cursor-pointer",
                  expandedRowId === item.id && "bg-white/[0.03]"
                )}
              >
                {columns.map((col, idx) => (
                  <td key={idx} className="py-4 px-6 text-sm text-gray-300">
                    {col.cell
                      ? col.cell(item)
                      : (item[col.accessorKey as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
              {expandedRowId === item.id && renderExpandedRow && (
                <tr className="bg-black/20">
                  <td colSpan={columns.length} className="px-6 py-4">
                    {renderExpandedRow(item)}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
