import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

 
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      error: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  return { session };
}

export async function requireRole(allowedRoles = []) {
    console.log("Allowded roles -> ",allowedRoles)
  const session = await getServerSession(authOptions);
console.log("SESSION USER IN THE AUTHORIZATION :", session.user);

  if (!session) {
    return {
      error: NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  if (
    allowedRoles.length &&
    !allowedRoles.includes(session.user.role)
  ) {
    return {
      error: NextResponse.json(
        { success: false, message: "you are Unauthorized for this route" },
        { status: 403 }
      ),
    };
  }

  return { session };
}
