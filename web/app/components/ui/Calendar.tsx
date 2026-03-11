"use client";

import { useMemo, useState } from "react";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type CalendarProps = {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
};

function toDate(str: string): Date {
  return new Date(str + "T12:00:00");
}

function toYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isSameDay(a: string, b: string): boolean {
  return a === b;
}

function isBefore(a: string, b: string): boolean {
  return toDate(a) < toDate(b);
}

function isAfter(a: string, b: string): boolean {
  return toDate(a) > toDate(b);
}

export default function Calendar({
  value,
  onChange,
  minDate,
  maxDate,
  className = "",
}: CalendarProps) {
  const today = useMemo(() => toYMD(new Date()), []);
  const min = minDate ?? today;
  const max = maxDate ?? toYMD(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));

  const [viewYear, setViewYear] = useState(() => {
    if (value) return parseInt(value.slice(0, 4), 10);
    return new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (value) return parseInt(value.slice(5, 7), 10) - 1;
    return new Date().getMonth();
  });

  const grid = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const last = new Date(viewYear, viewMonth + 1, 0);
    const startWeekday = first.getDay();
    const daysInMonth = last.getDate();
    const rows: (string | null)[][] = [];
    let row: (string | null)[] = [];
    for (let i = 0; i < startWeekday; i++) row.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      row.push(ymd);
      if (row.length === 7) {
        rows.push(row);
        row = [];
      }
    }
    if (row.length) {
      while (row.length < 7) row.push(null);
      rows.push(row);
    }
    return rows;
  }, [viewYear, viewMonth]);

  const canPrev = viewMonth > 0 || viewYear > new Date().getFullYear();
  const canNext = viewMonth < 11 || viewYear < new Date().getFullYear() + 1;

  function goPrev() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNext() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const monthLabel = useMemo(
    () =>
      new Date(viewYear, viewMonth).toLocaleDateString("pt-PT", {
        month: "long",
        year: "numeric",
      }),
    [viewYear, viewMonth]
  );

  function isSelectable(ymd: string | null): boolean {
    if (!ymd) return false;
    if (isBefore(ymd, min)) return false;
    if (isAfter(ymd, max)) return false;
    return true;
  }

  return (
    <div
      className={`rounded-2xl border border-white/[0.12] bg-white/[0.05] p-5 backdrop-blur-xl sm:p-6 ${className}`}
      role="application"
      aria-label="Calendário para escolha de data"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold capitalize text-white">
          {monthLabel}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goPrev}
            disabled={!canPrev}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/90 transition hover:bg-white/10 hover:border-white/25 disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Mês anterior"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!canNext}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/90 transition hover:bg-white/10 hover:border-white/25 disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Mês seguinte"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-white/50"
          >
            {day}
          </div>
        ))}
        {grid.flat().map((ymd, i) => (
          <div key={i} className="flex aspect-square items-center justify-center">
            {ymd ? (
              <button
                type="button"
                onClick={() => isSelectable(ymd) && onChange(ymd)}
                disabled={!isSelectable(ymd)}
                className={`flex h-full w-full items-center justify-center rounded-xl text-sm font-medium transition ${
                  isSameDay(ymd, value)
                    ? "bg-[linear-gradient(135deg,#4EA6FF,#2F6BFF)] text-white shadow-[0_4px_14px_rgba(59,130,246,0.4)]"
                    : isSelectable(ymd)
                      ? "text-white hover:bg-white/10 hover:border hover:border-white/20"
                      : "cursor-not-allowed text-white/30"
                }`}
              >
                {ymd ? new Date(ymd + "T12:00:00").getDate() : ""}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
