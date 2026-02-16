import { NextResponse } from "next/server";
import User from "@/models/UserModal";
 
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/uploadAndDeleteToCloudinary";
import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
 

export async function POST(req) {
  const { error, session } = await requireRole([
    "user",
    "worker",
    "admin",
  ]);

  if (error) return error;

  try {
    await connectDB();

    const formData = await req.formData();

    const name = formData.get("name");
    const phone = formData.get("phone");
    const imageFile = formData.get("image"); // File | null
    const locationRaw = formData.get("location"); // string | null

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    
    if (name) user.name = name;
    if (phone !== null) user.phone = phone;

    
    if (imageFile ) {
      // delete old image if exists
      if (user.userImage?.public_id) {
        await deleteFromCloudinary(user.userImage.public_id);
      }

      const uploaded = await uploadToCloudinary(imageFile);

      user.userImage = {
        secure_url: uploaded.secure_url,
        public_id: uploaded.public_id,
      };
    }

     
    if (user.role === "worker" && locationRaw) {
      const location = JSON.parse(locationRaw);

      user.currentLocation = {
        geo: {
          type: "Point",
          coordinates: location.geo.coordinates, 
        },
        address: location.address,
      };
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        image: user.userImage?.secure_url || null,
      },
    });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update profile",
      },
      { status: 500 }
    );
  }
}
