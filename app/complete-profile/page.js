"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MapPin, User, Phone, Mail, Calculator } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiConnector } from "@/lib/apiConnector";
import { useSelector } from "react-redux";
import { useSession } from "next-auth/react";


const CompleteProfile = () => {
  const router = useRouter();

  const { data: session, update, status } = useSession()

  const user = useSelector((state) => state.auth.user);

  // console.log("redux user in complete profile -> ",user)

  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);


  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      role: "user",
    },
  });

  const role = watch("role");

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        phone: user.phone || "",
        role: user.role || "user",
      });
    }
  }, [user, reset]);

  /*  Detect Location   */
  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await apiConnector("POST", "/api/location/resolve", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });

          setLocation({
            lat: res.lat,
            lng: res.lng,
            address: {
              fullAddress: res.address?.fullAddress || "",
              city: res.address?.city || "",
              district: res.address?.district || "",
              state: res.address?.state || "",
              country: res.address?.country || "",
              pincode: res.address?.pincode || "",
            },
          });

          toast.success("Location detected (you can edit it)");
        } catch (error) {
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


  // submit handler 
  const onSubmit = async (data) => {
    if (role === "worker" && !location) {
      toast.error("Location is required for workers");
      return;
    }

    const payload =
      role === "worker"
        ? { ...data, location }
        : { ...data };

   // console.log("Complete profile payload -> ", payload);

    const toastId = toast.loading("Completing profile...");
    try {
      const res = await apiConnector("POST", "/api/profile/complete", payload);
      toast.dismiss(toastId);
      toast.success("Profile completed successfully");
     // console.log("Response after profile complete -> ", res)
      // update the token 
     // console.log("calling upadte now ... ")
      await update({
        user: {
          name: res.user.name,
          role: res.user.role,
          isProfileCompleted: true,
          image: res.user.image,
        },
      });


    //  console.log("update called ...")



      router.push(`/${res.user.role}/dashboard`);

    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error?.message || "Profile update failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-100 via-white to-green-150 dark:from-black dark:via-zinc-950 dark:to-zinc-900 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-5 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow"
      >

        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 flex items-center justify-center rounded-full bg-green-600 text-white">
            ♻️
          </div>
          <h1 className="text-xl font-bold">Complete Your Profile</h1>
          <p className="text-sm text-zinc-500 mt-1">
            One last step to personalize your experience
          </p>
        </div>

        {/*   Email (Read-only)   */}
        <div>
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              disabled
              value={user?.email || ""}
              className="w-full pl-10 pr-4 py-2 rounded-xl border bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed"
            />
          </div>
        </div>

        {/*   Role   */}
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            {...register("role", { required: true })}
            disabled={user?.isProfileComplete}
            className="w-full px-4 py-2 rounded-xl border 
              bg-zinc-50 dark:bg-zinc-900
              border-zinc-300 dark:border-zinc-700
              focus:ring-2 focus:ring-green-500 outline-none
              disabled:bg-zinc-100 disabled:cursor-not-allowed"
          >
            <option value="user">Public User</option>
            <option value="worker">Worker</option>
          </select>

          {!user?.isProfileComplete && (
            <p className="text-xs text-zinc-500 mt-1">
              Choose carefully — this cannot be changed later.
            </p>
          )}
        </div>

        {/*   Name   */}
        <div>
          <label className="text-sm font-medium">Full Name</label>
          <div className="relative">
            <User
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full pl-10 pr-4 py-2 rounded-xl border"
            />
          </div>
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        {/*   Phone   */}
        <div>
          <label className="text-sm font-medium">Phone</label>
          <div className="relative">
            <Phone
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              {...register("phone", { required: "Phone is required" })}
              className="w-full pl-10 pr-4 py-2 rounded-xl border"
            />
          </div>

          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/*   Worker Location   */}
        {role === "worker" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm">
              <p className="mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
                <MapPin size={16} />
                Detect your work location
              </p>

              <button
                type="button"
                onClick={requestLocation}
                disabled={loadingLocation}
                className="px-4 py-2 rounded-lg bg-green-600 text-white"
              >
                {location ? "Re-detect Location" : "Add Location"}
              </button>
            </div>

            {/*    Address   */}
            {location?.address && (
              <div className="rounded-xl border p-4 space-y-4 bg-white dark:bg-zinc-950">
                <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Edit Address
                </h4>

                {/* Full Address */}
                <div className="space-y-1">
                  <label
                    htmlFor="fullAddress"
                    className="text-xs font-medium text-zinc-600 dark:text-zinc-400"
                  >
                    Full Address
                  </label>
                  <input
                    id="fullAddress"
                    className="w-full px-3 py-2 rounded-lg border 
      bg-zinc-50 dark:bg-zinc-900
      border-zinc-300 dark:border-zinc-700
      focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="House no, street, landmark"
                    value={location.address.fullAddress}
                    onChange={(e) =>
                      setLocation({
                        ...location,
                        address: {
                          ...location.address,
                          fullAddress: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                {/* City + District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      City
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-lg border 
        bg-zinc-50 dark:bg-zinc-900
        border-zinc-300 dark:border-zinc-700
        focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="City"
                      value={location.address.city}
                      onChange={(e) =>
                        setLocation({
                          ...location,
                          address: {
                            ...location.address,
                            city: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      District
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-lg border 
        bg-zinc-50 dark:bg-zinc-900
        border-zinc-300 dark:border-zinc-700
        focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="District"
                      value={location.address.district}
                      onChange={(e) =>
                        setLocation({
                          ...location,
                          address: {
                            ...location.address,
                            district: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                {/* State + Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      State
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-lg border 
        bg-zinc-50 dark:bg-zinc-900
        border-zinc-300 dark:border-zinc-700
        focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="State"
                      value={location.address.state}
                      onChange={(e) =>
                        setLocation({
                          ...location,
                          address: {
                            ...location.address,
                            state: e.target.value,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      Pincode
                    </label>
                    <input
                      className="w-full px-3 py-2 rounded-lg border 
        bg-zinc-50 dark:bg-zinc-900
        border-zinc-300 dark:border-zinc-700
        focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="Pincode"
                      value={location.address.pincode}
                      onChange={(e) =>
                        setLocation({
                          ...location,
                          address: {
                            ...location.address,
                            pincode: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Country
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border 
      bg-zinc-50 dark:bg-zinc-900
      border-zinc-300 dark:border-zinc-700
      focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Country"
                    value={location.address.country}
                    onChange={(e) =>
                      setLocation({
                        ...location,
                        address: {
                          ...location.address,
                          country: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>

            )}
          </div>
        )}

        {/*   Submit   */}
        <button
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold"
        >
          {isSubmitting ? "Saving..." : "Complete Profile"}
        </button>
      </form>
    </div>
  );
};

export default CompleteProfile;
