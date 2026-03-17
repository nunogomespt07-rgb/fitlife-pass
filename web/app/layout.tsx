import "./globals.css"
import Providers from "./providers"
import AppChrome from "./components/AppChrome"

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
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  )
}