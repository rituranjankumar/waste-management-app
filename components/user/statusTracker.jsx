import { STATUS_STEPS } from "@/lib/hardcodedData/userReportStatusData";

export default function StatusTracker({ status }) {
  const currentIndex = STATUS_STEPS.findIndex(
    (s) => s.key === status
  );

  const progressPercent = currentIndex <= 0 ? 0 : (currentIndex / (STATUS_STEPS.length - 1)) * 100;

  return (
    <div className="w-full space-y-4">
     
      <div className="flex justify-between items-center">
        {STATUS_STEPS.map((step, idx) => {
          const active = idx <= currentIndex;

          return (
            <div
              key={step.key}
              className="flex flex-col items-center flex-1"
            >
              
              <div
                className={`h-9 w-9 flex items-center justify-center rounded-full text-sm font-semibold transition
                  ${
                    active
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600 dark:bg-zinc-700 dark:text-zinc-300"
                  }`}
              >
                {idx + 1}
              </div>

              
              <span
                className={`mt-2 text-xs text-center
                  ${
                    active
                      ? "text-green-700 dark:text-green-400 font-medium"
                      : "text-gray-500 dark:text-zinc-400"
                  }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 w-full rounded-full bg-green-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-green-600 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
