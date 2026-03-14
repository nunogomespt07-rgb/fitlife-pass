export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundColor: "#070f2b",
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(90,140,255,0.18), transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(60,120,255,0.12), transparent 50%),
          radial-gradient(ellipse 120% 80% at 50% -20%, rgba(59,130,246,0.12), transparent 50%),
          linear-gradient(180deg, #070b14 0%, #0f172a 35%, #0c1222 100%)
        `,
      }}
    >
      <main className="relative mx-auto max-w-[880px] px-4 pb-20 pt-20 sm:px-6 sm:pb-[120px] sm:pt-[120px]">
        <div className="mx-auto max-w-[700px]">
          {children}
        </div>
      </main>
    </div>
  );
}
