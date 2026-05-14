export default function Mobile() {
  return (
    <main
      className="min-h-screen px-6 py-16 flex items-center justify-center"
      style={{ backgroundColor: "var(--bg-color)" }}
    >
      <div className="max-w-5xl w-full flex flex-col md:flex-row gap-10 items-center">
        {/* Conteúdo */}
        <div className="flex flex-col gap-6 w-full md:w-1/2">
          <h1 className="text-3xl md:text-4xl font-bold text-center md:text-left">
            Baixar App
          </h1>
          <p className="text-lg text-center md:text-left">
            Adicione a plataforma à tela inicial do seu celular e utilize como
            um aplicativo
          </p>
          <p className="text-center md:text-left">
            Acesse trilhas, vídeos e materiais de forma rápida diretamente do
            celular.
          </p>

          <button className="bg-green-500 text-white font-semibold py-3 px-6 rounded-lg w-max self-center md:self-start hover:bg-green-600 transition">
            INSTALAR APLICATIVO
          </button>

          <div className="card p-6 w-full">
            <h2 className="font-bold mb-3">COMO INSTALAR</h2>

            <div className="mb-4">
              <h3 className="font-semibold">Android</h3>
              <ol className="list-decimal list-inside ml-2">
                <li>Toque no menu do navegador ( ⋮ )</li>
                <li>Selecione "Adicionar à tela inicial"</li>
                <li>Confirme a instalação</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold">iOS (iPhone)</h3>
              <ol className="list-decimal list-inside ml-2">
                <li>Toque no botão de compartilhar (↑)</li>
                <li>Selecione "Adicionar à Tela de Início"</li>
                <li>Confirme para criar o atalho</li>
              </ol>
            </div>
          </div>

          <p className="text-sm text-[var(--text-color)/80] text-center md:text-left">
            Após a instalação, o aplicativo aparecerá na tela inicial do celular
            e funcionará como um app.
          </p>
        </div>

        {/* Imagem */}
        <div className="flex justify-center md:justify-end items-center w-full md:w-1/2">
          <img
            src="/pics/iphone.png"
            alt="Celular App"
            className="w-64 md:w-80 lg:w-70 xl:w-75 object-contain rounded-xl shadow-lg"
          />
        </div>
      </div>
    </main>
  );
}
