import LegalBackLink from "../LegalBackLink";

export const metadata = {
  title: "Política de Privacidade | FitLife Pass",
  description: "Política de Privacidade da FitLife Pass",
};

export default function PrivacidadePage() {
  return (
    <article className="text-white">
      <h1 className="text-[40px] font-bold tracking-[-0.02em] text-white mb-10">
        Política de Privacidade
      </h1>
      <p className="text-sm text-white/60">Última atualização: 2026</p>

      <div className="mt-10 space-y-7 text-base leading-[1.7] text-white/85">
        <p>
          A FitLife Pass compromete-se a proteger a privacidade dos seus utilizadores em conformidade com o Regulamento Geral de Proteção de Dados (RGPD).
        </p>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">1. Dados recolhidos</h2>
          <p className="mt-3">Podemos recolher:</p>
          <ul className="mt-2 list-inside list-disc space-y-2 pl-2">
            <li>nome</li>
            <li>email</li>
            <li>data de nascimento</li>
            <li>informações de reservas</li>
            <li>dados de utilização da plataforma</li>
          </ul>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">2. Finalidade dos dados</h2>
          <p className="mt-3">Os dados são utilizados para:</p>
          <ul className="mt-2 list-inside list-disc space-y-2 pl-2">
            <li>criar e gerir contas</li>
            <li>permitir reservas de atividades</li>
            <li>melhorar o serviço</li>
            <li>comunicar com utilizadores</li>
            <li>assegurar o funcionamento da plataforma</li>
          </ul>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">3. Base legal</h2>
          <p className="mt-3">O tratamento de dados baseia-se em:</p>
          <ul className="mt-2 list-inside list-disc space-y-2 pl-2">
            <li>execução de contrato</li>
            <li>cumprimento de obrigações legais</li>
            <li>consentimento do utilizador, quando aplicável</li>
          </ul>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">4. Partilha de dados</h2>
          <p className="mt-3">
            Alguns dados podem ser partilhados com:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-2 pl-2">
            <li>parceiros que operam atividades reservadas através da plataforma</li>
            <li>fornecedores tecnológicos necessários ao funcionamento do serviço</li>
          </ul>
          <p className="mt-3">
            A FitLife Pass não vende dados pessoais a terceiros.
          </p>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">5. Direitos do utilizador</h2>
          <p className="mt-3">Os utilizadores têm direito a:</p>
          <ul className="mt-2 list-inside list-disc space-y-2 pl-2">
            <li>acesso aos seus dados</li>
            <li>retificação</li>
            <li>eliminação</li>
            <li>limitação do tratamento</li>
            <li>portabilidade dos dados</li>
            <li>oposição, nos termos legais aplicáveis</li>
          </ul>
          <p className="mt-3">
            Pedidos relacionados com privacidade podem ser enviados para:
          </p>
          <p className="mt-1">
            <a href="mailto:privacy@fitlifepass.com" className="font-medium text-[#5f86ff] underline underline-offset-2 hover:opacity-90">
              privacy@fitlifepass.com
            </a>
          </p>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">6. Retenção de dados</h2>
          <p className="mt-3">
            Os dados serão conservados apenas durante o período necessário para:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-2 pl-2">
            <li>prestar o serviço</li>
            <li>cumprir obrigações legais</li>
            <li>gerir relações contratuais e operacionais</li>
          </ul>
        </section>

        <section className="mb-7">
          <h2 className="text-[22px] font-semibold text-white mt-10 mb-[14px]">7. Segurança</h2>
          <p className="mt-3">
            A FitLife Pass adota medidas técnicas e organizacionais adequadas para proteger os dados dos utilizadores contra acesso não autorizado, perda, alteração ou divulgação indevida.
          </p>
        </section>
      </div>

      <LegalBackLink />
    </article>
  );
}
