import "./globals.css"
import Providers from "./providers"
import Nav from "./components/Nav"

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
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  )
}