"use client";

import { useEffect, useState } from "react";
import { apiConnector } from "@/lib/apiConnector";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Truck,
  CheckCircle,
  XCircle,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import Skeleton from "@/components/skeleton";
import { setUnreadCount } from "@/store/notificationSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

export default function NotificationsPage() {
   
    const {unreadCount} = useSelector((state) => state.notifications)
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
const dispatch = useDispatch();

  //  
  const getNotificationStyle = (type) => {
    switch (type) {
      case "WORKER_ASSIGNED":
        return {
          icon: <Truck size={18} />,
          color: "text-blue-600",
          bg: "bg-blue-100 dark:bg-blue-900/30",
        };
      case "PICKUP_COMPLETED":
        return {
          icon: <CheckCircle size={18} />,
          color: "text-green-600",
          bg: "bg-green-100 dark:bg-green-900/30",
        };
      case "PICKUP_REJECTED":
        return {
          icon: <XCircle size={18} />,
          color: "text-red-600",
          bg: "bg-red-100 dark:bg-red-900/30",
        };
      case "ADMIN_OVERRIDE":
        return {
          icon: <ShieldCheck size={18} />,
          color: "text-purple-600",
          bg: "bg-purple-100 dark:bg-purple-900/30",
        };
      case "AWAITING_CONFIRMATION":
        return {
          icon: <UserCheck size={18} />,
          color: "text-yellow-600",
          bg: "bg-yellow-100 dark:bg-yellow-900/30",
        };
      default:
        return {
          icon: <Bell size={18} />,
          color: "text-zinc-600",
          bg: "bg-zinc-100 dark:bg-zinc-800",
        };
    }
  };

  const fetchNotifications = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await apiConnector(
        "GET",
        `/api/notifications?page=${pageNumber}&limit=8`
      );

      if (res.success) {
        setNotifications(res.notifications);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.log("Fetch notifications failed");
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await apiConnector("PATCH", "/api/notifications/read-all");

    if (res.success) {
      dispatch(setUnreadCount(0));
      fetchNotifications(page);
    }
      
    } catch (err) {
      console.log("Mark read failed");
    }
  };

  

  useEffect( () => {
     fetchNotifications(page);
     
  }, [page,unreadCount]);

 

  return (
    <div className="min-h-screen p-6 bg-white dark:bg-zinc-950">

      {/* HEADER */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
  
  {/* Left Section */}
  <div className="flex items-center gap-3">
    <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
      <Bell className="text-green-600" />
      Notifications
    </h1>
  </div>

  {/* Right Section */}
  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
    
    <span className="text-sm text-zinc-500 text-left sm:text-right">
      Page {page} of {totalPages}
    </span>

    <button
      disabled={!unreadCount}
      onClick={markAllRead}
      className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto"
    >
      Mark All as Read
    </button>

  </div>
</div>


      {/* LOADING */}
      {loading && (
        <div className="space-y-4">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      )}

      {/* EMPTY */}
      {!loading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Bell size={50} className="text-zinc-400 mb-4" />
          <p className="text-zinc-500 text-lg">
            No notifications yet.
          </p>
        </div>
      )}

      {/* LIST */}
      {!loading && (
        <div className="space-y-5">
          {notifications.map((item) => {
            const style = getNotificationStyle(item.type);

            return (
              <div
                key={item._id}
                // onClick={() => handleClick(item)}
                className={`group cursor-pointer relative rounded-2xl border p-5 transition-all duration-300
                  hover:shadow-lg hover:-translate-y-1
                  ${
                    item.isRead
                      ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      : "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800"
                  }`}
              >
                {/* LEFT COLOR STRIP */}
                <div
                  className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${
                    item.isRead
                      ? "bg-zinc-300 dark:bg-zinc-700"
                      : "bg-green-500"
                  }`}
                />

                <div className="flex justify-between items-start">

                  <div className="flex gap-4">

                    {/* ICON */}
                    <div
                      className={`flex items-center justify-center h-10 w-10 rounded-full ${style.bg} ${style.color}`}
                    >
                      {style.icon}
                    </div>

                    {/* CONTENT */}
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.title}
                        </h3>

                        {!item.isRead && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-600 text-white">
                            New
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {item.message}
                      </p>

                      <div className="mt-3 flex items-center gap-6 text-xs text-zinc-500">
                        {item.relatedPickupId && (
                          <span>
                            Report ID: {item.relatedPickupId}
                          </span>
                        )}
                        <span>
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-zinc-400 group-hover:text-green-600 transition"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="mt-10 flex justify-center items-center gap-6">

          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="flex items-center gap-2 px-5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {page}
          </span>

          <button
            onClick={() =>
              setPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={page === totalPages}
            className="flex items-center gap-2 px-5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            Next
            <ChevronRight size={16} />
          </button>

        </div>
      )}
    </div>
  );
}
