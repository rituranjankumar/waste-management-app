import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import User from "@/models/UserModal";

export async function GET(req) {
  try {
    const { error } = await requireRole(["admin"]);
    if (error) return error;

    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email required" },
        { status: 400 }
      );
    }

    const worker = await User.findOne({
      email,
      role: "worker",
    }).select("userImage.secure_url name email currentLocation.geo.coordinates").lean();

    if (!worker) {
      return NextResponse.json(
        { success: false, message: "Worker not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      worker,
    });
  } catch (err) {
    console.error("SEARCH WORKER ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Search failed" },
      { status: 500 }
    );
  }
}
