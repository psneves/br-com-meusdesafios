import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";

export const metadata = {
  title: "Política de Privacidade – Meus Desafios",
};

export default async function PrivacyPage() {
  const session = await getSession();
  const backHref = session.isLoggedIn ? "/today" : "/login";
  const backLabel = session.isLoggedIn ? "Voltar ao painel" : "Voltar ao login";

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#0a0a0a]">
      {/* Sticky top bar */}
      <nav className="sticky top-0 z-10 border-b border-gray-200 bg-slate-50/90 backdrop-blur-sm dark:border-gray-800 dark:bg-[#0a0a0a]/90">
        <div className="mx-auto flex max-w-2xl items-center px-6 py-3">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-2xl space-y-6 px-6 py-8 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Política de Privacidade
        </h1>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Última atualização: 20 de fevereiro de 2026
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            1. Informações que Coletamos
          </h2>
          <p>Ao utilizar o Meus Desafios, coletamos as seguintes informações:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Dados da conta Google:</strong> nome, endereço de e-mail e
              foto de perfil fornecidos pelo Google ao autenticar
            </li>
            <li>
              <strong>Dados de uso:</strong> registros de desafios (água, dieta,
              sono, exercício físico), metas, pontuações e sequências
            </li>
            <li>
              <strong>Dados técnicos:</strong> tipo de dispositivo, navegador e
              endereço IP para fins de segurança e desempenho
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            2. Como Utilizamos seus Dados
          </h2>
          <p>Utilizamos suas informações para:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Fornecer e manter o Serviço</li>
            <li>Calcular pontuações, sequências e progresso</li>
            <li>Exibir sua posição em rankings (de forma privada e segura)</li>
            <li>Melhorar a experiência do usuário</li>
            <li>Enviar notificações relacionadas ao Serviço (quando autorizadas)</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            3. Privacidade e Dados Sociais
          </h2>
          <p>
            Sua privacidade é fundamental. O Meus Desafios foi projetado com as
            seguintes garantias:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Solicitações de amizade requerem aceitação explícita para que outro
              usuário veja suas estatísticas
            </li>
            <li>
              Rankings exibem sua posição, pontuação e tamanho do grupo entre
              seus amigos — sem expor dados detalhados de outros usuários
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            4. Compartilhamento de Dados
          </h2>
          <p>
            Não vendemos, alugamos ou compartilhamos suas informações pessoais
            com terceiros, exceto:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Quando exigido por lei ou ordem judicial</li>
            <li>
              Com provedores de serviço essenciais para o funcionamento do
              aplicativo (hospedagem, autenticação), que estão vinculados a
              obrigações de confidencialidade
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            5. Armazenamento e Segurança
          </h2>
          <p>
            Seus dados são armazenados em servidores seguros com criptografia em
            trânsito (HTTPS) e em repouso. Implementamos medidas técnicas e
            organizacionais para proteger suas informações contra acesso não
            autorizado, alteração ou destruição.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            6. Seus Direitos (LGPD)
          </h2>
          <p>
            Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você
            tem direito a:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos ou inexatos</li>
            <li>Solicitar a exclusão dos seus dados</li>
            <li>Revogar consentimento a qualquer momento</li>
            <li>Solicitar portabilidade dos dados</li>
          </ul>
          <p>
            Para exercer qualquer desses direitos, incluindo a exclusão da sua
            conta e de todos os dados associados, envie um e-mail para{" "}
            <a
              href="mailto:contato@meusdesafios.com.br"
              className="text-indigo-600 hover:underline dark:text-indigo-400"
            >
              contato@meusdesafios.com.br
            </a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            7. Retenção de Dados
          </h2>
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa. Ao solicitar a
            exclusão da conta, seus dados pessoais serão removidos em até 30
            dias, exceto quando a retenção for necessária por obrigação legal.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            8. Alterações nesta Política
          </h2>
          <p>
            Podemos atualizar esta Política de Privacidade periodicamente.
            Notificaremos sobre mudanças significativas através do Serviço. A
            data da última atualização estará sempre indicada no topo desta
            página.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            9. Contato
          </h2>
          <p>
            Para dúvidas sobre esta Política de Privacidade ou sobre o
            tratamento dos seus dados, entre em contato pelo e-mail:{" "}
            <a
              href="mailto:contato@meusdesafios.com.br"
              className="text-indigo-600 hover:underline dark:text-indigo-400"
            >
              contato@meusdesafios.com.br
            </a>
          </p>
        </section>
        </article>
    </div>
  );
}
