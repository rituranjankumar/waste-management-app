 

import Navbar from "@/components/common/navbar";
import { Eye, MapPin, CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div
      className="min-h-screen w-full 
      bg-linear-to-br from-green-50 via-white to-green-100
      dark:from-black dark:via-zinc-950 dark:to-zinc-900
      text-zinc-900 dark:text-zinc-100"
    >
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight max-w-3xl">
          Smart Waste Management for a{" "}
          <span className="text-green-600">Cleaner Tomorrow</span>
        </h1>

        <p className="mt-6 max-w-xl text-zinc-600 dark:text-zinc-400">
          Report waste, track pickup progress, and help build a cleaner and
          smarter city using technology-driven coordination.
        </p>

        <div className="mt-8 flex gap-4 flex-wrap justify-center">
          <a
            href="/signup"
            className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
          >
            Report Waste
          </a>
          <a
            href="/signup"
            className="px-6 py-3 rounded-xl border border-green-600 text-green-600 hover:bg-green-600 hover:text-white transition"
          >
            Join as Worker
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose EcoClean?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <FeatureCard
            Icon={Eye}
            title="Transparent Workflow"
            desc="From reporting to verification — every step is visible and trackable."
          />

          <FeatureCard
            Icon={MapPin}
            title="Nearest Worker Assignment"
            desc="Smart location-based assignment ensures faster and efficient waste pickup."
          />

          <FeatureCard
            Icon={CheckCircle}
            title="Verified Collection"
            desc="Photo proof and user confirmation guarantee transparency and trust."
          />

        </div>

      </section>

      {/* LIVE STATS */}
      <section className="px-6 py-16 bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">
            Our Impact So Far
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Stat number="1200+" label="Reports Submitted" />
            <Stat number="980+" label="Waste Pickups Completed" />
            <Stat number="50+" label="Active Workers" />
            <Stat number="800+" label="Verified Cleanups" />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 py-16 bg-green-50 dark:bg-zinc-900">
        <h2 className="text-3xl font-bold text-center mb-12">
          How It Works
        </h2>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <Step number="1" title="Report Waste" desc="Upload waste image and location." />
          <Step number="2" title="Worker Assigned" desc="Nearest available worker is notified." />
          <Step number="3" title="Pickup & Verify" desc="Worker completes task and you confirm." />
        </div>
      </section>

      {/* WHO CAN USE */}
      <section className="px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Who Can Use EcoClean?
        </h2>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <RoleCard
            icon="🏠"
            title="Citizens"
            desc="Report waste easily and track cleanup status in real-time."
          />
          <RoleCard
            icon="🚛"
            title="Workers"
            desc="Accept nearby tasks and contribute to a cleaner city."
          />
          <RoleCard
            icon="🛠"
            title="Administrators"
            desc="Monitor reports, workers, analytics and city-wide impact."
          />
        </div>
      </section>


      <section className="px-6 py-16 text-center bg-green-700 dark:bg-zinc-800 text-white">
        <h2 className="text-3xl font-bold">
          Ready to Make a Difference?
        </h2>

        <p className="mt-4 max-w-xl mx-auto text-green-100">
          Join EcoClean today and help build a cleaner, smarter city.
        </p>

        <div className="mt-6">
          <a
            href="/signup"
            className="px-6 py-3 rounded-xl bg-white text-green-700 font-semibold hover:bg-zinc-100 transition"
          >
            Get Started
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-6 text-center text-sm text-zinc-500">
        © {new Date().getFullYear()} EcoClean · Built for a cleaner future ♻️
      </footer>
    </div>
  );
}

/* COMPONENTS */

function FeatureCard({ Icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 
                    bg-white dark:bg-zinc-900 p-6 shadow-sm 
                    hover:shadow-lg hover:-translate-y-1 
                    transition-all duration-300">

      <div className="flex items-center justify-center h-12 w-12 
                      rounded-xl bg-green-100 dark:bg-green-900/40 
                      text-green-600 dark:text-green-400">
        <Icon size={22} />
      </div>

      <h3 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>

      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {desc}
      </p>
    </div>
  );
}


function Stat({ number, label }) {
  return (
    <div>
      <h3 className="text-3xl font-bold text-green-600">{number}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
        {label}
      </p>
    </div>
  );
}

function Step({ number, title, desc }) {
  return (
    <div>
      <div className="mx-auto w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
        {number}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
        {desc}
      </p>
    </div>
  );
}

function RoleCard({ icon, title, desc }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-zinc-900 p-6 border border-zinc-200 dark:border-zinc-800">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {desc}
      </p>
    </div>
  );
}
