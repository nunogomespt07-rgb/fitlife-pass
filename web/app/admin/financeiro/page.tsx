"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminFinanceiroRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/financas");
  }, [router]);
  return null;
}
