"use client";
import Image from 'next/image'
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
// Added to detect current page

import {
  Moon,
  Sun,
  Bell,
  LayoutDashboard,
  Menu,
  X,
  User2,
  Info,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { apiConnector } from '@/lib/apiConnector';
import Logo from "@/public/logo1.png"
import { useSelector,useDispatch } from 'react-redux';
import { setUnreadCount } from '@/store/notificationSlice';
const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const pathname = usePathname(); // Get current route
  const role = session?.user?.role;
  const router = useRouter();  
  
  
  // notification 
  const dispatch = useDispatch()
const unreadCount = useSelector((state) => state.notifications.unreadCount);
useEffect(() => {
  if (!session) return;

  const fetchUnreadCount = async () => {
    const res = await apiConnector("GET", "/api/notifications/getcount");
    if (res.success) {
      dispatch(setUnreadCount(res.unreadCount || 0));
    }
  };

  fetchUnreadCount();

  const handleVisibilityChange = () => {
    if (!document.hidden) {
      fetchUnreadCount();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  //   refresh every 2 min
  const interval = setInterval(fetchUnreadCount, 120000);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    clearInterval(interval);
  };
}, [session, dispatch]);


// window.addEventListener("visibilitychange", () => {
//   console.log("Tab is active now");
// });

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastPos = useRef(0);

  const [workerActive, setWorkerActive] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    if (role === "worker") {
      const fetchStatus = async () => {
        try {
          const res = await apiConnector("GET", "/api/worker/status");
          setWorkerActive(res.isAvailable);
        } catch (err) {
          console.log("Status fetch failed");
        }
      };
      fetchStatus();
    }
  }, [role]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const toggleNavbar = () => {
      const currentPos = window.scrollY;
      if (currentPos - lastPos.current >= 30 && currentPos > 80) {
        setVisible(false);
        setOpenMenu(false);
      } else if (lastPos.current - currentPos >= 30 || currentPos < 80) {
        setVisible(true);
      }
      if (Math.abs(currentPos - lastPos.current) >= 30) {
        lastPos.current = currentPos;
      }
    };
    window.addEventListener("scroll", toggleNavbar);
    return () => window.removeEventListener("scroll", toggleNavbar);
  }, []);

  const toggleWorkerStatus = async () => {
    setUpdating(true);
    try {
      const res = await fetch("/api/worker/status", { method: "PATCH" });
      const data = await res.json();
      setWorkerActive(data.isAvailable);
    } catch (err) {
      console.log("Update failed");
    }
    setUpdating(false);
  };

  const dashboardPath =
    role === "worker"
      ? "/worker/dashboard"
      : role === "admin"
        ? "/admin/dashboard"
        : "/user/dashboard";

  // Helper to check if link is active
  const isActive = (path) => pathname === path;

  return (
    <nav
      className={`w-full fixed top-0 left-0 z-30 px-6 py-4 
      bg-linear-to-br from-green-50 via-white to-green-100  
      dark:from-black dark:via-zinc-950 dark:to-zinc-900
      flex items-center justify-between border-b 
      border-zinc-200 dark:border-zinc-800 transition-all duration-200 ease-in-out
      ${visible ? "translate-y-0" : "-translate-y-full"}`}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-xl"
        onClick={() => setOpenMenu(false)}
      >
        <Image src={Logo} alt="logo" width={40} height={30} priority />
        <span className="text-zinc-900 dark:text-zinc-100">EcoClean</span>
      </Link>

      {/* DESKTOP NAVIGATION LINKS */}
      <div className="hidden md:flex items-center gap-8">
        <Link
          href="/aboutus"
          className={`text-sm font-semibold transition-all relative py-1
            ${isActive("/aboutus") 
              ? "text-green-600 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-green-600" 
              : "text-zinc-600 dark:text-zinc-400 hover:text-green-600"}`}
        >
          About Us
        </Link>
        <Link
          href="/#how-it-works"
          className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:text-green-600 transition-colors"
        >
          How It Works
        </Link>
      </div>

      {/* Desktop Actions */}
      <div className="hidden md:flex items-center gap-3">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 cursor-pointer rounded-lg border border-zinc-300 dark:border-zinc-700 
                       hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun size={18} className="text-yellow-400" />
            ) : (
              <Moon size={18} className="text-zinc-700" />
            )}
          </button>
        )}

        <div className="flex gap-3 items-center">
          {!mounted || status === "loading" ? (
            <div className="w-55 h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          ) : status === "unauthenticated" ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg border font-medium transition
                           border-green-600 text-green-600 hover:bg-green-600 hover:text-white
                           dark:border-green-400 dark:text-green-400 dark:hover:bg-green-500 dark:hover:text-black"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-lg font-medium transition
                           bg-green-600 text-white hover:bg-green-700
                           dark:bg-green-500 dark:text-black dark:hover:bg-green-400"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() =>
                {
                   
                   router.push("/notifications")
                }}
                className="relative cursor-pointer p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <Bell size={18} className="text-zinc-700 dark:text-zinc-200" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              <Link
                href={dashboardPath}
                className="px-4 py-2 rounded-lg border font-medium transition flex items-center gap-2
                           border-gray-300 text-gray-800 hover:bg-gray-100
                           dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              {role === "worker" && (
                <button
                  onClick={toggleWorkerStatus}
                  disabled={updating || workerActive === null}
                  className={`px-4 py-2 rounded-lg cursor-pointer font-medium transition-colors duration-200 border
                         ${workerActive
                      ? "border-green-600 text-green-700 hover:bg-green-600 hover:text-white"
                      : "border-red-500 text-red-600 hover:bg-red-500 hover:text-white"}`}
                >
                  {updating ? "Updating..." : workerActive ? "Active" : "Inactive"}
                </button>
              )}
              <button
                onClick={() => signOut()}
                className="px-4 py-2 hover:cursor-pointer rounded-lg font-medium transition-colors duration-200
                           bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:text-white"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Button Area */}
      <div className="md:hidden flex items-center gap-2">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 cursor-pointer rounded-lg border border-zinc-300 dark:border-zinc-700 transition"
          >
            {theme === "dark" ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
          </button>
        )}
        <button
          onClick={() => setOpenMenu((prev) => !prev)}
          className="p-2 rounded-lg cursor-pointer border border-zinc-300 dark:border-zinc-700 transition"
        >
          {openMenu ? <X size={18} /> : 
          
          <div className='relative  '>

            <Menu size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-5   bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
          </div>}
        </button>
      </div>

      {/* Mobile view dropdown */}
      {openMenu && (
        <div className="absolute top-full left-0 w-full md:hidden border-b border-zinc-200 dark:border-zinc-800
                        bg-linear-to-br from-green-50 via-white to-green-100 dark:from-black dark:via-zinc-950 dark:to-zinc-900">
          <div className="px-6 py-6 flex flex-col gap-4">
            
            {/* Mobile "About Us" Button-style Link */}
            <Link
              href="/aboutus"
              onClick={() => setOpenMenu(false)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all shadow-sm
                ${isActive("/aboutus") 
                  ? "  text-green-600 ring-2 ring-green-400 ring-offset-2 dark:ring-offset-zinc-900" 
                  : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 active:scale-95"}`}
            >
              <Info size={18} />
              About Us
            </Link>

            <div className="h-px bg-zinc-200 dark:bg-zinc-800 w-full my-1" />

            {!mounted || status === "loading" ? (
              <div className="w-full h-10 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            ) : status === "unauthenticated" ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpenMenu(false)}
                  className="px-4 py-2 text-center rounded-lg border border-green-600 text-green-600 font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpenMenu(false)}
                  className="px-4 py-2 text-center rounded-lg bg-green-600 text-white font-medium"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                           

                <div className="flex items-center gap-2 text-sm px-2">
                  <User2 size={16} />
                  <span className="font-medium">{session?.user?.name || "User"}</span>
                  <span className="opacity-70">({role})</span>
                </div>
                     <button
                    onClick={() => {
                      
                      setOpenMenu(false);
                      router.push("/notifications");
                    }}
                    className="w-full px-4 py-2 cursor-pointer rounded-lg border border-gray-300 flex items-center justify-between font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <Bell size={16} />
                      Notifications
                    </span>

                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                <Link
                  href={dashboardPath}
                  onClick={() => setOpenMenu(false)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 flex items-center gap-2 font-medium"
                >
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                {role === "worker" && (
                  <button
                    onClick={toggleWorkerStatus}
                    className={`px-4 py-2 rounded-lg border font-medium ${workerActive ? "border-green-600 text-green-700" : "border-red-500 text-red-600"}`}
                  >
                    {updating ? "Updating..." : workerActive ? "Active" : "Inactive"}
                  </button>
                )}
                <button
                  onClick={() => signOut()}
                  className="w-full px-4 py-2 rounded-lg bg-red-500 text-white font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;