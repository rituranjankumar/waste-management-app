"use client";

import { apiConnector } from "@/lib/apiConnector";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Clock,
  Truck,
  CheckCircle,
  BadgeCheck,
} from "lucide-react";
import Skeleton from "@/components/skeleton";
import RecentReports from "@/components/user/RecentReports";
import WasteChart from "@/components/user/WasteChart";
import MonthlyChart from "@/components/worker/MonthlyChart";

const STATUS_ICONS = {
  Pending: Clock,
  Assigned: Truck,
  Completed: CheckCircle,
  Verified: BadgeCheck,
};

export default function WorkerDashboardPage() {
  const [recentReports, setRecentReports] = useState(null);
  const [wasteTypeData, setWasteTypeData] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalWaste, setTotalWaste] = useState(0);

  const { user } = useSelector((state) => state.auth);

  const fetchDashboard = async () => {
    try {
      const res = await apiConnector("GET", "/api/worker/dashboard");

      if (res.success) {
      //  console.log("DATA FOR DASHBOARD IS -> ", res)
        setRecentReports(res.reports);
        setStatusData(res.StatusData);
        setWasteTypeData(res.WasteTypeData);
        setMonthlyData(res.MonthlyData);
        setTotalWaste(res.TotalWaste || 0);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("WORKER DASHBOARD ERROR:", error);
    }
  };


  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div>
      {loading ? (
        <Skeleton />
      ) : (
        <div className="space-y-6">
          {/* Profile */}
          <div className="w-full rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-4">
              <img
                src={user?.image}
                alt={user?.name}
                className="h-20 w-20 rounded-full border-2 border-green-500 object-cover"
              />

              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  {user?.name}
                </h2>

                <p className="text-sm text-zinc-500">
                  {user?.email}
                </p>

                <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-700">
                  WORKER
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
              👋 Welcome back! Your work is making the city cleaner.
            </div>
          </div>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {/* Total Waste */}
            <div className="rounded-xl border bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500">Total Waste Collected</p>
              <p className="text-2xl font-bold text-green-600">
                {totalWaste} kg
              </p>
            </div>

            {/* Total Tasks */}
            <div className="rounded-xl border bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500">Total Tasks</p>
              <p className="text-2xl font-bold">
                {statusData?.reduce((sum, item) => sum + item.count, 0)}
              </p>
            </div>

           
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statusData?.map((item) => {
              const Icon = STATUS_ICONS[item.status];

              return (
                <div
                  key={item.status}
                  className="flex flex-col items-center gap-2 rounded-xl border bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <Icon className="h-6 w-6 text-green-600" />
                  <p className="text-sm text-zinc-500">
                    {item.status}
                  </p>
                  <p className="text-2xl font-bold">
                    {item.count}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Monthly Performance */}
          <div className="rounded-2xl border bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 font-semibold">
              📊 Monthly Performance (This Year)
            </h2>

            <MonthlyChart data={monthlyData} />
          </div>

          {/* Waste Type Pie */}
          <div className="rounded-2xl border bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 font-semibold">
              ♻️ Waste Collected by Type
            </h2>

            <WasteChart
              data={wasteTypeData}
              loading={loading}
            />
          </div>

          {/* Recent Tasks */}
          <div className="rounded-2xl border bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 font-semibold">
              🚚 Recent Tasks
            </h2>
            <RecentReports reports={recentReports} />
          </div>
        </div>
      )}
    </div>
  );
}
