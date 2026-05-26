import LegalPage from "../../components/LegalPage"
import lastModifiedJson from "./lastModified/seguranca.json"

export default function Seguranca() {
  const dataFormatada = new Date(lastModifiedJson.date).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );

  return (
    <LegalPage title="Segurança" lastModified={dataFormatada}>

      <p>
        A segurança das informações e da experiência dos usuários é uma prioridade
        para a plataforma Oportuniza. O sistema foi desenvolvido seguindo boas
        práticas de desenvolvimento web, com o objetivo de garantir um ambiente
        estável, confiável e seguro para acesso aos conteúdos educacionais.
      </p>

      <p>
        A plataforma foi projetada para permitir navegação simples e acessível,
        sem a necessidade de criação de contas ou autenticação de usuários.
        Dessa forma, não são armazenadas bases de dados com informações
        pessoais dos visitantes.
      </p>

      <p>
        Para algumas funcionalidades internas do site, como o registro de
        progresso em conteúdos educacionais, podem ser utilizados recursos
        de armazenamento local do navegador. Essas informações permanecem
        apenas no dispositivo do próprio usuário.
      </p>

      <p>
        Mesmo com a adoção de boas práticas de segurança, nenhum sistema
        online é totalmente imune a riscos. Por esse motivo, a plataforma
        passa por melhorias e revisões contínuas com o objetivo de manter
        um ambiente seguro e funcional para todos os usuários.
      </p>

    </LegalPage>
  )
}