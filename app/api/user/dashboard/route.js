import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import WastePickup from "@/models/WastePickupModal";
import { connectDB } from "@/lib/dbConnect";
import mongoose from "mongoose";
import redis from "@/lib/redisConfig";
export async function GET() {


    try {
        // Auth + role check
        const { session, error } = await requireRole(["user"]);
        if (error) return error;
        const userId = session?.user?.id;
        // Ensure DB connection

        const cacheKey = `dashboard:${userId}`

        const cachedData = await redis.get(cacheKey);


      //  console.log("RAW CACHE ->", cachedData);
        console.log("TYPE ->", typeof cachedData);

        if (cachedData) {
            try {
                return NextResponse.json(cachedData);
            } catch (err) {
                console.log("Corrupted cache, deleting...");
                await redis.del(cacheKey);
            }
        }
        await connectDB();



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

        // set the redis cache reports statusdata wastetypedata
        const response = {
            success: true,
            reports: reports,
            StatusData: dashboardData[0].StatusData,
            WasteTypeData: dashboardData[0].WasteTypeData
        }

       await redis.set(cacheKey, response, {
  ex: 60
});
            const ttl = await redis.ttl(cacheKey);
            console.log("TTL AFTER SET ->", ttl);
        return NextResponse.json(response, { status: 200 })



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
