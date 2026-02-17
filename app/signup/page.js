"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/valiadtors/zodSignUpSchema";
import {
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { apiConnector } from "@/lib/apiConnector";
import {   useRouter } from "next/navigation";
import { signupByCredential } from "@/apiServices/auth";
 



const SignUpForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [location, setLocation] = useState({
        lat: null,
        lng: null,
        address: {
            fullAddress: "",
            city: "",
            district: "",
            state: "",
            country: "",
            pincode: "",
        },
    });

    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            role: "user",
        },
    });

    const role = watch("role");

    /* -------- Location for Worker -------- */
    const requestLocation = () => {
        if (!navigator.geolocation) {
            toast.error("geo location not supported in your device")
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;

                // console.log("LAT -> ", lat)
                // console.log("LNG -> ", lng)
                // console.log("gps accuracy -> ", pos.coords.accuracy)
                // fecth the address as the string 

                // call the bckend for the fetching address
                try {
                    const response = await apiConnector("POST", "/api/location/resolve", { lat, lng })
                 //   console.log("REPONSE FROM THE BACKEND FOR THE LOCATION ADDRESS -> ", response)
                    setLocation(response);
                    toast.success("Location fetched successfully")
                } catch (error) {
                    console.log("ERROR IN THE FETCHING THE LOCATION ADDRESS ", error)
                    toast.error("unable to fetch the location")
                }
            },



            (error) => {
                console.log("error in fetching the location ", error)
                toast.alert("location access is required for the worker")
            }
        );
    };

    /* -------- Submit -------- */
    const onSubmit = async (data) => {
        if (data.role === "worker" && !location) {
            toast.error("Please add your location");
            return;
        }
        let payload = null;
        if(data?.role == "user")
        {
                payload = {
            ...data,
             
        };
        }
        else if(data?.role == "worker")
        {
              payload = {
            ...data,
            location,
        };
        }
      
        const toastId = toast.loading("signing up...");
        try{
            const response = await  signupByCredential(payload);
           // console.log("RESPPNSE FROM THE SIGNUP - >",response)
            if(response?.success)
            {
                toast.dismiss(toastId)
                toast.success("Sign up successfull");
                router.push("/login");
               //  console.log(response?.user)
            }
        }catch(error)
        {
             toast.dismiss(toastId);
            console.log("ERROR IN SIGNUP-> ",error);
                toast.error(error.message||"signup failed")
        } 

       // console.log("form data -> ", response)
    };

    return (
        <div className="min-w-full min-h-screen p-3 flex bg-linear-to-br from-green-100  via-white to-green-150  dark:from-black dark:via-zinc-950 dark:to-zinc-900  flex-col justify-center items-center">
            {/*   Signup Intro   */}
            <div className="mb-6 text-center">
                 
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white text-2xl">
                    ♻️
                </div>

               
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    Join the Clean City Movement
                </h1>

                 
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Create your account to report waste or help keep your city clean as a worker.
                </p>
            </div>

            {/*   Highlights   */}
            <div className="mb-6  max-md:hidden grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
                    <p className="font-medium">📍 Smart Assignment</p>
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-1">
                        Nearby workers are auto-assigned.
                    </p>
                </div>

                 

                <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
                    <p className="font-medium">✅ Verified Pickup</p>
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs mt-1">
                        Proof-based & user-confirmed.
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-md space-y-4"
            >
                {/* Name */}
                <div>
                    <label className="block text-sm mb-1 font-medium">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            {...register("name")}
                            placeholder="your name"
                            className="w-full pl-10 pr-4 py-2 rounded-xl border 
        bg-zinc-50 dark:bg-zinc-900
        border-zinc-300 dark:border-zinc-700
        focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                    {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm mb-1 font-medium">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            {...register("email")}
                            placeholder="your@email.com"
                            className="w-full pl-10 pr-4 py-2 rounded-xl border 
        bg-zinc-50 dark:bg-zinc-900
        border-zinc-300 dark:border-zinc-700
        focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                    {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm mb-1 font-medium">Phone</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            {...register("phone")}
                            placeholder="+91 9876543210"
                            className="w-full pl-10 pr-4 py-2 rounded-xl border 
        bg-zinc-50 dark:bg-zinc-900
        border-zinc-300 dark:border-zinc-700
        focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm mb-1 font-medium">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            {...register("password")}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-2 rounded-xl border 
        bg-zinc-50 dark:bg-zinc-900
        border-zinc-300 dark:border-zinc-700
        focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="block text-sm mb-1 font-medium">Confirm Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            type={showConfirm ? "text" : "password"}
                            {...register("confirmPassword")}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-2 rounded-xl border 
        bg-zinc-50 dark:bg-zinc-900
        border-zinc-300 dark:border-zinc-700
        focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                        >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                {/* Role */}
                <div>
                    <label className="block text-sm mb-1 font-medium">Role</label>
                    <select
                        {...register("role")}
                        className="w-full px-4 py-2 rounded-xl border 
      bg-zinc-50 dark:bg-zinc-900
      border-zinc-300 dark:border-zinc-700
      focus:ring-2 focus:ring-green-500 outline-none"
                    >
                    {/* we cannot style the option in the react instad we can use the shadcn component or the custom drop down */}
                        <option  value="user">Public User</option>
                        <option value="worker">Worker</option>
                    </select>
                </div>


                {/* Worker Location */}
                {role === "worker" && (
                    <div className="space-y-4">
                        {/* Detect location box */}
                        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm">
                            <p className="mb-2 text-green-700 dark:text-green-400 flex items-center gap-2">
                                <MapPin size={16} />
                                Detect your current location (approximate)
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    console.log(location)
                                    requestLocation();
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white"
                            >
                                <MapPin size={16} />
                                {location?.lat ? "Re-detect Location" : "Add Location"}
                            </button>
                        </div>

                        {/* Detected Address (Read-only) */}
                        {location?.address && (
                            <div className="rounded-xl border p-4 bg-zinc-50 dark:bg-zinc-900">
                                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                    📍 Detected Address (Approximate)
                                </p>

                                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                                    {location.address.fullAddress}
                                </p>

                                <p className="text-xs text-zinc-500 mt-1">
                                    You can edit the address details below if needed.
                                </p>
                            </div>
                        )}

                        {/* Editable Address Form */}
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


                {/* Submit */}
                <button
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold 
    hover:bg-green-700 transition"
                >
                    {isSubmitting ? "Creating account..." : "Create Account"}
                </button>

                <p className="text-xs text-center text-zinc-500 mt-2">
                    By continuing, you agree to our{" "}
                    <span className="underline cursor-pointer">Terms</span> &{" "}
                    <span className="underline cursor-pointer">Privacy Policy</span>
                </p>
            </form>


        </div>
    );
};

export default SignUpForm;
