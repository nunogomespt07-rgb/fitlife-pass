'use client';

import { useState } from "react";
import Link from "next/link";
import GlassCard from "../components/ui/GlassCard";

const QUESTIONS: { id: number; question: string; answer: string }[] = [
  {
    id: 1,
    question: "Como funcionam os créditos?",
    answer:
      "Recebes créditos mensais consoante o teu plano. Cada reserva de atividade consome um número de créditos definido para esse tipo de atividade.",
  },
  {
    id: 2,
    question: "Como reservar uma atividade?",
    answer:
      "Vai a Atividades, escolhe o parceiro e a aula ou acesso que pretendes, seleciona o horário e confirma a reserva com créditos.",
  },
  {
    id: 3,
    question: "Posso cancelar uma reserva?",
    answer:
      "Sim. Podes cancelar reservas nas tuas reservas ativas. Se cancelares com pelo menos 12 horas de antecedência, os créditos são devolvidos.",
  },
  {
    id: 4,
    question: "Quando recebo os meus créditos mensais?",
    answer:
      "Os créditos são renovados automaticamente na data de renovação do teu plano, visível na área de Pagamentos.",
  },
  {
    id: 5,
    question: "Como funciona o desconto nos restaurantes?",
    answer:
      "Reservas uma mesa pela app e, no restaurante, basta indicares o teu nome. O desconto FitLife Pass é aplicado diretamente na fatura.",
  },
  {
    id: 6,
    question: "Posso reservar para mais pessoas?",
    answer:
      "Sim. Em padel podes escolher o número de jogadores, e nos restaurantes podes selecionar o número de pessoas para a mesa.",
  },
  {
    id: 7,
    question: "Como funciona o check-in com QR Code?",
    answer:
      "Nos parceiros com acesso de ginásio, a reserva gera um QR Code na tua área de QR Codes. Mostra esse código na receção para fazer check-in.",
  },
  {
    id: 8,
    question: "Posso mudar de plano?",
    answer:
      "Podes consultar e alterar o teu plano na área de Pagamentos, escolhendo entre os diferentes níveis FitLife Start, Core e Pro.",
  },
  {
    id: 9,
    question: "Como comprar créditos extra?",
    answer:
      "Na página de Pagamentos, encontras pacotes de créditos extra que podes adquirir sempre que precisares de mais saldo.",
  },
  {
    id: 10,
    question: "Como convidar amigos para a app?",
    answer:
      "Na tua área de Perfil, terás uma secção de convite com o teu código de referral, que podes partilhar com amigos para ganharem créditos adicionais.",
  },
];

export default function FAQPage() {
  const [openId, setOpenId] = useState<number | null>(1);

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
          Perguntas frequentes
        </h1>
        <p className="mt-2 text-sm text-white/70">
          Encontra respostas rápidas sobre créditos, reservas e plano FitLife Pass.
        </p>

        <div className="mt-8 space-y-3">
          {QUESTIONS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <GlassCard
                key={item.id}
                variant="dark"
                padding="md"
                className="rounded-2xl border border-white/12 bg-white/5 backdrop-blur-xl"
              >
                <button
                  type="button"
                  onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
                  className="flex w-full items-center justify-between gap-3 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-white">{item.question}</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white/80">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-3 text-sm text-white/75">
                    {item.answer}
                  </p>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}

