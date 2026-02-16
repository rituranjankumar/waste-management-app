"use client"

import { apiConnector } from "@/lib/apiConnector";
 
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Clock,
  Truck,
  CheckCircle,
  BadgeCheck,
} from "lucide-react";
import RecentReports from "@/components/user/RecentReports";
import Skeleton from "@/components/skeleton";
import WasteChart from "@/components/user/WasteChart";

const STATUS_ICONS = {
  Pending: Clock,
  Assigned: Truck,
  Completed: CheckCircle,
  Verified: BadgeCheck,
};
export default function UserDashboardPage() {

    const [recentReports,setRecentReports] = useState(null);
    const [wasteTypeData,setWasteTypeData] = useState(null);
    const [statusData,setStatusData] = useState(null);
    const [loading,setLoading] = useState(true);
    const {user} = useSelector((state)=> state.auth);

    const fetchReports = async()=>
    {
       
      try{
          const res = await apiConnector("GET","/api/user/dashboard")
        //  console.log("res is ->",res)
          if(res.success){
            setRecentReports(res?.reports);
            setStatusData(res?.StatusData);
            setWasteTypeData(res?.WasteTypeData)
          }
        //  console.log("loading runnned ")
          setLoading(false)
      }catch(error)
      {
        setLoading(false)
        toast.error(error?.message);
        console.log("ERROR IN THE REPORT FETCHING IN DASHBOARD -> ",error);
      }
    }
// console.log("user is the dashboard is -> ",user)

    useEffect(()=>
    {
        fetchReports();
    },[])

    
  return (
 <div>
     {
      loading ? (<div><Skeleton/></div>):
      
      (<div className="space-y-6">
  {/* Profile */}
<div className="w-full rounded-2xl border bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
  <div className="flex items-center gap-4">
    {/* Avatar */}
    <img
      src={user?.image}
      alt={user?.name}
      className="h-20 w-20 rounded-full border-2 border-green-500 object-cover"
    />

    {/* User Info */}
    <div className="flex-1">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {user?.name}
      </h2>

      <p className="text-sm text-zinc-500">
        {user?.email}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {/* Role badge */}
        <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          {user?.role?.toUpperCase()}
        </span>

 
      </div>
    </div>
  </div>

  {/* Welcome message */}
  <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
    👋 Welcome back, <span className="font-medium">{user?.name}</span>!  
    Thanks for helping keep your city clean ♻️
  </div>
</div>


  {/* Stats */}
<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
  {statusData?.map((item) => {
    const Icon = STATUS_ICONS[item.type];

    return (
      <div
        key={item.type}
        className="flex flex-col items-center gap-2 rounded-xl border bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <Icon className="h-6 w-6 text-green-600" />
        <p className="text-sm text-zinc-500">
          {item.type}
        </p>
        <p className="text-2xl font-bold">
          {item.count}
        </p>
      </div>
    );
  })}
</div>

 
{/*  show chart  */}
<div className="rounded-2xl border bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
  <h2 className="mb-4 font-semibold">♻️ Waste Types Reported</h2>

  <WasteChart
    data={wasteTypeData}
    loading={loading}
  />
</div>

  {/* Recent Reports */}
  <div className="rounded-2xl border bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <h2 className="mb-3 font-semibold">🧾 Recent Reports</h2>
    <RecentReports reports={recentReports} />
  </div>

  {/* Tips */}
  <div className="rounded-2xl border bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
    <h2 className="mb-2 font-semibold">📸 Tips & Education</h2>
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      Take clear photos and segregate waste properly for faster pickup.
    </p>
  </div>
</div>)
    }
 </div>

  );
}
