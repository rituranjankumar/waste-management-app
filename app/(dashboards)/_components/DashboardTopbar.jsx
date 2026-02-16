"use client";

import React from "react";
import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const DashboardTopbar = ({ setIsOpen }) => {
  const { data: session, status } = useSession();

  // console.log("sessionin the topbar is -> ",session)
  return (
    <header
      className="sticky top-0 z-20 flex h-16 w-full items-center justify-between
                 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 md:px-6"
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Mobile toggle button */}
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden rounded-lg border border-zinc-200 p-2
                     hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
        >
          <Menu size={20} />
        </button>

        <h1 className="font-semibold text-zinc-900 dark:text-zinc-100">
          Dashboard
        </h1>
      </div>

      {/* Right side – user info */}
      {status === "authenticated" && session?.user && (
       <Link href={`/${session?.user?.role.toLowerCase()}/dashboard/profile`}>
         <div  className="flex items-center gap-3">
          {/* User info   */}
          <div className="  text-right  ">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {session.user.name}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {session.user.email}
            </p>
          </div>

          {/* User avatar */}
          <img
            src={session.user.image}
            alt="User avatar"
            className="h-9 w-9 rounded-full border border-zinc-200 object-cover
                       dark:border-zinc-800"
          />
        </div>
       </Link>
      )}
    </header>
  );
};

export default DashboardTopbar;
