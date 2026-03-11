"use client"

import { SessionProvider } from "next-auth/react"
import { MockReservationsProvider } from "./context/MockReservationsContext"
import { FavoritesProvider } from "./context/FavoritesContext"
import { NotificationsProvider } from "./context/NotificationsContext"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MockReservationsProvider>
        <FavoritesProvider>
          <NotificationsProvider>
            {children}
          </NotificationsProvider>
        </FavoritesProvider>
      </MockReservationsProvider>
    </SessionProvider>
  )
}