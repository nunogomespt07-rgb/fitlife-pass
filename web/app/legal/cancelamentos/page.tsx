import LegalBackLink from "../LegalBackLink";

export const metadata = {
  title: "Política de Cancelamentos | FitLife Pass",
  description: "Política de Cancelamentos da FitLife Pass",
};

export default function CancelamentosPage() {
  return (
    <article className="text-white">
      <h1 className="text-[40px] font-bold tracking-[-0.02em] text-white mb-10">
        Política de Cancelamentos
      </h1>
      <p className="text-sm text-white/60">Última atualização: 2026</p>

      <div className="mt-10 space-y-7 text-base leading-[1.7] text-white/85">
        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">1. Cancelamentos</h2>
          <p className="mt-3">
            As reservas podem ser canceladas até 6 horas antes da atividade.
          </p>
          <p className="mt-2">
            Após esse prazo, a reserva não poderá ser cancelada.
          </p>
          <p className="mt-2">
            Quando o cancelamento for efetuado com pelo menos 12 horas de antecedência, os créditos poderão ser devolvidos. Fora deste prazo, os créditos utilizados não são reembolsados.
          </p>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">2. Limite mensal de cancelamentos</h2>
          <p className="mt-3">
            A plataforma aplica um limite de 3 cancelamentos por mês civil por utilizador.
          </p>
          <p className="mt-2">
            Este limite visa garantir o uso responsável da plataforma e a disponibilidade justa das vagas.
          </p>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">3. No-show</h2>
          <p className="mt-3">
            Se o utilizador não comparecer à atividade e não cancelar dentro do prazo permitido, ou se o QR code de ginásio expirar sem utilização:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-2 pl-2">
            <li>a reserva será considerada no-show</li>
            <li>os créditos utilizados não serão reembolsados</li>
          </ul>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">4. QR Codes de ginásio</h2>
          <p className="mt-3">
            As reservas de ginásio geram um QR code temporário com validade de 8 horas a partir da sua criação.
          </p>
          <p className="mt-2">Esse QR code:</p>
          <ul className="mt-2 list-inside list-disc space-y-2 pl-2">
            <li>expira automaticamente após 8 horas</li>
            <li>deixa de estar disponível como reserva ativa após expiração</li>
          </ul>
        </section>
      </div>

      <LegalBackLink />
    </article>
  );
}
