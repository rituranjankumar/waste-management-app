import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import WastePickup from "@/models/WastePickupModal";
import { connectDB } from "@/lib/dbConnect";
import mongoose from "mongoose";

export async function GET() {
    // Ensure DB connection
    await connectDB();

    // Auth + role check
    const { session, error } = await requireRole(["user"]);
    if (error) return error;

    try {
        const userId = session.user.id;

        // Fetch user reports
        const reports = await WastePickup.find({ userId: userId }).select("description pickupLocation.address wasteType imageUrl status assignedAt")
            .populate({
                path: "workerId",
                select: "name",
            })
            .sort({ createdAt: -1 }).limit(3);

        const dashboardData = await WastePickup.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                },
            },
            {

                // facet allow to run multiple pileline with same req
                $facet: {
                    StatusData: [
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 }
                            },


                        }, {
                            $project: {
                                _id: 0,
                                type: "$_id",
                                count: 1
                            }
                        }
                    ],
                    WasteTypeData: [
                        {
                            $group: {
                                _id: "$wasteType",
                                count: { $sum: 1 }
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                type: "$_id",
                                count: 1
                            }
                        }
                    ],
                }
            }
        ]);
        return NextResponse.json({
            success: true,
            reports: reports,
            StatusData: dashboardData[0].StatusData,
            WasteTypeData: dashboardData[0].WasteTypeData

        }, {
            status: 200,
            headers: {
                "Cache-Control": "private, max-age=30, stale-while-revalidate=2",
            },
        }

        );
    } catch (err) {
        console.error("Error fetching user dashboard data :", err);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch user dashboard",
            },
            {
                status: 500

            }
        );
    }
}
