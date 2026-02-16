"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import clsx from "clsx";
import {sidebarLinks} from "./sidebarLinks"
 

const Sidebar = ({ role = "user", isOpen, setIsOpen }) => {
  const pathname = usePathname();

 // console.log("pathnameis  -> ",pathname)
  const links = sidebarLinks?.[role] || sidebarLinks.user;

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/*   Desktop Sidebar */}
      <aside
        className="hidden md:flex fixed top-0 left-0 h-screen w-64 flex-col
                   border-r border-zinc-200 dark:border-zinc-800
                   bg-white dark:bg-zinc-950"
      >
        {/* Logo / Brand */}
        <div className="h-16 px-5 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
        {/* add the logo here  */}
          <span className="text-green-600 text-xl">♻️</span>
          <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            EcoClean
          </span>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link?.href  
            if(active)
            {

          //  console.log("active tab is -> ",pathname)
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-2 rounded-xl font-medium transition",
                  active
                    ? "bg-green-600 text-white"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                )}
              >
                <Icon size={18} />
                {link.title}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500">
          Logged in as <span className="font-semibold text-green-600">{role}</span>
        </div>
      </aside>

      {/*  Mobile Sidebar toggle on outside click  */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/*   Mobile Sidebar Drawer */}
      <aside
        className={clsx(
          "fixed top-0 left-0 z-50 h-screen w-72 md:hidden flex flex-col",
          "bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800",
          "transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Top bar */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-xl">♻️</span>
            <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
              EcoClean
            </span>
          </div>

          <button
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href  ;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-2 rounded-xl font-medium transition",
                  active
                    ? "bg-green-600 text-white"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
                )}
              >
                <Icon size={18} />
                {link.title}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500">
          Logged in as <span className="font-semibold text-green-600">{role}</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
