import { requireRole } from "@/lib/auth";
import { NextResponse } from "next/server";
import WastePickup from "@/models/WastePickupModal";
import RatingAndReview from "@/models/RatingAndReview";
import { connectDB } from "@/lib/dbConnect";

export async function GET(req,context) {
  await connectDB();

  const { session, error } = await requireRole(["user"]);
  if (error) return error;

  try {
    const userId = session.user.id;

  //  console.log("search params from the fetch reports ->",req)
    //  Read pagination params
    const { searchParams } = new URL(req.url);

    console.log("page is -> ",searchParams.get("page"))

    const page = Number(searchParams.get("page")) || 1;
const limit = Number(searchParams.get("limit")) || 5;
    const selectedStatus = searchParams.get("status") ;
    const skip = (page - 1) * limit;

    // Fetch paginated reports + total count in parallel
    let query = {
      userId:userId
    };
  if (selectedStatus && selectedStatus !== "All") {
  query.status = selectedStatus;
}
    const [reports, totalReports] = await Promise.all([
      WastePickup.find(query)
        .populate({
          path: "workerId",
          select: "name phone userImage",
        })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      WastePickup.countDocuments(query)
,
    ]);

    //   Extract worker IDs (only for this page)
    const workerIds = reports
      .map((r) => r.workerId?._id)
      .filter(Boolean);

    //   Aggregate ratings
    let ratingMap = {};
    if (workerIds.length > 0) {
      const ratings = await RatingAndReview.aggregate([
        { $match: { worker: { $in: workerIds } } },
        {
          $group: {
            _id: "$worker",
            average: { $avg: "$rating" },
            total: { $sum: 1 },
          },
        },
      ]);

      ratings.forEach((r) => {
        ratingMap[r._id.toString()] = {
          average: r.average,
          total: r.total,
        };
      });
    }

    //   Attach rating to each worker
    reports.forEach((report) => {
      if (report.workerId) {
        report.workerId.rating =
          ratingMap[report.workerId._id.toString()] || null;
      }
    });

    return NextResponse.json(
      {
        success: true,
        reports,
        pagination: {
          page,
          limit,
          totalReports,
          totalPages: Math.ceil(totalReports / limit),
        },
      },
      {
        status: 200,
        // no caching because of the frotned data and filterdata flow
        // headers: {
        //   "Cache-Control": "private, max-age=15, stale-while-revalidate=5",
        // },  
      }
    );
  } catch (err) {
    console.error("Error fetching user reports:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch reports",
      },
      { status: 500 }
    );
  }
}
