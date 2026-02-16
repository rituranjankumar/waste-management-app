import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
 import User from "@/models/UserModal"
import RatingAndReview from "@/models/RatingAndReview";
import { requireRole } from "@/lib/auth"; 

 
export  async function GET() {
  try {
    
    const { error, session } = await requireRole([
      "user",
      "worker",
      "admin",
    ]);

    if (error) return error;

    
    await connectDB();

    const user = await User.findById(session.user.id).lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

   
    let avgRating = null;
    let totalReviews = 0;

    if (user.role === "worker") {
      const stats = await RatingAndReview.aggregate([
        { $match: { worker: user._id } },
        {
          $group: {
            _id: "$worker",
            avgRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      if (stats.length > 0) {
        avgRating = Number(stats[0].avgRating.toFixed(1));
        totalReviews = stats[0].totalReviews;
      }
    }

  
    const profileData = {
      id: user._id.toString(),

      // common
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
       userImage: user.userImage?.secure_url || null,

      // worker-only
      isAvailable:
        user.role === "worker" ? user.isAvailable : undefined,

      location:
        user.role === "worker" && user.currentLocation?.address
          ? 
                user.currentLocation
             
          : null,

      avgRating,
      totalReviews,
    };

    return NextResponse.json(
      {
        success: true,
        data: profileData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/profile/me ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch profile data",
      },
      { status: 500 }
    );
  }
}
