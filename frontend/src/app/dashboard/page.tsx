"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag, Heart, User, MapPin, CreditCard, Settings, LogOut, Package,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Skeleton } from "@/components/ui/Skeleton";

const NAV_ITEMS = [
  { icon: ShoppingBag, label: "Orders", href: "/dashboard/orders", active: true },
  { icon: Heart, label: "Wishlist", href: "/wishlist" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
  { icon: MapPin, label: "Addresses", href: "/dashboard/addresses" },
  { icon: CreditCard, label: "Payment Methods", href: "/dashboard/payments" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-32 rounded-2xl mb-6" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 hidden md:block">
          <div className="card p-4 sticky top-24">
            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-brand-border">
              <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center font-bold text-black">
                {user?.first_name?.charAt(0) || user?.email?.charAt(0) || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-brand-muted truncate">{user?.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {NAV_ITEMS.map(({ icon: Icon, label, href, active }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    active
                      ? "bg-brand-primary/10 text-brand-primary"
                      : "text-brand-muted hover:bg-brand-border hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-colors w-full"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-6">My Orders</h1>

          {/* Placeholder orders table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-brand-dark">
                  <tr>
                    {["Order ID", "Date", "Items", "Total", "Status", "Action"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-brand-muted uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  <tr className="text-center">
                    <td colSpan={6} className="py-12 text-brand-muted">
                      <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p>No orders yet</p>
                      <Link href="/shop" className="text-brand-primary hover:underline text-sm mt-2 inline-block">
                        Start Shopping
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
