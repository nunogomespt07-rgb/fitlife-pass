export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-bg min-h-screen">
      <main className="mx-auto max-w-[900px] px-4 pb-[120px] pt-[120px] sm:px-6">
        {children}
      </main>
    </div>
  );
}
