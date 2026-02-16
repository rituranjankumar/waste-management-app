import { getServerSession } from "next-auth";
import User from "@/models/UserModal"
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connect } from "react-redux";
import { connectDB } from "@/lib/dbConnect";
 

export async function POST(req, context) {
    const session =await getServerSession(authOptions);
    console.log("session inthe backend ",session)
    try {
        if (!session || !session?.user?.id) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        console.log("BODY IN THE COMPLETE PROFILE BACKEND -> ", body)
        const { name, phone, role, location } = body;


        await connectDB();

        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        if (user?.isProfileCompleted == true) {
            return NextResponse.json({
                success: false,
                message: "Profile already completed"
            }, { status: 400 })
        }

         
    if (role && user.role !== role) {
      user.role = role;  
    }

    
    if (name) user.name = name;
    if (phone) user.phone = phone;

    
    if (user.role === "worker") {
      if (!location) {
        return NextResponse.json(
          { success: false, message: "Location required for worker" },
          { status: 400 }
        );
      }

      user.currentLocation = {
        geo: {
          type: "Point",
          coordinates: [location.lng, location.lat],
        },
        address: location.address,
      };

       
    }

     
    user.isProfileCompleted = true;

    await user.save();

    
    return NextResponse.json({
      success: true,
      message: "Profile completed",
      user: {
        id: user._id,
        email:user.email,
        name: user.name,
        role: user.role,
        isProfileCompleted: user.isProfileCompleted,
        image: user.userImage,
      },
    });
    } catch (error) {
         console.error("PROFILE COMPLETE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong while completing the profile" },
      { status: 500 }
    );
    }
}