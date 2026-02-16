"use client"
import { wasteTypes } from "@/lib/hardcodedData/wasteType";


export default function WasteTypeSelector({selected,setSelected}) {
 

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {wasteTypes.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item.id)}
            className={`flex flex-col items-center gap-2 rounded-lg border p-4
              ${
                selected === item.id
                  ? "border-green-600 bg-green-50 dark:bg-green-100 dark:text-zinc-950"
                  : "hover:border-zinc-400"
              }`}
          >
            <Icon className={`h-8 w-8 ${item.color}`} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
