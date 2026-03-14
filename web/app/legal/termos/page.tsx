import LegalBackLink from "../LegalBackLink";

export const metadata = {
  title: "Termos e Condições | FitLife Pass",
  description: "Termos e Condições da plataforma FitLife Pass",
};

export default function TermosPage() {
  return (
    <article className="text-white">
      <h1 className="text-[40px] font-bold tracking-[-0.02em] text-white mb-10">
        Termos e Condições
      </h1>
      <p className="text-sm text-white/60">Última atualização: 2026</p>

      <div className="mt-10 space-y-7 text-base leading-[1.7] text-white/85">
        <p>
          Bem-vindo à FitLife Pass.
        </p>
        <p>
          A FitLife Pass é uma plataforma digital que permite aos utilizadores reservar e participar em atividades desportivas e de bem-estar através de um sistema de créditos associado a um plano de subscrição.
        </p>
        <p>
          Ao criar uma conta ou utilizar a plataforma, o utilizador declara que leu, compreendeu e aceita estes Termos e Condições.
        </p>
        <p>
          Caso não concorde com estes termos, não deverá utilizar o serviço.
        </p>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">1. Elegibilidade</h2>
          <p className="mt-3">
            Para utilizar a plataforma FitLife Pass o utilizador deve:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-2 pl-2">
            <li>ter 16 anos ou mais</li>
            <li>fornecer informações verdadeiras e atualizadas</li>
            <li>manter a confidencialidade da sua conta</li>
          </ul>
          <p className="mt-3">
            A FitLife Pass pode suspender contas que violem estas regras.
          </p>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">2. Conta de Utilizador</h2>
          <p className="mt-3">
            Ao criar uma conta o utilizador concorda em:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-2 pl-2">
            <li>fornecer dados verdadeiros</li>
            <li>manter a segurança da conta</li>
            <li>não partilhar acesso com terceiros</li>
          </ul>
          <p className="mt-3">
            O utilizador é responsável por toda a atividade realizada na sua conta.
          </p>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">3. Planos e Créditos</h2>
          <p className="mt-3">
            A plataforma funciona através de um sistema de créditos.
          </p>
          <p className="mt-2">
            Cada atividade possui um custo em créditos que é deduzido no momento da reserva.
          </p>
          <p className="mt-2">Os créditos:</p>
          <ul className="mt-2 list-inside list-disc space-y-2 pl-2">
            <li>não são transferíveis</li>
            <li>não podem ser convertidos em dinheiro</li>
            <li>podem ter validade associada ao plano</li>
          </ul>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">4. Reservas de Atividades</h2>
          <p className="mt-3">
            Os utilizadores podem reservar atividades disponíveis na plataforma.
          </p>
          <p className="mt-2">A disponibilidade depende de:</p>
          <ul className="mt-2 list-inside list-disc space-y-2 pl-2">
            <li>horários definidos pelos parceiros</li>
            <li>capacidade das atividades</li>
            <li>disponibilidade na plataforma</li>
          </ul>
          <p className="mt-3">
            A FitLife Pass não garante disponibilidade permanente.
          </p>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">5. Cancelamentos</h2>
          <p className="mt-3">
            As reservas podem ser canceladas até 6 horas antes da atividade.
          </p>
          <p className="mt-2">
            Quando o cancelamento for efetuado com pelo menos 12 horas de antecedência, os créditos poderão ser devolvidos. Fora deste prazo, os créditos utilizados não são reembolsados.
          </p>
          <p className="mt-2">
            A plataforma aplica um limite de 3 cancelamentos por mês civil por utilizador.
          </p>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">6. No-show</h2>
          <p className="mt-3">
            Se um utilizador não comparecer a uma atividade reservada e não cancelar dentro do prazo permitido, ou se o QR code de ginásio expirar sem utilização, a reserva será considerada no-show.
          </p>
          <p className="mt-2">Nestes casos:</p>
          <ul className="mt-2 list-inside list-disc space-y-2 pl-2">
            <li>os créditos utilizados não serão reembolsados</li>
          </ul>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">7. QR Code e Check-in</h2>
          <p className="mt-3">
            Algumas atividades podem exigir QR code para check-in.
          </p>
          <p className="mt-2">
            O QR code das reservas de ginásio tem validade de 8 horas a partir da sua criação. Outros QR codes podem ter validade limitada conforme definido na plataforma.
          </p>
          <p className="mt-2">
            QR codes expirados deixam de ser válidos.
          </p>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">8. Parceiros</h2>
          <p className="mt-3">
            As atividades disponíveis são operadas por parceiros independentes.
          </p>
          <p className="mt-2">
            A FitLife Pass atua como plataforma intermediária, não sendo responsável por:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-2 pl-2">
            <li>alterações de horários</li>
            <li>cancelamentos de atividades</li>
            <li>qualidade do serviço prestado pelos parceiros</li>
          </ul>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">9. Suspensão de Conta</h2>
          <p className="mt-3">
            A FitLife Pass pode suspender contas que:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-2 pl-2">
            <li>abusem do sistema de reservas</li>
            <li>violem estes termos</li>
            <li>utilizem a plataforma de forma fraudulenta</li>
          </ul>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">10. Alterações ao Serviço</h2>
          <p className="mt-3">
            A FitLife Pass pode modificar funcionalidades, planos ou preços a qualquer momento.
          </p>
          <p className="mt-2">
            Sempre que possível os utilizadores serão informados previamente.
          </p>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">11. Lei Aplicável</h2>
          <p className="mt-3">
            Estes termos são regidos pela legislação portuguesa.
          </p>
          <p className="mt-2">
            Qualquer litígio será resolvido nos tribunais competentes em Portugal.
          </p>
        </section>
      </div>

      <LegalBackLink />
    </article>
  );
}
