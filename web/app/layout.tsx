import "./globals.css"
import Providers from "./providers"
import Nav from "./components/Nav"
import MobileDashboardNav from "./components/MobileDashboardNav"
import Footer from "./components/Footer"
import { MobileSearchProvider } from "./components/Nav"

export const metadata = {
  title: "FitLife Pass",
  description: "FitLife Pass — Reserve aulas de fitness em segundos",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body>
        <Providers>
          <MobileSearchProvider>
            <Nav />
            {children}
            <Footer />
            <MobileDashboardNav />
          </MobileSearchProvider>
        </Providers>
      </body>
    </html>
  )
}