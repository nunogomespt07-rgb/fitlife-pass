"use client"

import { SessionProvider } from "next-auth/react"
import { CreditActivityProvider } from "./context/CreditActivityContext"
import { MockReservationsProvider } from "./context/MockReservationsContext"
import { FavoritesProvider } from "./context/FavoritesContext"
import { NotificationsProvider } from "./context/NotificationsContext"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CreditActivityProvider>
        <MockReservationsProvider>
          <FavoritesProvider>
            <NotificationsProvider>
              {children}
            </NotificationsProvider>
          </FavoritesProvider>
        </MockReservationsProvider>
      </CreditActivityProvider>
    </SessionProvider>
  )
}