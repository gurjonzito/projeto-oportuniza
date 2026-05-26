import LegalPage from "../../components/LegalPage";
import lastModifiedJson from "./lastModified/Privacidade.json"

export default function Privacidade() {
  const dataFormatada = new Date(lastModifiedJson.date).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );

  return (
    <LegalPage title="Política de Privacidade" lastModified={dataFormatada}>
      <p>
        A plataforma Oportuniza respeita a privacidade de seus usuários e busca
        oferecer transparência sobre a forma como as informações podem ser
        utilizadas durante a navegação no site.
      </p>

      <p>
        Grande parte dos conteúdos da plataforma pode ser acessada sem a
        necessidade de fornecer dados pessoais. A Oportuniza não exige a criação
        de contas para acesso aos conteúdos educacionais.
      </p>

      <p>
        Algumas funcionalidades do site podem utilizar recursos de armazenamento
        local do navegador para registrar preferências ou progresso de navegação
        dentro da plataforma.
      </p>

      <p>
        A plataforma não comercializa, distribui ou compartilha informações
        pessoais com terceiros.
      </p>

      <p>
        Em alguns casos, conteúdos incorporados de serviços externos, como
        plataformas de hospedagem de vídeos, podem seguir políticas próprias de
        privacidade definidas por seus respectivos provedores.
      </p>
    </LegalPage>
  );
}
