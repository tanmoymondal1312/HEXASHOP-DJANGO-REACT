"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppInit() {
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    fetchUser();
    fetchCart();
  }, [fetchUser, fetchCart]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInit />
      {children}
    </QueryClientProvider>
  );
}
