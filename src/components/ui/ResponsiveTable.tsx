import { ReactNode } from "react";

interface Column {
  header: string;
  key: string;
  className?: string;
  render?: (value: any, row: any) => ReactNode;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
}

export default function ResponsiveTable({ columns, data, onRowClick }: ResponsiveTableProps) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-sm font-medium text-gray-900 ${column.className || ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? "hover:bg-gray-50 cursor-pointer" : ""}
              >
                {columns.map((column) => (
                  <td key={column.key} className={`px-4 py-3 text-sm ${column.className || ""}`}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((row, index) => (
          <div
            key={index}
            onClick={() => onRowClick?.(row)}
            className={`bg-white border border-gray-200 rounded-lg p-4 ${
              onRowClick ? "cursor-pointer hover:shadow-md transition" : ""
            }`}
          >
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm font-medium text-gray-600">{column.header}</span>
                <span className={`text-sm ${column.className || "text-gray-900"}`}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
