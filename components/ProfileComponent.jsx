"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
    User,
    Phone,
    Camera,
    MapPin,
    Star,
    Mail,
    ShieldCheck,
} from "lucide-react";
import { apiConnector } from "@/lib/apiConnector";

 
const profileSchema = z.object({
    name: z.string().min(2, "Name is required"),
    phone: z.string().min(10, "Valid phone number required").or(z.literal("")).optional(),
});

 
export default function ProfileComponent({ user }) {
    const { update } = useSession();
    const role = user?.role;

   // console.log("user is -> ",user)

    const locationFetchedRef = useRef(false);

    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(user?.userImage || null);

    const [location, setLocation] = useState(user?.location || null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: "", phone: "" },
    });

    
    useEffect(() => {
        if (user) {
            reset({
                name: user.name || "",
                phone: user.phone || "",
            });
            setPreview(user.userImage || null);
        }
    }, [user, reset]);


    const handleImageChange = (file) => {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Only image files are allowed");
            return;
        }

        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };


    const updateAddressField = (field, value) => {
        locationFetchedRef.current = true
        setLocation((prev) => ({
            ...prev,
            address: {
                ...prev?.address,
                [field]: value,
            },
        }));
    };

    const requestLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation not supported");
            return;
        }

        setLoadingLocation(true);
        const toastId = toast.loading("fetching location")
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const res = await apiConnector("POST", "/api/location/resolve", {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    });

                    toast.dismiss(toastId);

                    setLocation({
                        geo: {
                            type: "Point",
                            coordinates: [res.lng, res.lat],
                        },
                        
                        address: {
                            fullAddress: res.address?.fullAddress || "",
                            city: res.address?.city || "",
                            district: res.address?.district || "",
                            state: res.address?.state || "",
                            country: res.address?.country || "",
                            pincode: res.address?.pincode || "",
                        },
                    });
                    locationFetchedRef.current = true;
                    toast.success("Location detected (you can edit it)");
                } catch {
                    toast.error("Failed to fetch location");
                } finally {
                    setLoadingLocation(false);
                }
            },
            () => {
                setLoadingLocation(false);
                toast.error("Location permission denied");
            }
        );
    };


    const onSubmit = async (data) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("phone", data.phone || "");

  if (imageFile) {
    formData.append("image", imageFile);
  }

  if (role === "worker" && locationFetchedRef.current && location) {
    formData.append("location", JSON.stringify(location));
  }

  const toastId = toast.loading("updating profile...");
   
  try {
    const res = await apiConnector(
      "POST",
      "/api/profile/update",
      formData
    );
    toast.dismiss(toastId);
    toast.success("Profile updated successfully");

    // update session  
    await update({
      user: {
        name: res.user.name,
        phone: res.user.phone,
        image: res.user.image,
      },
    });
     
  } catch (err) {
    toast.error(err?.message || "Profile update failed");
  }
};



   
    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow space-y-6"
        >
            <h2 className="text-xl font-semibold">Profile</h2>

            {/* IMAGE */}
            <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full overflow-hidden border bg-zinc-100">
                    <img
                        src={preview || "/avatar.png"}
                        alt="Profile"
                        className="h-full w-full object-cover"
                    />
                </div>

                <label className="flex items-center gap-2 text-green-600 cursor-pointer">
                    <Camera size={16} />
                    Change photo
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleImageChange(e.target.files?.[0])}
                    />
                </label>
            </div>

            {/* EMAIL   */}
            <div>
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        disabled
                        value={user?.email || ""}
                        className="w-full pl-9 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed"
                    />
                </div>
            </div>

            {/* NAME */}
            <div>
                <label className="text-sm font-medium">Name</label>
                <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        {...register("name")}
                        className="w-full pl-9 py-2 rounded-lg border"
                    />
                </div>
                {errors.name && (
                    <p className="text-xs text-red-500 mt-1">
                        {errors.name.message}
                    </p>
                )}
            </div>

            {/* PHONE */}
            <div>
                <label className="text-sm font-medium">Phone</label>
                <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        {...register("phone")}
                        className="w-full pl-9 py-2 rounded-lg border"
                    />
                </div>
                {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">
                        {errors.phone.message}
                    </p>
                )}
            </div>

            {/* ROLE */}
            <div>
                <label className="text-sm font-medium">Role</label>
                <div className="relative">
                    <ShieldCheck
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                    />
                    <input
                        disabled
                        value={role?.toUpperCase()}
                        className="w-full pl-9 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed font-semibold"
                    />
                </div>
            </div>

            {/* WORKER ONLY */}
            {role === "worker" && (
                <>
                    {/* RATING */}
                    <div>
                        <label className="text-sm font-medium">Average Rating</label>
                        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-lg">
                            <Star size={16} className="text-yellow-500" />
                            {user?.avgRating?.toFixed(1) || "N/A"}
                        </div>
                    </div>

                    {/* LOCATION */}
                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={requestLocation}
                            disabled={loadingLocation}
                            className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded-lg bg-green-600 text-white"
                        >
                            <MapPin size={16} />
                            {location ? "Change Location" : "Add Location"}
                        </button>

                        {location?.address && (
                            <div className="rounded-xl border p-4 space-y-4 bg-white dark:bg-zinc-950">
                                <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                                    Edit Address
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { key: "fullAddress", label: "Full Address", colSpan: true },
                                        { key: "city", label: "City" },
                                        { key: "district", label: "District" },
                                        { key: "state", label: "State" },
                                        { key: "pincode", label: "Pincode" },
                                        { key: "country", label: "Country" },
                                    ].map(({ key, label, colSpan }) => (
                                        <div
                                            key={key}
                                            className={colSpan ? "sm:col-span-2 flex flex-col gap-1" : "flex flex-col gap-1"}
                                        >
                                            <label
                                                htmlFor={key}
                                                className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
                                            >
                                                {label}
                                            </label>

                                            <input
                                                id={key}
                                                value={location.address[key] || ""}
                                                onChange={(e) => updateAddressField(key, e.target.value)}
                                                placeholder={label}
                                                className="w-full px-3 py-2 rounded-lg border 
                                                bg-zinc-50 dark:bg-zinc-900
                                                border-zinc-300 dark:border-zinc-700
                                                focus:ring-2 focus:ring-green-500 outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </>
            )}

            <button
                disabled={isSubmitting}
                className="w-full py-3 rounded- disabled:cursor-not-allowed cursor-pointer bg-green-600 text-white font-semibold"
            >
                {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
        </form>
    );
}
