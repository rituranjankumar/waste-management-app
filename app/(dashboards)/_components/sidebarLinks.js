import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  User,
  Users,
  Map,
} from "lucide-react";

export const sidebarLinks = {
  user: [
    {
      title: "Dashboard",
      href: "/user/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Report",
      href: "/user/dashboard/report",
      icon: FileText,
    },
    {
      title: "Track Tasks",
      href: "/user/dashboard/track-tasks",
      icon: ClipboardList,
    },
    {
      title: "Profile",
      href: "/user/dashboard/profile",
      icon: User,
    },
  ],

  worker: [
    {
      title: "Dashboard",
      href: "/worker/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Tasks",
      href: "/worker/dashboard/tasks",
      icon: ClipboardList,
    },
    {
      title: "Profile",
      href: "/worker/dashboard/profile",
      icon: User,
    },
  ],

  admin: [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Reports",
      href: "/admin/dashboard/reports",
      icon: FileText,
    },
    {
      title: "Workers Query",
      href: "/admin/dashboard/workers-query",
      icon: Users,
    },
    {
      title: "Map",
      href: "/admin/dashboard/map",
      icon: Map,
    },
    {
      title: "Profile",
      href: "/admin/dashboard/profile",
      icon: User,
    },
  ],
};
