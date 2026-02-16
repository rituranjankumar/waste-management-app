import Image from "next/image";
import {
  MapPin,
  User,
  Clock,
  
} from "lucide-react";

const statusStyles = {
  Pending: "bg-yellow-100 text-yellow-700",
  Assigned: "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Verified: "bg-emerald-100 text-emerald-700",
};

export default function RecentReports({ reports }) {
  if (!reports || reports.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No recent reports
      </p>
    );
  }

 // console.log("RECENT REPORTS -> ",reports)
  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report._id}
          className="flex gap-4 rounded-xl border p-4 dark:border-zinc-800"
        >
          {/* Image */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={report?.imageUrl || report?.imageUrl?.secure_url}
              alt={report.wasteType}
               width={80}
    height={80}
                
                
              loading="lazy"
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex flex-1 justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-semibold">
                {report.wasteType}
              </h3>

              <p className="text-sm text-zinc-500">
                {report.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {report.pickupLocation?.address?.city}
                </span>

                {report.workerId?.name && (
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {report.workerId.name}
                  </span>
                )}

               {report.assignedAt && <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(report.assignedAt).toLocaleString()}
                </span>}
              </div>
            </div>

            {/* Status */}
            <span
              className={`h-fit rounded-full px-3 py-1 text-xs font-medium ${
                statusStyles[report.status]
              }`}
            >
              {report.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
