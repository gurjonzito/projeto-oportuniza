import LegalPage from "../../components/LegalPage"
import lastModifiedJson from "./lastModified/cookies.json"

export default function Cookies() {
  const dataFormatada = new Date(lastModifiedJson.date).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );

  return (
    <LegalPage title="Política de Cookies" lastModified={dataFormatada}>

      <p>
        A plataforma Oportuniza pode utilizar cookies e tecnologias
        semelhantes para melhorar a experiência de navegação dos usuários.
      </p>

      <p>
        Cookies são pequenos arquivos armazenados no dispositivo do usuário
        quando um site é acessado. Esses arquivos ajudam o sistema a lembrar
        preferências de navegação e permitem o funcionamento adequado de
        determinadas funcionalidades da plataforma.
      </p>

      <p>
        Os cookies utilizados pela plataforma têm como finalidade melhorar
        a experiência de uso, permitir o funcionamento de recursos da
        interface e compreender de forma geral como os visitantes
        interagem com o site.
      </p>

      <p>
        O usuário pode configurar seu navegador para bloquear ou remover
        cookies a qualquer momento. No entanto, algumas funcionalidades
        da plataforma podem não funcionar corretamente caso essas
        tecnologias sejam desativadas.
      </p>

    </LegalPage>
  )
}