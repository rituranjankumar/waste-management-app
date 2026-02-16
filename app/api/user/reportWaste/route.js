import {  requireRole } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/uploadAndDeleteToCloudinary";
import { NextResponse } from "next/server";
import User from "@/models/UserModal"
import WastePickup from "@/models/WastePickupModal"
import { connectDB } from "@/lib/dbConnect";
 import Notification from "@/models/NotificationModal"
export async function POST(req) {


    // check auth   & check authorization
    const { session, error } = await requireRole(["user"]);

    if (error) {
        return error;
    }

    // connect  db
     await   connectDB();
     
    try {
        // prepare the data
        const formData = await req.formData();

        const wasteType = formData.get("wasteType");
        const description = formData.get("description");
        let image = formData.get("image");

        const lat = Number(formData.get("lat"));
        const lng = Number(formData.get("lng"));

        const address = {
            fullAddress: formData.get("fullAddress"),
            city: formData.get("city"),
            district: formData.get("district"),
            state: formData.get("state"),
            country: formData.get("country"),
            pincode: formData.get("pincode"),
        };

        // Validation
        if (!wasteType || !description || !image || !lat || !lng) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Upload image (Cloudinary / S3)  ← later
  console.log("STEP 5: Starting image upload");
        const uploaded = await uploadToCloudinary(image);
        const imageUrl = uploaded.secure_url;

  console.log("STEP 6: after image upload");
        // create the report 

        const report = await WastePickup.create({
            userId: session.user.id,
            wasteType,
            description,
            imageUrl: imageUrl,
            pickupLocation: {
                geo: {
                    type: "Point",
                    coordinates: [lng, lat]
                },
                address: address,

            },
             isInProgress: false,
            status: "Pending",
        });
        // get the nearest worker available 

        const nearestWorkers = await User.find({
            role: "worker",
            isAvailable: true,
            "currentLocation.geo": {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat],
                    },
                    $maxDistance: 10000, // meters (10 km)
                },
            },
        }).lean();

        let assignedWorker = null;
        if (nearestWorkers.length > 0) {
            // pick random worer
            assignedWorker =nearestWorkers[Math.floor(Math.random() * nearestWorkers.length)];

        }

        if (assignedWorker) {
            report.workerId = assignedWorker._id;
            report.status = "Assigned";
            report.assignedAt = new Date();
            
        } else {
            report.workerId = null;
        }

    // If worker auto-assigned → notify worker
if (assignedWorker) {
  await Notification.create({
    recipientId: assignedWorker._id,
    recipientRole: "worker",
    type: "WORKER_ASSIGNED",
    title: "New Pickup Assigned",
    message: `You have been assigned a new waste pickup task.`,
    relatedPickupId: report._id,
  });
}

// If NO worker found → notify admin
if (!assignedWorker) {
  await Notification.create({
    recipientRole: "admin",
    type: "PICKUP_CREATED",
    title: "New Pickup Needs Assignment",
    message: `A new waste pickup requires manual assignment.`,
    relatedPickupId: report._id,
  });
}
        //if not available then leave it unassigned and the admin will take care of it
        
        // send notification to admin -> create the notification for admin

        // later upgradation send the notfication to the admin to assign the task

        // if assigned then send the notification to worker
        await report.save();
        // return the response 
        return NextResponse.json({
            success: true,
            reportId: report._id,
            assigned: Boolean(assignedWorker),
        }, { status: 200 });


    } catch (error) {
         console.log("ERROR IN BACKEND ROUTE OF REPORT WASTE ",error)
        return NextResponse.json({
           
            success: false,
            message: "Error in creating the report ",
            
        }, { status: 500 })
    }

}