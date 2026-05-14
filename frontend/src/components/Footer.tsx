import { Link } from 'react-router-dom';
import { Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full text-white overflow-hidden">

      {/* Área principal */}
      <div className="bg-[#252B42]">
        <div className="max-w-6xl mx-auto px-6 py-12 
                        grid gap-6 
                        md:grid-cols-[0.9fr_0.9fr_1.2fr_1fr] 
                        text-center md:text-left
                        justify-items-center md:justify-items-start">
          
          {/* Plataforma */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-lg mb-4">Plataforma</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link to="/sobre">Sobre</Link></li>
              <li><Link to="/mobile">Download</Link></li>
              <li><Link to="/integracoes">Integrações</Link></li>
            </ul>
          </div>

          {/* Navegação */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-lg mb-4">Navegação</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link to="/">Início</Link></li>
              <li><Link to="/trilhas">Trilhas</Link></li>
              <li><Link to="/videos">Vídeos</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div className="flex flex-col items-center md:items-start w-60 md:w-auto">
            <h3 className="font-semibold text-lg mb-4">Contato</h3>
            <p className="text-gray-300 text-sm mb-3">
              R. Prof. Orlando França de Carvalho - 325/326 - Centro, Bebedouro/SP
            </p>
            {/* ícones */}
            <div className="flex gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition">
                <Github size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Legal */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><Link to="/seguranca">Segurança</Link></li>
              <li><Link to="/termos">Termos e Condições</Link></li>
              <li><Link to="/cookies">Política de Cookies</Link></li>
              <li><Link to="/privacidade">Política de Privacidade</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Footer inferior */}
      <div className="bg-linear-to-r from-[#1e3a8a] via-[#2563eb] to-[#1e40af] text-white text-center py-4 text-sm">
        © Oportuniza — Todos os direitos reservados.
      </div>
    </footer>
  );
}