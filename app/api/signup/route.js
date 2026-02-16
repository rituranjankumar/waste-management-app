
 
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/UserModal"

import bcrypt from "bcrypt";
 

export async function POST(req) {
  try {
    await connectDB();

    const { name, email, password, role, location = null } = await req.json();

    const userExist = await User.findOne({ email });

    if (userExist) {
      return Response.json({ message: "User already exists" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);


    // add the image in the user -> 
    const parts = name.trim().split(" ");
const firstName = parts[0] || "";
const lastName = parts.slice(1).join(" ");

const imageData = encodeURIComponent(`${firstName} ${lastName}`.trim());
const userImage = `https://api.dicebear.com/5.x/initials/svg?seed=${imageData}`;

 

    const userProfile = {
      name,
      email,
      password: hashed,
      role,
      userImage,

      provider: "credentials",
      isProfileCompleted: role === "user" ? true : ((role === "worker" && location) ? true : false),
      currentLocation: (role === "worker" && location)
        ? {
          geo: {
            type: "Point",
            coordinates: [location.lng, location.lat], //  [lng, lat]
          },
          address: {
            fullAddress: location.address?.fullAddress || "",
            city: location.address?.city || "",
            state: location.address?.state || "",
            country: location.address?.country || "",
            pincode: location.address?.pincode || "",
            district: location.address?.district || "",
          },
        }
        : undefined,

    }

    if (role === "worker") {
      userProfile.isAvailable = false;
    }
    await User.create(userProfile);

    userProfile.password = undefined

    return Response.json({success:true, message: "Signup successful", user: userProfile }, { status: 201 });
  } catch (err) {
    return Response.json({success:false, message: "Server error" }, { status: 500 });
  }
}
