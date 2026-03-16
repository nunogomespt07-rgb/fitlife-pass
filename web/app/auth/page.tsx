import { Suspense } from "react";
import PremiumAuthCard from "../components/PremiumAuthCard";

export default function AuthPage() {
  return (
    <div className="page-bg min-h-screen text-white font-sans">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 sm:px-6 lg:px-10 lg:pt-24 lg:pb-24">
        <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl">
          <Suspense fallback={null}>
            <PremiumAuthCard mode="full" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

