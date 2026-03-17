"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  const isLoadFailed =
    error?.message === "Load failed" ||
    (typeof error?.message === "string" && error.message.includes("Load failed"));

  const message = isLoadFailed
    ? "Não foi possível carregar esta página. Verifica a ligação à internet e tenta novamente."
    : "Ocorreu um erro inesperado. Tenta novamente ou volta ao início.";

  return (
    <div className="page-bg flex min-h-screen flex-col items-center justify-center px-6 py-20 text-white font-sans">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Algo correu mal
        </h1>
        <p className="mt-3 text-sm text-white/80">{message}</p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white/95 sm:w-auto"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="w-full rounded-full border border-white/20 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15 sm:w-auto"
          >
            Ir para início
          </Link>
        </div>
      </div>
    </div>
  );
}
