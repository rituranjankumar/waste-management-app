"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema } from "@/lib/valiadtors/zodSignUpSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const submit = async (data) => {

    if (loading) return;
  //  console.log("login using credentioals -> ",data)
    setLoading(true);

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      toast.error(res?.error || "Invalid email or password");
      return;
    }

    toast.success("Logged in successfully ");
    router.refresh();
  };

const googleLogin = async () => {
  if (loading) return;

  setLoading(true);
  const toastId = toast.loading("Redirecting to Google...");

  try {
   const res =  await signIn("google", { redirect:false });
  // console.log("response form the login by google -> ",res)
  } catch (err) {
    toast.dismiss(toastId);
    toast.error("Google login failed!");
    setLoading(false);
  }
};


  return (
    <div
      className="min-w-full min-h-screen flex flex-col items-center justify-center
      px-4 sm:px-6
      bg-linear-to-br from-green-100 via-white to-green-200
      dark:from-black dark:via-zinc-950 dark:to-zinc-900"
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white text-2xl shadow-lg shadow-green-600/40">
          ♻️
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Join the Clean City Movement
        </h1>

        <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
          Login to report waste or help keep your city clean.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl p-6 sm:p-8 bg-white/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-700 shadow-2xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-zinc-900 dark:text-zinc-50">
          Welcome back
        </h2>

        <p className="text-center mb-6 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Login to your account
        </p>

        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          {/* Email */}
          <div>
            <input
              {...register("email")}
              placeholder="Enter your email"
              disabled={loading}
              className="w-full px-4 py-3 sm:py-2 rounded-xl border border-zinc-300 dark:border-zinc-700
              bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
              focus:ring-2 focus:ring-green-500/30 outline-none
              disabled:opacity-60 disabled:cursor-not-allowed"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              {...register("password")}
              placeholder="Password"
              disabled={loading}
              className="w-full px-4 py-3 sm:py-2 rounded-xl border border-zinc-300 dark:border-zinc-700
              bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
              focus:ring-2 focus:ring-green-500/30 outline-none
              disabled:opacity-60 disabled:cursor-not-allowed"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-2 rounded-xl font-semibold
            bg-green-600 hover:bg-green-700 text-white transition shadow-lg
            disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            )}
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            OR
          </span>
          <div className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
        </div>

        {/* Google */}
        <button
          onClick={googleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl border flex items-center justify-center gap-2
          bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700
          disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
            alt="google"
          />
          Continue with Google
        </button>

        <p className="text-center text-sm mt-6 text-zinc-600 dark:text-zinc-400">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-green-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
