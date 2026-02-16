"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Home, LayoutDashboard, RefreshCcw } from "lucide-react";

export default function GlobalError({ error, reset }) {
  const { data: session } = useSession();

  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  const role = session?.user?.role;

  const getDashboardPath = () => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "worker") return "/worker/dashboard";
    return "/user/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6
      bg-linear-to-br from-red-50 via-white to-orange-100
      dark:from-black dark:via-zinc-950 dark:to-zinc-900
      text-zinc-900 dark:text-zinc-100">

      <div className="text-center space-y-6 max-w-lg">

        <h1 className="text-6xl font-extrabold text-red-600">
          500
        </h1>

        <h2 className="text-2xl font-semibold">
          Something went wrong
        </h2>

        <p className="text-zinc-600 dark:text-zinc-400">
          An unexpected error occurred. Please try again.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">

          {/* Retry */}
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-3
              bg-red-600 hover:bg-red-700 text-white
              rounded-xl font-semibold transition"
          >
            <RefreshCcw size={18} />
            Try Again
          </button>

          {/* If not logged */}
          {!session && (
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-3
                border border-green-600 text-green-600
                hover:bg-green-600 hover:text-white
                rounded-xl font-semibold transition"
            >
              <Home size={18} />
              Go Home
            </Link>
          )}

          {/* If logged */}
          {session && (
            <Link
              href={getDashboardPath()}
              className="inline-flex items-center gap-2 px-5 py-3
                border border-green-600 text-green-600
                hover:bg-green-600 hover:text-white
                rounded-xl font-semibold transition"
            >
              <LayoutDashboard size={18} />
              Go to Dashboard
            </Link>
          )}

        </div>

      </div>
    </div>
  );
}
