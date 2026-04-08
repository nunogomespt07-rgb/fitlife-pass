import { Suspense } from "react";
import EmailAuthCard from "@/app/components/EmailAuthCard";

/**
 * Registo/login por e-mail (JWT em localStorage).
 * O acesso a `/dashboard` não pode depender de NextAuth no middleware — ver `middleware.ts`.
 */
export default function AuthEmailPage() {
  return (
    <div className="page-bg min-h-screen text-white font-sans">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-10 sm:px-6 lg:px-10 lg:py-24">
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl">
          <Suspense fallback={null}>
            <EmailAuthCard />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
