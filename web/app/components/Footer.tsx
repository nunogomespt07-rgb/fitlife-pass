import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-transparent py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        <nav
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-sm text-white/50"
          aria-label="Legal"
        >
          <Link
            href="/legal/termos"
            className="transition hover:text-white/80"
          >
            Termos e Condições
          </Link>
          <Link
            href="/legal/privacidade"
            className="transition hover:text-white/80"
          >
            Política de Privacidade
          </Link>
          <Link
            href="/legal/cancelamentos"
            className="transition hover:text-white/80"
          >
            Política de Cancelamentos
          </Link>
          <Link
            href="/legal/cookies"
            className="transition hover:text-white/80"
          >
            Política de Cookies
          </Link>
        </nav>
        <p className="mt-4 text-center text-xs text-white/40">
          FitLife Pass
        </p>
      </div>
    </footer>
  );
}
