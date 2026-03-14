import Link from "next/link";

export const metadata = {
  title: "Política de Cookies | FitLife Pass",
  description: "Política de Cookies da FitLife Pass",
};

export default function CookiesPage() {
  return (
    <article className="text-white">
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Política de Cookies
      </h1>
      <p className="mt-4 text-sm text-white/60">Última atualização: 2026</p>

      <div className="mt-10 space-y-8 leading-[1.7] text-white/90">
        <p>
          A FitLife Pass utiliza cookies e tecnologias semelhantes para melhorar a experiência do utilizador.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-white">1. O que são cookies</h2>
          <p className="mt-3">
            Cookies são pequenos ficheiros armazenados no dispositivo do utilizador que ajudam a reconhecer preferências, sessões e padrões de utilização.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">2. Como utilizamos cookies</h2>
          <p className="mt-3">Os cookies podem ser utilizados para:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
            <li>autenticação de sessão</li>
            <li>preferências do utilizador</li>
            <li>melhoria da experiência de navegação</li>
            <li>análise técnica de utilização da plataforma</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">3. Controlo de cookies</h2>
          <p className="mt-3">
            Os utilizadores podem controlar ou desativar cookies através das definições do navegador.
          </p>
          <p className="mt-2">
            A desativação de certos cookies pode afetar o funcionamento normal da plataforma.
          </p>
        </section>
      </div>

      <p className="mt-12 text-sm text-white/50">
        <Link href="/" className="underline underline-offset-2 hover:text-white/70">
          ← Voltar
        </Link>
      </p>
    </article>
  );
}
