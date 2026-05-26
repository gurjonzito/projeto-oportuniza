import LegalPage from "../../components/LegalPage"
import lastModifiedJson from "./lastModified/termos.json"

export default function Termos() {
  const dataFormatada = new Date(lastModifiedJson.date).toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );

  return (
    <LegalPage title="Termos e Condições" lastModified={dataFormatada}>

      <p>
        Ao acessar e utilizar a plataforma Oportuniza, o usuário concorda
        com os presentes Termos e Condições de uso. Caso não concorde com
        qualquer parte destes termos, recomenda-se que não utilize os
        serviços disponibilizados.
      </p>

      <p>
        A Oportuniza é uma plataforma educacional desenvolvida com o objetivo
        de facilitar o acesso a conteúdos de aprendizado e apoiar o
        desenvolvimento acadêmico e profissional de seus usuários.
      </p>

      <p>
        O acesso aos conteúdos disponibilizados pode ser realizado livremente
        por meio do navegador, sem a necessidade de criação de contas ou
        autenticação de usuário.
      </p>

      <p>
        Parte dos conteúdos exibidos na plataforma pode ser incorporada de
        serviços de terceiros, como plataformas de hospedagem de vídeos.
        Nesses casos, os conteúdos permanecem sob responsabilidade de seus
        respectivos autores ou provedores.
      </p>

      <p>
        A equipe responsável pela plataforma reserva-se o direito de realizar
        atualizações ou melhorias no funcionamento do sistema sempre que
        necessário.
      </p>

    </LegalPage>
  )
}