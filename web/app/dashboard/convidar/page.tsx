"use client";

import Link from "next/link";
import GlassCard from "../../components/ui/GlassCard";
import PrimaryButton from "../../components/ui/PrimaryButton";

type Invite = {
  id: string;
  friendName: string;
  status: "pending" | "active";
  rewardCredits: number;
};

const MOCK_REFERRAL_CODE = "FITLIFE-DEMO23";

const MOCK_INVITES: Invite[] = [
  {
    id: "1",
    friendName: "João Silva",
    status: "active",
    rewardCredits: 5,
  },
  {
    id: "2",
    friendName: "Maria Costa",
    status: "pending",
    rewardCredits: 0,
  },
];

export default function DashboardConvidarPage() {
  const invites = MOCK_INVITES;

  return (
    <div className="page-bg min-h-screen font-sans text-white">
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition hover:text-white"
        >
          ← Voltar à conta
        </Link>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Convida amigos
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Ganha 5 créditos por cada amigo que subscrever o FitLife Pass.
        </p>

        <GlassCard
          variant="dark"
          padding="lg"
          className="mt-8 rounded-2xl border-white/12 bg-white/5 backdrop-blur-xl"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">
            O teu código de convite
          </h2>
          <p className="mt-3 text-lg font-semibold tracking-wide text-white">
            {MOCK_REFERRAL_CODE}
          </p>
          <p className="mt-1 text-xs text-white/60">
            Partilha este código com amigos para que usem no registo.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <PrimaryButton
              variant="primary"
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard?.writeText(MOCK_REFERRAL_CODE).catch(() => {});
                }
              }}
            >
              Copiar código
            </PrimaryButton>
            <PrimaryButton
              variant="secondary"
              onClick={() => {
                if (typeof window === "undefined") return;
                const baseUrl = "https://fitlifepass.com/signup";
                const code = MOCK_REFERRAL_CODE;
                const link = `${baseUrl}?ref=${encodeURIComponent(code)}`;
                const message =
                  `Experimenta a FitLife Pass 💙\n\n` +
                  `Usa o meu código de convite: ${code}\n\n` +
                  `Se subscreveres, ganhamos ambos +5 créditos.\n\n` +
                  `Link: ${link}`;
                const encoded = encodeURIComponent(message);
                const waUrl = `https://wa.me/?text=${encoded}`;
                const opened = window.open(waUrl, "_blank", "noopener,noreferrer");
                if (!opened) {
                  navigator.clipboard
                    ?.writeText(message)
                    .then(() => {
                      // Fallback simples: alert como pseudo-toast
                      alert("Convite copiado com sucesso");
                    })
                    .catch(() => {});
                }
              }}
            >
              Partilhar convite
            </PrimaryButton>
          </div>
        </GlassCard>

        <GlassCard
          variant="dark"
          padding="lg"
          className="mt-8 rounded-2xl border-white/12 bg-white/5 backdrop-blur-xl"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">
            Convites
          </h2>
          {invites.length === 0 ? (
            <p className="mt-4 text-sm text-white/70">
              Ainda não convidaste amigos. Partilha o teu código para começares a ganhar créditos.
            </p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {invites.map((invite) => (
                <li
                  key={invite.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{invite.friendName}</p>
                    <p className="text-xs text-white/65">
                      {invite.status === "active"
                        ? "subscrição ativa"
                        : "ainda não subscreveu"}
                    </p>
                  </div>
                  <div className="text-right">
                    {invite.rewardCredits > 0 ? (
                      <>
                        <p className="text-xs font-semibold text-emerald-300">
                          +{invite.rewardCredits} créditos
                        </p>
                        <p className="text-[11px] text-emerald-200/80">recompensa atribuída</p>
                      </>
                    ) : (
                      <p className="text-[11px] text-white/55">sem recompensa ainda</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

