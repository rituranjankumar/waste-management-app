"use client";

import { apiConnector } from "@/lib/apiConnector";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  UserCheck,
  User,
  Trash2,
  Clock,
  Truck,
  CheckCircle,
  BadgeCheck,
  Star,
} from "lucide-react";

import Skeleton from "@/components/skeleton";
import MonthlyChart from "@/components/worker/MonthlyChart";
import WasteChart from "@/components/user/WasteChart";
import AdminRecentReports from "@/components/admin/AdminRecentReports";

const STATUS_ICONS = {
  Pending: Clock,
  Assigned: Truck,
  Completed: CheckCircle,
  Verified: BadgeCheck,
};

export default function AdminDashboardPage() {
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);

  const [overview, setOverview] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [monthlyVerified, setMonthlyVerified] = useState(null);
  const [monthlyReported, setMonthlyReported] = useState(null);
  const [wasteDistribution, setWasteDistribution] = useState(null);
  const [topWorkers, setTopWorkers] = useState(null);
  const [latestReports, setLatestReports] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await apiConnector("GET", "/api/admin/dashboard");

      if (res.success) {
        setOverview(res.section1);
        setStatusData(res.section2);
        setMonthlyVerified(res.section3.monthlyVerified);
        setMonthlyReported(res.section3.monthlyReported);
        setWasteDistribution(res.section3.wasteDistribution);
        setTopWorkers(res.section4);
        setLatestReports(res.section5);
      }
    } catch (err) {
      console.log("ADMIN DASHBOARD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading)
    return (
      <div>
        <Skeleton />
        <Skeleton />
      </div>
    );

  return (
    <div className="space-y-8">

      {/*  ADMIN PROFILE   */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-5">
          <img
            src={overview?.admin?.image}
            alt={overview?.admin?.name}
            className="h-20 w-20 rounded-full border-4 border-green-500 object-cover"
          />

          <div className="flex-1">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {overview?.admin?.name}
            </h2>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {overview?.admin?.email}
            </p>

            <span className="mt-2 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-purple-300">
              ADMIN PANEL
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-purple-50 p-4 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
          👋 Welcome back! Monitor activity, manage workers efficiently, and ensure smooth waste collection operations.
        </div>
      </div>

      {/*   KPI CARDS  */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">

        <div className="rounded-xl border bg-white p-5 text-center shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <Trash2 className="mx-auto mb-2 h-7 w-7 text-green-600" />
          <p className="text-xs uppercase tracking-wide text-zinc-700 dark:text-zinc-100">
            Total Waste
          </p>
          <p className="text-3xl font-bold text-green-600  ">
            {overview?.totalWaste || 0} kg
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 text-center shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <BadgeCheck className="mx-auto mb-2 h-7 w-7 text-blue-600" />
          <p className="text-xs uppercase tracking-wide dark:text-zinc-100 text-zinc-500">
            Total Tasks
          </p>
          <p className="text-3xl font-bold text-blue-600">
            {overview?.totalTasks || 0}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 text-center shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <Users className="mx-auto mb-2 h-7 w-7 text-indigo-600" />
          <p className="text-xs uppercase dark:text-zinc-100 tracking-wide text-zinc-500">
            Total Users
          </p>
          <p className="text-3xl font-bold text-indigo-600">
            {overview?.totalUsers || 0}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 text-center shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <User className="mx-auto mb-2 h-7 w-7 text-orange-600" />
          <p className="text-xs uppercase dark:text-zinc-100 tracking-wide text-zinc-500">
            Total Workers
          </p>
          <p className="text-3xl font-bold text-orange-600">
            {overview?.totalWorkers || 0}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 text-center shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <UserCheck className="mx-auto mb-2 h-7 w-7 text-emerald-600" />
          <p className="text-xs dark:text-zinc-100 uppercase tracking-wide text-zinc-500">
            Active Workers
          </p>
          <p className="text-3xl font-bold text-emerald-600">
            {overview?.totalActiveWorkers || 0}
          </p>
        </div>

      </div>

      {/*  STATUS CARDS   */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statusData?.map((item) => {
          const Icon = STATUS_ICONS[item._id];

          const statusColors = {
            Pending: "text-orange-600",
            Assigned: "text-yellow-600",
            Completed: "text-blue-600",
            Verified: "text-green-600",
          };

          return (
            <div
              key={item._id}
              className="rounded-xl border bg-white p-5 text-center shadow-sm hover:shadow-md transition dark:border-zinc-800 dark:bg-zinc-900"
            >
              <Icon className={`mx-auto mb-2 h-7 w-7 ${statusColors[item._id]}`} />
              <p className="text-xs uppercase tracking-wide dark:text-zinc-100 text-zinc-500">
                {item._id}
              </p>
              <p className={`text-3xl font-bold ${statusColors[item._id]}`}>
                {item.count}
              </p>
            </div>
          );
        })}
      </div>

      {/* MONTHLY CHARTS   */}
      <div className="grid lg:grid-cols-2 gap-6">

        <div className="rounded-2xl border bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 font-semibold">
            📊 Monthly Verified (Workers)
          </h2>
          <MonthlyChart data={monthlyVerified} />
        </div>

        <div className="rounded-2xl border bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 font-semibold">
            📈 Monthly Reports (Users)
          </h2>
          <MonthlyChart data={monthlyReported} />
        </div>

      </div>

      {/*  WASTE DISTRIBUTION   */}
      <div className="rounded-2xl border bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 font-semibold">
          ♻ Waste Distribution
        </h2>
        <WasteChart data={wasteDistribution} />
      </div>

      {/*  TOP WORKERS  */}
      <div className="rounded-2xl border bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 font-semibold">
          🏆 Top Performing Workers
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topWorkers?.map((worker) => (
            <div
              key={worker.workerId}
              className="rounded-xl border p-4 dark:border-zinc-700 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={worker.image}
                  className="h-12 w-12 rounded-full object-cover"
                />

                <div>
                  <p className="font-medium">
                    {worker.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Verified: {worker.verifiedCount}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1 text-yellow-500 text-sm font-medium">
                <Star size={16} fill="currentColor" />
                {worker.avgRating?.toFixed(1)} / 5
              </div>
            </div>
          ))}
        </div>
      </div>

      {/*  LATEST REPORTS   */}
      <div className="rounded-2xl border bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 font-semibold text-lg">
          🆕 Latest Reports
        </h2>
        <AdminRecentReports reports={latestReports} />
      </div>

      {/*   ADMIN TIPS  */}
      <div className="rounded-2xl border bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 font-semibold text-lg">
          💡 Admin Tips
        </h2>

        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li>• Monitor Pending tasks to avoid delays.</li>
          <li>• Keep worker availability updated regularly.</li>
          <li>• Review low-rated workers and feedback carefully.</li>
          <li>• Encourage users to confirm completed tasks quickly.</li>
          <li>• Analyze monthly trends to improve operational efficiency.</li>
        </ul>
      </div>

    </div>
  );
}
