import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { lat, lng } = await req.json();

    // Abort if request takes too long
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          "User-Agent": "WasteManagementApp/1.0 (b423052@iiit-bh.ac.in)",
          "Accept": "application/json",
          "Accept-Language": "en",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Geocoding failed: ${res.status}`);
    }

    const data = await res.json();
    const addr = data.address || {};

    const normalizedAddress = {
      fullAddress: data.display_name || "",
      city: addr.city || addr.town || addr.village || addr.hamlet || "",
      district: addr.state_district || addr.county || "",
      state: addr.state || "",
      country: addr.country || "",
      pincode: addr.postcode || "",
    };

    return NextResponse.json({ lat, lng, address: normalizedAddress });

  } catch (err) {
    console.log("error in location api -> ", err);

    return NextResponse.json(
      { message: "Location service temporarily unavailable" },
      { status: 503 }
    );
  }
}
