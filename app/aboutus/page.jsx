"use client";

import Navbar from "@/components/common/navbar";
import {
    MapPin,
    ShieldCheck,
    BarChart3,
    Users,
    Recycle,
    Star,
    Rocket,
    CheckCircle,
} from "lucide-react";
import Image from "next/image";
import aboutUsImg from  "@/public/AboutUs.jpg";
export default function AboutPage() {
    return (
        <div
            className="min-h-screen w-full 
      bg-linear-to-br from-green-50 via-white to-green-100
      dark:from-black dark:via-zinc-950 dark:to-zinc-900
      text-zinc-900 dark:text-zinc-100"
        >
            <Navbar />

            {/* HERO SECTION  */}
            <section className="px-6 py-20 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold max-w-3xl mx-auto leading-tight">
                    Building Cleaner Cities Through{" "}
                    <span className="text-green-600">Smart Technology</span>
                </h1>

                <p className="mt-6 max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400">
                    EcoClean is a full-stack waste management platform that connects
                    citizens, workers, and administrators to create a transparent,
                    efficient, and location-based waste collection system.
                </p>
            </section>

            {/*  PROBLEM SECTION   */}
            <section className="px-6 py-16 max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">
                    The Problem We’re Solving
                </h2>

                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div className="relative w-full h-72 rounded-2xl overflow-hidden shadow-md">
    <Image
        src={aboutUsImg}  
        alt="Waste Management"
        fill
        className="object-cover"
        priority
    />
</div>


                    <div className="space-y-4 text-zinc-600 dark:text-zinc-400">
                        <p>
                            Cities often struggle with delayed waste reporting, inefficient
                            worker assignment, and lack of transparency in verification.
                        </p>
                        <p>
                            Manual systems cause slow response times, unclear accountability,
                            and reduced trust between citizens and waste collection teams.
                        </p>
                        <p>
                            EcoClean modernizes this entire workflow using geo-location,
                            verification proof, and performance analytics.
                        </p>
                    </div>
                </div>
            </section>

            {/*   SOLUTION SECTION  */}
            <section className="px-6 py-16 bg-green-50 dark:bg-zinc-900">
                <h2 className="text-3xl font-bold text-center mb-12">
                    Our Smart Solution
                </h2>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    <FeatureCard
                        icon={<MapPin size={28} />}
                        title="Location-Based Assignment"
                        desc="Automatically assigns the nearest available worker using MongoDB geospatial queries."
                    />
                    <FeatureCard
                        icon={<ShieldCheck size={28} />}
                        title="Verified Collection"
                        desc="Workers upload completion proof, and users confirm before task verification."
                    />
                    <FeatureCard
                        icon={<BarChart3 size={28} />}
                        title="Admin Analytics Dashboard"
                        desc="Admins track performance, waste trends, worker ratings, and monthly reports."
                    />
                </div>
            </section>

            {/*   WORKFLOW SECTION  */}
            <section className="px-6 py-16 max-w-6xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-12">How EcoClean Works</h2>

                <div className="grid md:grid-cols-4 gap-8">
                    <Step
                        icon={<Recycle size={28} />}
                        title="Report Waste"
                        desc="User uploads image and location."
                    />
                    <Step
                        icon={<Users size={28} />}
                        title="Worker Assigned"
                        desc="Nearest worker gets notified."
                    />
                    <Step
                        icon={<CheckCircle size={28} />}
                        title="Task Completed"
                        desc="Worker uploads proof."
                    />
                    <Step
                        icon={<Star size={28} />}
                        title="User Confirms & Rates"
                        desc="User verifies and rates service."
                    />
                </div>
            </section>

            {/*   IMPACT SECTION   */}
            <section className="px-6 py-16 bg-green-50 dark:bg-zinc-900 text-center">
                <h2 className="text-3xl font-bold mb-8">
                    Impact & Vision 🌱
                </h2>

                <p className="max-w-3xl mx-auto text-zinc-600 dark:text-zinc-400">
                    By combining technology, transparency, and accountability,
                    EcoClean empowers communities to maintain cleaner cities.
                    Our goal is to create a scalable civic-tech platform that
                    can integrate with smart city infrastructure and promote
                    sustainable urban living.
                </p>
            </section>

            {/*   TECH STACK   */}
            <section className="px-6 py-16 max-w-6xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-10">
                    Technology Stack
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm font-medium">
                    <TechBadge text="Next.js (App Router)" />
                    <TechBadge text="MongoDB + 2dsphere Index" />
                    <TechBadge text="NextAuth Authentication" />
                    <TechBadge text="Tailwind CSS" />
                    <TechBadge text="Recharts Analytics" />
                    <TechBadge text="Cloudinary Storage" />
                    <TechBadge text="Role-Based Access" />
                    <TechBadge text="Dark / Light Mode" />
                </div>
            </section>

            {/*   FUTURE SECTION   */}
            <section className="px-6 py-16 bg-green-50 dark:bg-zinc-900 text-center">
                <h2 className="text-3xl font-bold mb-8">
                    Future Roadmap 🚀
                </h2>

                <div className="max-w-4xl mx-auto space-y-4 text-zinc-600 dark:text-zinc-400">

                    <p>• Reward System for Responsible Citizens</p>

                    <p>• AI-Powered Waste Classification</p>
                </div>
            </section>

            {/*   FOOTER   */}
            <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-6 text-center text-sm text-zinc-500">
                © {new Date().getFullYear()} EcoClean · Building a Cleaner Future ♻️
            </footer>
        </div>
    );
}

/*   COMPONENTS   */

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm hover:shadow-md transition">
            <div className="text-green-600">{icon}</div>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {desc}
            </p>
        </div>
    );
}

function Step({ icon, title, desc }) {
    return (
        <div className="space-y-3">
            <div className="mx-auto w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center">
                {icon}
            </div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{desc}</p>
        </div>
    );
}

function TechBadge({ text }) {
    return (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3">
            {text}
        </div>
    );
}
