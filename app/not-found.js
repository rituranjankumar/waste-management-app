"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Home, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  const { data: session, status } = useSession();

  const role = session?.user?.role;

  const getDashboardPath = () => {
    if (role === "admin") return "/admin/dashboard";
    if (role === "worker") return "/worker/dashboard";
    return "/user/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6
      bg-linear-to-br from-green-50 via-white to-green-100
      dark:from-black dark:via-zinc-950 dark:to-zinc-900
      text-zinc-900 dark:text-zinc-100">

      <div className="text-center space-y-6 max-w-lg">

        <h1 className="text-6xl font-extrabold text-green-600">
          404
        </h1>

        <h2 className="text-2xl font-semibold">
          Page Not Found
        </h2>

        <p className="text-zinc-600 dark:text-zinc-400">
          The page you are trying to access does not exist.
        </p>

        {status === "loading" ? (
          <div className="w-40 h-10 mx-auto bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-lg" />
        ) : !session ? (
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3
              bg-green-600 hover:bg-green-700 text-white
              rounded-xl font-semibold transition"
          >
            <Home size={18} />
            Go to Home
          </Link>
        ) : (
          <Link
            href={getDashboardPath()}
            className="inline-flex items-center gap-2 px-6 py-3
              bg-green-600 hover:bg-green-700 text-white
              rounded-xl font-semibold transition"
          >
            <LayoutDashboard size={18} />
            Go to Dashboard
          </Link>
        )}

      </div>
    </div>
  );
}
