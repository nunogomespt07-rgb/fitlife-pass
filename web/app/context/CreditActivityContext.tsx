"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  getStoredCreditTransactions,
  getStoredCreditTransactionsCount,
  appendCreditTransaction,
  type CreditTransaction,
} from "@/lib/creditActivity";
import { getStoredUser } from "@/lib/storedUser";

const INITIAL_PAGE_SIZE = 20;

type ToastItem = { id: string; title: string; subtitle?: string };

type CreditActivityContextValue = {
  /** Transactions for current user (newest first), limited to visible count. */
  transactions: CreditTransaction[];
  /** Whether there are more transactions to load. */
  hasMore: boolean;
  /** Load next page of transactions. */
  loadMore: () => void;
  /** Append a transaction (persists and updates state). */
  addTransaction: (
    tx: Omit<CreditTransaction, "id" | "userId" | "createdAt">
  ) => void;
  /** Show a minimal toast (top-right, 2s). */
  showToast: (title: string, subtitle?: string) => void;
};

const CreditActivityContext = createContext<CreditActivityContextValue | null>(
  null
);

function readTransactions(userId: string | null, limit: number): CreditTransaction[] {
  if (!userId) return [];
  return getStoredCreditTransactions(userId, limit, 0);
}

export function CreditActivityProvider({ children }: { children: React.ReactNode }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const userId = getStoredUser()?.id ?? null;

  const totalCount = getStoredCreditTransactionsCount(userId);
  const hasMore = totalCount > visibleCount;

  useEffect(() => {
    setTransactions(readTransactions(userId, visibleCount));
  }, [userId, visibleCount]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + INITIAL_PAGE_SIZE);
  }, []);

  const addTransaction = useCallback(
    (tx: Omit<CreditTransaction, "id" | "userId" | "createdAt">) => {
      const uid = getStoredUser()?.id ?? null;
      const added = appendCreditTransaction(uid, tx);
      if (added) {
        setTransactions((prev) => [added, ...prev]);
      }
    },
    []
  );

  const showToast = useCallback((title: string, subtitle?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, title, subtitle }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2000);
  }, []);

  const value = useMemo<CreditActivityContextValue>(
    () => ({
      transactions,
      hasMore,
      loadMore,
      addTransaction,
      showToast,
    }),
    [transactions, hasMore, loadMore, addTransaction, showToast]
  );

  return (
    <CreditActivityContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed right-4 top-4 z-[9999] flex flex-col gap-2"
            aria-live="polite"
          >
            {toasts.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-white/20 bg-slate-900/95 px-4 py-3 shadow-lg backdrop-blur-sm"
              >
                <p className="text-sm font-medium text-white">{t.title}</p>
                {t.subtitle && (
                  <p className="mt-0.5 text-xs text-white/80">{t.subtitle}</p>
                )}
              </div>
            ))}
          </div>,
          document.body
        )}
    </CreditActivityContext.Provider>
  );
}

export function useCreditActivity(): CreditActivityContextValue | null {
  return useContext(CreditActivityContext);
}

export function useCreditActivityRequired(): CreditActivityContextValue {
  const ctx = useContext(CreditActivityContext);
  if (!ctx) {
    throw new Error("useCreditActivityRequired must be used within CreditActivityProvider");
  }
  return ctx;
}
