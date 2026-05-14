import { Linkedin, Github } from "lucide-react"

export default function Contato() {
  return (
    <main className="min-h-screen px-6 py-16 flex items-center justify-center" style={{ backgroundColor: "var(--bg-color)" }}>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-12">

        {/* ESQUERDA */}
        <div className="space-y-8 text-center lg:text-left">

          <h1 className="text-3xl md:text-4xl font-bold">
            Contato
          </h1>

          <p className="max-w-md mx-auto lg:mx-0">
            Envie sua sugestão de melhoria no formulário ao lado e nos ajude
            a desenvolver soluções que atendam melhor às necessidades dos jovens!
          </p>

          <div>
            <h2 className="font-semibold text-lg mb-2">
              Localização
            </h2>

            <p className="text-sm leading-relaxed">
              R. Prof. Orlando França de Carvalho<br/>
              325/326 - Centro, Bebedouro - SP<br/>
              14701-070
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg mb-3">
              Redes Sociais
            </h2>

            <div className="flex justify-center lg:justify-start gap-5">

              <a
                href="#"
                className="text-blue-600 hover:scale-110 transition"
              >
                <Linkedin size={28} />
              </a>

              <a
                href="#"
                className="text-blue-600 hover:scale-110 transition"
              >
                <Github size={28} />
              </a>

            </div>
          </div>

        </div>

        {/* FORMULÁRIO */}
        <div className="card rounded-xl p-6 md:p-8 shadow-xl w-full max-w-md mx-auto">

          <h2 className="text-xl font-semibold mb-6 text-center">
            Envie sua sugestão!
          </h2>

          <form className="flex flex-col gap-4">

            <div>
              <label className="text-sm">
                Seu nome *
              </label>

              <input
                type="text"
                className="w-full mt-1 p-3 rounded bg-gray-200 outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm">
                Seu melhor e-mail *
              </label>

              <input
                type="email"
                className="w-full mt-1 p-3 rounded bg-gray-200 outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm">
                Escreva sua mensagem *
              </label>

              <textarea
                rows={5}
                className="w-full mt-1 p-3 rounded bg-gray-200 outline-none resize-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              className="mt-3 border border-blue-400 text-blue-400 py-2 rounded hover:bg-blue-500 hover:text-white transition"
            >
              Enviar
            </button>

          </form>

        </div>

      </div>

    </main>
  )
}