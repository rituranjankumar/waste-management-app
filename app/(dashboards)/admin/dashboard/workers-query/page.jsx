"use client";

import { useEffect, useState } from "react";
import { apiConnector } from "@/lib/apiConnector";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Skeleton from "@/components/skeleton";
import { Search, Users, Star } from "lucide-react";

export default function WorkersQueryPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [topWorkers, setTopWorkers] = useState([]);

  const [searchEmail, setSearchEmail] = useState("");
  const [searchedWorker, setSearchedWorker] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

 
  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const res = await apiConnector(
        "GET",
        "/api/admin/workers-query/analytics"
      );
     //  console.log("WORKER analytisc  RESPONSE -> ",res);
      setTotalWorkers(res.totalWorkers);
      setTopWorkers(res.topWorkers || []);
      
    } catch (err) {
      toast.error("Failed to load workers overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  
  const handleSearch = async () => {
    if (!searchEmail) {
      toast.error("Enter worker email");
      return;
    }

    if (!isValidEmail(searchEmail)) {
      toast.error("Invalid email format");
      return;
    }

    try {
      setSearchLoading(true);

      const res = await apiConnector(
        "GET",
        `/api/admin/workers-query/workers?email=${searchEmail}`
      );

      setSearchedWorker(res.worker);

     // console.log("WORKER FOUND RESPONSE -> ",res);
      toast.success(res.message || "worker found");
    } catch (err) {
      setSearchedWorker(null);
      toast.error(err.message || "Worker not found");
    } finally {
      setSearchLoading(false);
    }
  };

   
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* PAGE TITLE */}
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Workers Overview
        </h1>

        {loading ? (
          <>
            <Skeleton />
            <Skeleton />
          </>
        ) : (
          <>
            {/*  STATS CARD   */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border shadow-sm">
                <div className="flex items-center gap-3">
                  <Users className="text-green-600" />
                  <div>
                    <p className="text-sm text-zinc-500">
                      Total Workers
                    </p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {totalWorkers}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/*   TOP WORKERS  */}
            <div>
              <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
                Top Performing Workers
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {topWorkers.map((worker) => (
                  <div
                    key={worker._id}
                    className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border shadow-sm space-y-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full overflow-hidden border">
                        {worker.userImage?.secure_url ? (
                          <img
                            src={worker.userImage.secure_url}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-bold bg-green-200 text-green-800">
                            {worker.name?.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {worker.name}
                        </p>

                        <p className="text-sm text-zinc-500 flex items-center gap-1">
                           
                          <strong>{worker.verifiedCount}</strong> Verified Tasks
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        router.push(
                          `/admin/dashboard/workers-query/${worker._id}`
                        )
                      }
                      className="w-full bg-green-600 cursor-pointer hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SEARCH */}
            <div className="space-y-4">

              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Search Worker by Email
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">

                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="Enter worker email"
                    value={searchEmail}
                    onChange={(e) =>
                      setSearchEmail(e.target.value)
                    }
                    className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-zinc-900"
                  />
                  <Search
                    size={16}
                    className="absolute right-3 top-3 text-zinc-400"
                  />
                </div>

                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition"
                >
                  {searchLoading ? "Searching..." : "Search"}
                </button>

              </div>

              {/* SEARCH RESULT CARD */}
                              {searchedWorker && (
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border shadow-sm mt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                      
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full overflow-hidden border">
                          {searchedWorker.userImage?.secure_url ? (
                            <img
                              src={searchedWorker.userImage.secure_url}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center font-bold bg-green-200 text-green-800">
                              {searchedWorker.name?.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {searchedWorker.name}
                          </p>
                          <p className="text-sm text-zinc-500">
                            {searchedWorker.email}
                          </p>
                        </div>
                      </div>

                     
                      <div className="flex gap-3 flex-wrap">

                        {/* VIEW DETAILS */}
                        <button
                          onClick={() =>
                            router.push(`/admin/dashboard/workers-query/${searchedWorker._id}`)
                          }
                          className="bg-green-600 cursor-pointer hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition"
                        >
                          View Details
                        </button>

                        {/* NAVIGATE */}
                        {searchedWorker.currentLocation?.geo?.coordinates && (
                          <button
                            onClick={() => {
                              const [lng, lat] =
                                searchedWorker.currentLocation.geo.coordinates;
                              window.open(
                                `https://www.google.com/maps?q=${lat},${lng}`,
                                "_blank"
                              );
                            }}
                            className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
                          >
                            Navigate
                          </button>
                        )}

                      </div>
                    </div>
                  </div>
                )}


            </div>
          </>
        )}
      </div>
    </div>
  );
}
