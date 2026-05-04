"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const { fetchCart, guestSessionKey } = useCartStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await authApi.login(data.email, data.password, guestSessionKey || undefined);
      setUser(response.data);
      await fetchCart();
      toast.success("Welcome back!");
      router.push("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Invalid credentials";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-black font-bold text-lg">H</span>
            </div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-brand-muted text-sm mt-1">Sign in to your HEXASHOP account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email Address</label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary pr-11"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-brand-muted mt-6">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-brand-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
