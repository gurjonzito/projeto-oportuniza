export default function Integracoes() {
  return (
    <main
      className="min-h-screen flex-1 px-6 md:px-12 lg:px-20 py-10"
      style={{ backgroundColor: "var(--bg-color)" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Título */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold">Integrações</h1>
          <p className="text-lg mt-2 text-[var(--text-color)/80]">
            Recursos utilizados no projeto
          </p>
        </div>

        {/* Introdução */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">YouTube API</h2>

          <div className="card p-6">
            <p className="leading-relaxed text-[var(--text-color)/90]">
              Este projeto foi desenvolvido como Trabalho de Conclusão de Curso
              (TCC) e tem como objetivo a criação de uma plataforma digital
              voltada à orientação e preparação de jovens para o ingresso no
              mercado de trabalho. A iniciativa parte da percepção de que existe
              uma lacuna entre a conclusão do ensino médio e o início da vida
              adulta, período em que muitos jovens enfrentam dificuldades para
              compreender como iniciar sua trajetória profissional. Nesse
              contexto, a plataforma busca atuar como uma ferramenta de apoio
              educacional, reunindo conteúdos organizados em trilhas de
              aprendizagem, vídeos e materiais informativos que auxiliem na
              compreensão de temas relacionados à empregabilidade, contribuindo
              para reduzir barreiras de acesso à informação e facilitar a
              transição entre a escola e o mundo do trabalho.
            </p>
          </div>
        </section>

        {/* Para quem é */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">
            Inteligência Artificial
          </h2>

          <div className="card p-6">
            <p className="leading-relaxed text-[var(--text-color)/90]">
              A plataforma é direcionada principalmente a jovens entre 15 e 29
              anos que estão iniciando ou pretendem iniciar sua trajetória no
              mercado de trabalho, incluindo estudantes e pessoas em busca do
              primeiro emprego. O projeto busca atender especialmente jovens em
              contextos de vulnerabilidade social, que muitas vezes possuem
              acesso limitado a orientações profissionais ou recursos
              educacionais voltados à empregabilidade.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
