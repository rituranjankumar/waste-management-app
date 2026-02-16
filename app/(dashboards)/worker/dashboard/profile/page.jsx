"use client";

import { apiConnector } from "@/lib/apiConnector";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ProfileComponent from "@/components/ProfileComponent";
import Skeleton from "@/components/skeleton";

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);

      const res = await apiConnector("GET", "/api/profile");

      if (!res?.success) {
        throw new Error(res?.message || "Failed to fetch profile");
      }
     //   console.log("REPSONSE IS ",res)
      setUser(res.data);
    } catch (err) {
      console.error("Fetch profile error:", err);

      toast.error(
        err?.message || "Something went wrong while fetching profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  /* -------- LOADING -------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
       <Skeleton/>
      </div>
    );
  }

 
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-red-500">
          Failed to load profile
        </p>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-3xl mx-auto">
        <ProfileComponent user={user} />
      </div>
    </div>
  );
};

export default Page;
