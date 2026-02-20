import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";

export const metadata = {
  title: "Termos de Uso – Meus Desafios",
};

export default async function TermsPage() {
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
          Termos de Uso
        </h1>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Última atualização: 20 de fevereiro de 2026
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            1. Aceitação dos Termos
          </h2>
          <p>
            Ao acessar ou utilizar o aplicativo Meus Desafios (&quot;Serviço&quot;), você
            concorda em cumprir estes Termos de Uso. Se não concordar com
            qualquer parte destes termos, não utilize o Serviço.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            2. Descrição do Serviço
          </h2>
          <p>
            Meus Desafios é uma plataforma de acompanhamento de hábitos que
            permite aos usuários registrar e monitorar desafios diários
            relacionados a hidratação, dieta, sono e exercício físico, com
            sistema de pontuação e gamificação.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            3. Conta do Usuário
          </h2>
          <p>
            Para utilizar o Serviço, é necessário criar uma conta através do
            login com Google. Você é responsável por manter a segurança da sua
            conta e por todas as atividades realizadas nela.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            4. Uso Aceitável
          </h2>
          <p>Ao utilizar o Serviço, você concorda em:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Fornecer informações verdadeiras e precisas</li>
            <li>Não utilizar o Serviço para fins ilícitos</li>
            <li>Não tentar acessar contas de outros usuários</li>
            <li>Não interferir no funcionamento do Serviço</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            5. Propriedade Intelectual
          </h2>
          <p>
            Todo o conteúdo do Serviço, incluindo marca, design, código e
            textos, é de propriedade exclusiva de Meus Desafios ou de seus
            licenciadores. Nenhum direito de propriedade intelectual é
            transferido ao usuário pelo uso do Serviço.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            6. Limitação de Responsabilidade
          </h2>
          <p>
            O Serviço é fornecido &quot;como está&quot;, sem garantias de qualquer tipo.
            Meus Desafios não se responsabiliza por decisões de saúde tomadas
            com base nos dados registrados no aplicativo. Consulte sempre um
            profissional de saúde antes de iniciar qualquer programa de
            exercícios ou mudança de dieta.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            7. Encerramento
          </h2>
          <p>
            Reservamo-nos o direito de suspender ou encerrar sua conta a
            qualquer momento, com ou sem aviso prévio, caso haja violação destes
            Termos. Você pode encerrar sua conta a qualquer momento entrando em
            contato conosco.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            8. Alterações nos Termos
          </h2>
          <p>
            Podemos atualizar estes Termos periodicamente. Notificaremos sobre
            mudanças significativas através do Serviço. O uso contínuo após
            alterações constitui aceitação dos novos termos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            9. Contato
          </h2>
          <p>
            Para dúvidas sobre estes Termos de Uso, entre em contato pelo
            e-mail:{" "}
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
