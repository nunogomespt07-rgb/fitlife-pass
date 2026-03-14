"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getStoredUser } from "@/lib/storedUser";

export default function LegalBackLink() {
  const router = useRouter();
  const { data: session } = useSession();

  const isAuthenticated =
    !!session?.user ||
    (typeof window !== "undefined" && !!localStorage.getItem("token")) ||
    !!getStoredUser()?.id;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  }

  return (
    <p className="mt-12 text-base">
      <button
        type="button"
        onClick={handleClick}
        className="font-medium text-[#5f86ff] underline underline-offset-2 hover:opacity-90"
      >
        ← Voltar
      </button>
    </p>
  );
}
