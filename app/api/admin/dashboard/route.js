import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import WastePickup from "@/models/WastePickupModal";
import User from "@/models/UserModal";
import Rating from "@/models/RatingAndReview";
import redis from "@/lib/redisConfig";

export async function GET(req) {
  try {
    const { error, session } = await requireRole(["admin"]);
    if (error) return error;

    const userId = session?.user?.id;

    // same admin key for global admins
    const cacheKey = "admin-dashboard";

    const cachedData = await redis.get(cacheKey);


    //  console.log("RAW CACHE ->", cachedData);
    console.log("TYPE ->", typeof cachedData);

    if (cachedData) {
      try {
         await redis.expire(cacheKey, 60);
        return NextResponse.json(cachedData);
      } catch (err) {
        console.log("Corrupted cache, deleting...");
        await redis.del(cacheKey);
      }
    }
    await connectDB();

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);


    //  SECTION 1 – OVERVIEW COUNTS


    const [
      totalTasks,
      totalUsers,
      totalWorkers,
      totalActiveWorkers,
      totalWasteResult
    ] = await Promise.all([
      WastePickup.countDocuments(),
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "worker" }),
      User.countDocuments({ role: "worker", isAvailable: true }),
      WastePickup.aggregate([
        { $match: { status: "Verified", estimatedWeight: { $exists: true } } },
        { $group: { _id: null, total: { $sum: "$estimatedWeight" } } }
      ])
    ]);

    const totalWaste = totalWasteResult[0]?.total || 0;


    //  SECTION 2 – STATUS COUNTS


    const [
      statusCounts,
      monthlyVerified,
      monthlyReported,
      wasteDistribution,
      topWorkers,
      latestReports
    ] = await Promise.all([

      // STATUS COUNTS
      WastePickup.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),

      // MONTHLY VERIFIED
      WastePickup.aggregate([
        {
          $match: {
            status: "Verified",
            createdAt: { $gte: startOfYear, $lte: endOfYear }
          }
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            totalTasks: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            month: "$_id",
            totalTasks: 1
          }
        }
      ]),

      // MONTHLY REPORTED
      WastePickup.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfYear, $lte: endOfYear }
          }
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            totalTasks: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            month: "$_id",
            totalTasks: 1
          }
        }
      ]),

      // WASTE DISTRIBUTION
      WastePickup.aggregate([
        {
          $group: {
            _id: "$wasteType",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            type: "$_id",
            count: 1
          }
        }
      ]),

      // TOP WORKERS
      WastePickup.aggregate([
        { $match: { status: "Verified" } },
        {
          $group: {
            _id: "$workerId",
            verifiedCount: { $sum: 1 }
          }
        },
        { $sort: { verifiedCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "worker"
          }
        },
        { $unwind: "$worker" },
        {
          $lookup: {
            from: "ratingandreviews",
            localField: "_id",
            foreignField: "worker",
            as: "ratings"
          }
        },
        {
          $addFields: {
            avgRating: { $avg: "$ratings.rating" }
          }
        },
        {
          $project: {
            _id: 0,
            workerId: "$worker._id",
            name: "$worker.name",
            image: "$worker.userImage.secure_url",
            verifiedCount: 1,
            avgRating: { $ifNull: ["$avgRating", 0] }
          }
        }
      ]),

      // LATEST REPORTS
      WastePickup.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("workerId", "name")
        .populate("userId", "name")
        .select("wasteType pickupLocation.address.fullAddress workerId status createdAt imageUrl")
        .lean()

    ]);


    const response = {
      section1: {
        admin: {
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
          image: session.user.image
        },
        totalWaste,
        totalTasks,
        totalUsers,
        totalWorkers,
        totalActiveWorkers
      },

      section2: statusCounts,

      section3: {
        monthlyVerified,
        monthlyReported,
        wasteDistribution
      },

      section4: topWorkers,

      section5: latestReports
    }
    await redis.set(cacheKey, response, { ex: 60 });

    return NextResponse.json(response, { status: 200 })

  } catch (err) {
    console.error("ADMIN DASHBOARD ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load admin dashboard" },
      { status: 500 }
    );
  }
}
