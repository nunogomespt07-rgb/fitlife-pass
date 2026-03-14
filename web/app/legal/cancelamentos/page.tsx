import Link from "next/link";

export const metadata = {
  title: "Política de Cancelamentos | FitLife Pass",
  description: "Política de Cancelamentos da FitLife Pass",
};

export default function CancelamentosPage() {
  return (
    <article className="text-white">
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Política de Cancelamentos
      </h1>
      <p className="mt-4 text-sm text-white/60">Última atualização: 2026</p>

      <div className="mt-10 space-y-8 leading-[1.7] text-white/90">
        <section>
          <h2 className="text-xl font-semibold text-white">1. Cancelamentos</h2>
          <p className="mt-3">
            As reservas podem ser canceladas até 6 horas antes da atividade.
          </p>
          <p className="mt-2">
            Após esse prazo, a reserva não poderá ser cancelada.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">2. Limite mensal de cancelamentos</h2>
          <p className="mt-3">
            A plataforma pode aplicar um limite mensal de cancelamentos por utilizador.
          </p>
          <p className="mt-2">
            Este limite é utilizado para garantir o uso responsável da plataforma e a disponibilidade justa das vagas.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">3. No-show</h2>
          <p className="mt-3">
            Se o utilizador não comparecer à atividade e não cancelar dentro do prazo permitido:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
            <li>a reserva será considerada no-show</li>
            <li>os créditos utilizados poderão ser perdidos</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">4. QR Codes de ginásio</h2>
          <p className="mt-3">
            As reservas de ginásio geram um QR code temporário.
          </p>
          <p className="mt-2">Esse QR code:</p>
          <ul className="mt-2 list-inside list-disc space-y-1 pl-2">
            <li>tem validade limitada</li>
            <li>expira automaticamente após o período definido pela plataforma</li>
            <li>deixa de estar disponível como reserva ativa após expiração</li>
          </ul>
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
