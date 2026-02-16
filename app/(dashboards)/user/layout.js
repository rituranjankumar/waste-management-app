"use client";

import React, { useState } from "react";
import Sidebar from "../_components/Sidebar";
import DashboardTopbar from "../_components/DashboardTopbar";

export default function UserDashboardLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Sidebar role="user" isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Main Content */}
      <div className="md:ml-64">
        <DashboardTopbar setIsOpen={setIsOpen} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
