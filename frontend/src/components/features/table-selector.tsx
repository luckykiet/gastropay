"use client"

import { useTranslations } from "next-intl"
import { X, MapPin } from "lucide-react"
import type { POSTable } from "@/types/pos"

type Props = {
  tables: POSTable[]
  onSelect: (table: POSTable) => void
  onClose: () => void
}

export function TableSelector({ tables, onSelect, onClose }: Props) {
  const t = useTranslations("table")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold">{t("selectTitle")}</h2>
            <p className="text-sm text-gray-500">{t("selectDescription")}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tables grid */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            {tables.map((table) => (
              <button
                key={table._id}
                onClick={() => onSelect(table)}
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl hover:border-[var(--gastropay-green)] hover:bg-[var(--gastropay-light)] transition"
              >
                <MapPin className="w-6 h-6 text-[var(--gastropay-green)] mb-1" />
                <span className="font-medium">{table.name}</span>
                {table.capacity && (
                  <span className="text-xs text-gray-500">
                    {table.capacity} míst
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Takeaway option */}
          <button
            onClick={() =>
              onSelect({ _id: "takeaway", name: t("takeaway") } as POSTable)
            }
            className="w-full mt-4 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition"
          >
            {t("takeaway")}
          </button>
        </div>
      </div>
    </div>
  )
}
