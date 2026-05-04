"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

const schema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password2: z.string(),
}).refine((d) => d.password === d.password2, {
  message: "Passwords do not match",
  path: ["password2"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
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

  const fields: Array<{
    name: keyof FormData;
    label: string;
    type: string;
    placeholder: string;
    autoComplete: string;
  }> = [
    { name: "first_name", label: "First Name", type: "text", placeholder: "John", autoComplete: "given-name" },
    { name: "last_name", label: "Last Name", type: "text", placeholder: "Doe", autoComplete: "family-name" },
    { name: "username", label: "Username", type: "text", placeholder: "johndoe", autoComplete: "username" },
    { name: "email", label: "Email Address", type: "email", placeholder: "john@example.com", autoComplete: "email" },
    { name: "password", label: "Password", type: "password", placeholder: "••••••••", autoComplete: "new-password" },
    { name: "password2", label: "Confirm Password", type: "password", placeholder: "••••••••", autoComplete: "new-password" },
  ];

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-black font-bold text-lg">H</span>
            </div>
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-brand-muted text-sm mt-1">Join HEXASHOP today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {fields.slice(0, 2).map((f) => (
                <div key={f.name}>
                  <label className="block text-sm font-medium mb-1.5">{f.label}</label>
                  <input
                    {...register(f.name)}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 bg-brand-dark border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                  {errors[f.name] && (
                    <p className="text-red-400 text-xs mt-1">{errors[f.name]?.message}</p>
                  )}
                </div>
              ))}
            </div>

            {fields.slice(2).map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium mb-1.5">{f.label}</label>
                <input
                  {...register(f.name)}
                  type={f.type}
                  autoComplete={f.autoComplete}
                  placeholder={f.placeholder}
                  className="w-full px-4 py-3 bg-brand-dark border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                {errors[f.name] && (
                  <p className="text-red-400 text-xs mt-1">{errors[f.name]?.message}</p>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 mt-2"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-brand-muted mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-brand-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
