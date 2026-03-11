"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getRestaurantById } from "@/lib/restaurantsData";
import { useMockReservations } from "@/app/context/MockReservationsContext";
import { DEMO_USER_NAME } from "@/lib/mockRestaurantReservations";
import GlassCard from "@/app/components/ui/GlassCard";
import PrimaryButton from "@/app/components/ui/PrimaryButton";
import Calendar from "@/app/components/ui/Calendar";

const TIME_SLOTS = [
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "19:00",
  "19:30",
  "20:00",
];

function todayYMD(): string {
  return new Date().toISOString().slice(0, 10);
}

function maxDateYMD(): string {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toISOString().slice(0, 10);
}

export default function RestaurantReservarPage() {
  const params = useParams() as { restaurantId?: string | string[] };
  const rawId = params.restaurantId;
  const restaurantId = Array.isArray(rawId) ? rawId[0] : rawId ?? "";
  const restaurant = getRestaurantById(restaurantId);
  const { addRestaurantReservation } = useMockReservations();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [partySize, setPartySize] = useState(2);
  const [bookingMode, setBookingMode] = useState<"credits" | "discount">("discount");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = useCallback(() => {
    if (!restaurant || !selectedDate || !selectedTime) return;
    setErrorMessage(null);
    const result = addRestaurantReservation({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      date: selectedDate,
      time: selectedTime,
      userName: DEMO_USER_NAME,
      discountLabel: restaurant.fitlifeBenefit,
      partySize,
      bookingMode,
    } as any);
    if (result.success) {
      setStep(5);
    } else if (result.error) {
      setErrorMessage(result.error);
    }
  }, [restaurant, selectedDate, selectedTime, partySize, bookingMode, addRestaurantReservation]);

  const formattedDate = useMemo(() => {
    if (!selectedDate) return "";
    const d = new Date(selectedDate + "T12:00:00");
    return d.toLocaleDateString("pt-PT", { day: "numeric", month: "long" });
  }, [selectedDate]);

  if (!restaurant) {
    return (
      <div className="page-bg text-white font-sans min-h-screen">
        <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6 lg:px-10">
          <GlassCard variant="dark" padding="lg">
            <p className="text-sm font-medium text-white">Restaurante não encontrado.</p>
            <Link
              href="/activities/categorias/healthy-food"
              className="mt-4 inline-flex text-sm font-medium text-white/80 underline-offset-2 hover:underline"
            >
              ← Voltar a Healthy Food
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (step === 5) {
    return (
      <div className="page-bg min-h-screen font-sans text-white">
        <div className="mx-auto max-w-lg px-4 pb-24 pt-24 sm:px-6 lg:px-10">
          <GlassCard
            variant="dark"
            padding="lg"
            className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 backdrop-blur-xl"
          >
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Reserva confirmada
            </h1>
            <div className="mt-6 space-y-3 text-sm">
              <p className="font-semibold text-white">{restaurant.name}</p>
              <p className="text-white/90">{formattedDate} — {selectedTime}</p>
              {partySize != null && (
                <p className="text-white/80">{partySize} {partySize === 1 ? "pessoa" : "pessoas"}</p>
              )}
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-white/60">
                Reserva em nome de:
              </p>
              <p className="text-white">{DEMO_USER_NAME}</p>
              <div className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300/90">
                  Benefício FitLife Pass
                </p>
                <p className="mt-1 text-sm font-medium text-emerald-100">
                  {restaurant.fitlifeBenefit} aplicado
                </p>
              </div>
              <p className="mt-4 text-xs text-white/70">
                Não é necessário QR code. Apresenta o teu nome no restaurante para usufruir do desconto.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/dashboard/reservas">
                <PrimaryButton variant="primary">Ver as minhas reservas</PrimaryButton>
              </Link>
              <Link href="/activities/categorias/healthy-food">
                <PrimaryButton variant="secondary">Voltar a Healthy Food</PrimaryButton>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg min-h-screen font-sans text-white">
      <div className="mx-auto max-w-lg px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <Link
          href={`/activities/categorias/healthy-food/restaurantes/${restaurant.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 transition hover:text-white"
        >
          ← Voltar ao restaurante
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl">
            <Image
              src={restaurant.imageSrc}
              alt=""
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              {restaurant.name}
            </h1>
            <p className="text-sm text-white/70">Reservar mesa</p>
          </div>
        </div>

        <div className="mt-8">
          {step === 1 && (
            <GlassCard variant="dark" padding="lg" className="rounded-2xl border-white/12 bg-white/5 backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-white">Escolhe a data</h2>
              <p className="mt-1 text-sm text-white/70">Seleciona o dia para a tua reserva.</p>
              <div className="mt-6">
                <Calendar
                  value={selectedDate}
                  onChange={setSelectedDate}
                  minDate={todayYMD()}
                  maxDate={maxDateYMD()}
                />
              </div>
              {selectedDate && (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <PrimaryButton
                    variant="primary"
                    onClick={() => setStep(2)}
                  >
                    Continuar
                  </PrimaryButton>
                  <p className="text-sm text-white/70">
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-PT", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              )}
            </GlassCard>
          )}

          {step === 2 && (
            <GlassCard variant="dark" padding="lg" className="rounded-2xl border-white/12 bg-white/5 backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-white">Escolhe a hora</h2>
              <p className="mt-1 text-sm text-white/70">Horários disponíveis para {formattedDate}.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {TIME_SLOTS.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      setSelectedTime(time);
                      setStep(3);
                    }}
                    className={`rounded-xl border px-5 py-3 text-sm font-medium transition ${
                      selectedTime === time
                        ? "border-blue-400/50 bg-blue-500/20 text-white"
                        : "border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-6 text-sm font-medium text-white/70 underline-offset-2 hover:text-white"
              >
                ← Alterar data
              </button>
            </GlassCard>
          )}

          {step === 3 && (
            <GlassCard variant="dark" padding="lg" className="rounded-2xl border-white/12 bg-white/5 backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-white">Número de pessoas</h2>
              <p className="mt-1 text-sm text-white/70">Para quantas pessoas é a reserva?</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPartySize(n)}
                    className={`rounded-xl border px-5 py-3 text-sm font-medium transition ${
                      partySize === n
                        ? "border-blue-400/50 bg-blue-500/20 text-white"
                        : "border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25"
                    }`}
                  >
                    {n} {n === 1 ? "pessoa" : "pessoas"}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <PrimaryButton variant="primary" onClick={() => setStep(4)}>
                  Continuar
                </PrimaryButton>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-sm font-medium text-white/70 underline-offset-2 hover:text-white"
                >
                  ← Alterar hora
                </button>
              </div>
            </GlassCard>
          )}

          {step === 4 && (
            <GlassCard variant="dark" padding="lg" className="rounded-2xl border-white/12 bg-white/5 backdrop-blur-xl">
              <h2 className="text-lg font-semibold text-white">Confirmar reserva</h2>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
                <p className="font-semibold text-white">{restaurant.name}</p>
                <p className="mt-1 text-white/90">{formattedDate} — {selectedTime}</p>
                <p className="mt-2 text-white/80">
                  {partySize} {partySize === 1 ? "pessoa" : "pessoas"} ·{" "}
                  {bookingMode === "credits"
                    ? `${(partySize || 1) * 6} crédito${(partySize || 1) * 6 !== 1 ? "s" : ""}`
                    : "10% desconto exclusivo"}
                </p>
                <p className="mt-3 text-xs text-white/60">Em nome de: {DEMO_USER_NAME}</p>
                {bookingMode === "discount" && (
                  <p className="mt-2 text-xs font-medium text-emerald-300/90">
                    Benefício FitLife Pass — {restaurant.fitlifeBenefit}
                  </p>
                )}
              </div>
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Como queres usar a tua reserva?
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setBookingMode("credits")}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      bookingMode === "credits"
                        ? "border-blue-400/60 bg-blue-500/20 text-white shadow-[0_0_0_1px_rgba(59,130,246,0.4)]"
                        : "border-white/15 bg-white/5 text-white/85 hover:bg-white/10 hover:border-white/25"
                    }`}
                  >
                    <span className="block font-semibold">Pagar com créditos</span>
                    <span className="mt-1 block text-xs text-white/70">
                      {(partySize || 1) * 6} crédito{(partySize || 1) * 6 !== 1 ? "s" : ""} para{" "}
                      {partySize} {partySize === 1 ? "pessoa" : "pessoas"}.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingMode("discount")}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      bookingMode === "discount"
                        ? "border-emerald-400/60 bg-emerald-500/20 text-white shadow-[0_0_0_1px_rgba(52,211,153,0.4)]"
                        : "border-white/15 bg-white/5 text-white/85 hover:bg-white/10 hover:border-white/25"
                    }`}
                  >
                    <span className="block font-semibold">
                      Usar benefício FitLife Pass — 10% desconto
                    </span>
                    <span className="mt-1 block text-xs text-white/70">
                      Não são debitados créditos. Desconto aplicado no restaurante.
                    </span>
                  </button>
                </div>
              </div>
              {errorMessage && (
                <p className="mt-4 text-sm text-red-200">
                  {errorMessage}
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <PrimaryButton variant="primary" onClick={handleConfirm}>
                  Confirmar reserva
                </PrimaryButton>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-full border border-white/22 bg-white/6 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  ← Alterar número de pessoas
                </button>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
