"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import HexLogo from "@/components/auth/HexLogo";
import toast from "react-hot-toast";

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least 1 letter"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await authApi.register(data);
      setUser(response.data);
      toast.success("Account created! Welcome to HEXASHOP.");
      router.push("/");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      const msg = detail
        ? Object.values(detail).flat().join(" ")
        : "Registration failed";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="relative rounded-2xl border border-brand-border bg-brand-surface/80 backdrop-blur-sm p-8 shadow-[0_0_40px_rgba(245,166,35,0.04)]">
          {/* Subtle corner accents */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-brand-primary/20 rounded-tl-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-brand-primary/20 rounded-br-2xl pointer-events-none" />

          <div className="text-center mb-7">
            <HexLogo size={52} />
            <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
            <p className="text-brand-muted text-sm mt-1.5">Join HEXASHOP today</p>
          </div>

          <GoogleSignInButton mode="register" />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-brand-surface px-3 text-brand-muted">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                <input
                  {...register("full_name")}
                  type="text"
                  autoComplete="name"
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors"
                />
              </div>
              {errors.full_name && (
                <p className="text-red-400 text-xs mt-1.5">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-muted" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••"
                  className="w-full pl-10 pr-11 py-3 bg-brand-dark border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
              )}
              <p className="text-brand-muted/60 text-xs mt-1.5">Min 4 characters with at least 1 letter</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-2 rounded-xl font-semibold text-sm text-black bg-gradient-to-r from-brand-primary to-yellow-500 hover:from-yellow-400 hover:to-brand-primary transition-all duration-300 shadow-[0_4px_16px_rgba(245,166,35,0.25)] hover:shadow-[0_6px_24px_rgba(245,166,35,0.35)] disabled:opacity-50"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-brand-muted mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-brand-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
