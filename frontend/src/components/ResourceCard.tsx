interface ResourceCardProps {
  nome: string;
  descricao: string;
  url: string;
  categoria: string;
}

export default function ResourceCard({
  nome,
  descricao,
  url,
  categoria,
}: ResourceCardProps) {
  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text;

    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");

    return lastSpace > 0
      ? `${truncated.substring(0, lastSpace)}...`
      : `${truncated}...`;
  };

  const limitedDescription = truncateText(descricao, 120);

  const handleNavigate = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="card cursor-pointer hover:shadow-lg transition flex flex-col h-full"
      onClick={handleNavigate}
    >
      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-1">
        {/* Categoria */}
        <p className="text-xs text-blue-400 mb-1">
          {categoria}
        </p>

        {/* Nome */}
        <h3
          className="font-semibold text-base leading-snug"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {nome}
        </h3>

        {/* Descrição */}
        {limitedDescription && (
          <p
            className="text-sm text-gray-500 dark:text-gray-400 mt-2"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {limitedDescription}
          </p>
        )}

        {/* Botão */}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Recurso externo
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNavigate();
            }}
            className="cursor-pointer border border-blue-500 text-blue-500 px-4 py-1 rounded-lg hover:bg-blue-500 hover:text-white transition text-sm"
          >
            Acessar
          </button>
        </div>
      </div>
    </div>
  );
}