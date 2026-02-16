import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import WastePickup from "@/models/WastePickupModal";
import { connectDB } from "@/lib/dbConnect";
import mongoose from "mongoose";

export async function GET() {
    // Ensure DB connection
    await connectDB();

    // Auth + role check
    const { session, error } = await requireRole(["worker"]);
    if (error) return error;

    try {
        const workerId = session.user.id;


        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return NextResponse.json(
                { success: false, message: "Invalid worker id" },
                { status: 400 }
            );
        }

        const workerObjectId = new mongoose.Types.ObjectId(workerId);

        //  Current Month Range
        const now = new Date();

        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const endOfYear = new Date(now.getFullYear() + 1, 0, 1);


        // 1️ Recent Reports  
        const reports = await WastePickup.find({ workerId: workerObjectId })
            .select(
                "description pickupLocation.address wasteType imageUrl status assignedAt"
            )
            .populate({
                path: "workerId",
                select: "name",
            })
            .sort({ createdAt: -1 })
            .limit(3)
            .lean();

        // 2️ Dashboard  
        const dashboardData = await WastePickup.aggregate([
            {
                $match: {
                    workerId: workerObjectId,
                },
            },
            {
                $facet: {
                    // Status Distribution  
                    StatusData: [
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                status: "$_id",
                                count: 1,
                            },
                        },
                    ],

                    // total waste calculation
                    TotalWaste: [
                        {
                            $match: {
                                status: "Verified",
                                estimatedWeight: { $ne: null }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalWeight: { $sum: "$estimatedWeight" }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                totalWeight: 1
                            }
                        }
                    ],

                    // Waste Type Pie  
                    WasteTypeData: [
                        {
                            $match: {
                                status: { $in: ["Completed", "Verified"] },
                                wasteType: { $ne: null },
                            },
                        },
                        {
                            $group: {
                                _id: "$wasteType",
                                count: { $sum: 1 },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                type: "$_id",
                                count: 1,
                            },
                        },
                    ],

                    // yearly  Month Performance
                    MonthlyData: [
                        {
                            $match: {
                                status:  "Verified",
                                "completionProof.completedAt": {
                                    $gte: startOfYear,
                                    $lt: endOfYear,
                                },
                            },
                        },
                        {
                            $group: {
                                _id: {
                                    month: { $month: "$completionProof.completedAt" }
                                },
                                totalTasks: { $sum: 1 },
                                totalWeight: { $sum: "$estimatedWeight" }
                            },
                        },
                        {
                            $sort: { "_id.month": 1 }
                        },
                        {
                            $project: {
                                _id: 0,
                                month: "$_id.month",
                                totalTasks: 1,
                                totalWeight: 1
                            }
                        }
                    ]

                },
            },
        ]);

        const data = dashboardData[0] || {};

        return NextResponse.json(
            {
                success: true,
                reports,
                StatusData: data.StatusData || [],
                WasteTypeData: data.WasteTypeData || [],
                MonthlyData: data.MonthlyData || [],
                TotalWaste: data.TotalWaste?.[0]?.totalWeight || 0,

            },
            {
                status: 200,
                headers: {
                    "Cache-Control": "private, max-age=30, stale-while-revalidate=2",
                },
            }
        );
    } catch (err) {
        console.error("Error fetching worker dashboard data:", err);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch worker dashboard",
            },
            {
                status: 500,
            }
        );
    }
}
