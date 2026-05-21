type LegalPageProps = {
  title: string
  children: React.ReactNode
  lastModified?: string
}

export default function LegalPage({ title, children, lastModified }: LegalPageProps) {
  return (
    <div className="min-h-screen py-14 px-6 transition-colors duration-300" style={{ backgroundColor: "var(--bg-color)" }}>
      <div className="max-w-3xl mx-auto">

        {/* Título */}
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-12 transition-colors duration-300" style={{ color: "var(--text-color)" }}>
          {title}
        </h1>

        {/* Card do conteúdo */}
        <div
          className="border rounded-xl p-8 sm:p-10 shadow-md transition-colors duration-300 space-y-6"
          style={{
            backgroundColor: "var(--card-color)",
            color: "var(--text-color)",
            borderColor: "var(--card-color)"
          }}
        >
          {children}

         {lastModified && (
            <div className="mt-8 pt-4 text-sm opacity-70 border-t" style={{ borderColor: "var(--text-color)" }}>
              Última atualização: {lastModified}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}