export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <main className="container mx-auto px-6 flex-grow pt-16">
        {children}
      </main>
    </div>
  );
}
