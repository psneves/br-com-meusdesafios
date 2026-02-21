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
          Última atualização: 21 de fevereiro de 2026
        </p>

        {/* 1. Aceitação dos Termos */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            1. Aceitação dos Termos
          </h2>
          <p>
            Ao acessar ou utilizar o aplicativo Meus Desafios (&quot;Serviço&quot;),
            você concorda em cumprir estes Termos de Uso e a nossa{" "}
            <Link href="/privacy" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Política de Privacidade
            </Link>. Se não concordar com qualquer parte destes termos, não
            utilize o Serviço.
          </p>
        </section>

        {/* 2. Elegibilidade */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            2. Elegibilidade
          </h2>
          <p>
            O Serviço é destinado a maiores de 18 anos. Ao utilizar o Meus
            Desafios, você declara ter pelo menos 18 anos de idade. Não
            coletamos intencionalmente dados de menores de idade.
          </p>
        </section>

        {/* 3. Descrição do Serviço */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            3. Descrição do Serviço
          </h2>
          <p>
            Meus Desafios é uma plataforma de acompanhamento de hábitos que
            permite registrar e monitorar desafios diários relacionados a
            hidratação, dieta, sono e exercício físico, com sistema de
            pontuação, sequências (streaks) e rankings entre amigos.
          </p>
        </section>

        {/* 4. Conta do Usuário */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            4. Conta do Usuário
          </h2>
          <p>
            Para utilizar o Serviço, é necessário criar uma conta através do
            login com Google. Você é responsável por manter a segurança da sua
            conta e por todas as atividades realizadas nela.
          </p>
        </section>

        {/* 5. Pontuação e Rankings */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            5. Pontuação e Rankings
          </h2>
          <p>
            O sistema de pontuação (XP), sequências e posições no ranking são
            calculados exclusivamente pelo servidor com base nos registros
            enviados. Os cálculos são determinísticos e finais. Não é possível
            alterar manualmente pontuações ou posições no ranking.
          </p>
        </section>

        {/* 6. Recursos Sociais */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            6. Recursos Sociais
          </h2>
          <p>Ao utilizar os recursos sociais do Serviço, você reconhece que:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Solicitações de amizade requerem aceitação explícita. Se ambos os
              usuários enviarem solicitações um ao outro, a amizade será aceita
              automaticamente
            </li>
            <li>
              Ao aceitar uma amizade, seu nome, foto, pontuação, metas ativas e
              progresso serão visíveis para o outro usuário no ranking
            </li>
            <li>
              Você pode desfazer uma amizade a qualquer momento, o que remove
              imediatamente o acesso mútuo às estatísticas
            </li>
          </ul>
        </section>

        {/* 7. Localização e Ranking "Perto de mim" */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            7. Localização e Ranking &quot;Perto de mim&quot;
          </h2>
          <p>
            O recurso &quot;Perto de mim&quot; é totalmente opcional. Ao
            ativá-lo, você consente com o seguinte:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Sua posição será convertida em uma célula geográfica aproximada
              (~5 km). Coordenadas exatas não são armazenadas
            </li>
            <li>
              Outros usuários dentro do raio selecionado (50, 100 ou 500 km)
              poderão ver seu nome, foto e pontuação no ranking, mesmo que não
              sejam seus amigos
            </li>
            <li>
              Você pode desativar a localização a qualquer momento, removendo
              sua participação no ranking &quot;Perto de mim&quot;
            </li>
          </ul>
        </section>

        {/* 8. Conteúdo do Usuário */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            8. Conteúdo do Usuário
          </h2>
          <p>
            Ao enviar conteúdo para o Serviço (como fotos de perfil), você
            concede ao Meus Desafios uma licença não exclusiva, gratuita e
            mundial para armazenar, exibir e transmitir esse conteúdo
            exclusivamente para o funcionamento do Serviço. Você declara que
            possui os direitos necessários sobre o conteúdo enviado. Ao excluir
            sua conta, todo o conteúdo será removido.
          </p>
        </section>

        {/* 9. Uso Aceitável */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            9. Uso Aceitável
          </h2>
          <p>Ao utilizar o Serviço, você concorda em:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Fornecer informações verdadeiras e precisas</li>
            <li>Não utilizar o Serviço para fins ilícitos</li>
            <li>Não tentar acessar contas de outros usuários</li>
            <li>Não interferir no funcionamento do Serviço</li>
            <li>Não manipular dados para obter pontuações ou posições indevidas</li>
          </ul>
        </section>

        {/* 10. Propriedade Intelectual */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            10. Propriedade Intelectual
          </h2>
          <p>
            Todo o conteúdo do Serviço, incluindo marca, design, código e
            textos, é de propriedade exclusiva de Meus Desafios ou de seus
            licenciadores. Nenhum direito de propriedade intelectual é
            transferido ao usuário pelo uso do Serviço.
          </p>
        </section>

        {/* 11. Limitação de Responsabilidade */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            11. Limitação de Responsabilidade
          </h2>
          <p>
            O Serviço é fornecido &quot;como está&quot;, sem garantias de qualquer tipo.
            Meus Desafios não se responsabiliza por decisões de saúde tomadas
            com base nos dados registrados no aplicativo. Consulte sempre um
            profissional de saúde antes de iniciar qualquer programa de
            exercícios ou mudança de dieta.
          </p>
        </section>

        {/* 12. Encerramento */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            12. Encerramento
          </h2>
          <p>
            Reservamo-nos o direito de suspender ou encerrar sua conta a
            qualquer momento, com ou sem aviso prévio, caso haja violação destes
            Termos.
          </p>
          <p>
            Você pode solicitar o encerramento da sua conta a qualquer momento
            enviando um e-mail para{" "}
            <a
              href="mailto:contato@meusdesafios.com.br"
              className="text-indigo-600 hover:underline dark:text-indigo-400"
            >
              contato@meusdesafios.com.br
            </a>. Após o encerramento, seus dados pessoais serão removidos
            conforme descrito na{" "}
            <Link href="/privacy" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Política de Privacidade
            </Link>.
          </p>
        </section>

        {/* 13. Lei Aplicável */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            13. Lei Aplicável
          </h2>
          <p>
            Estes Termos são regidos pelas leis da República Federativa do
            Brasil. Qualquer disputa será submetida ao foro da comarca do
            domicílio do usuário, conforme o Código de Defesa do Consumidor.
          </p>
        </section>

        {/* 14. Alterações nos Termos */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            14. Alterações nos Termos
          </h2>
          <p>
            Podemos atualizar estes Termos periodicamente. A data da última
            atualização estará sempre indicada no topo desta página. O uso
            contínuo do Serviço após alterações constitui aceitação dos novos
            termos.
          </p>
        </section>

        {/* 15. Contato */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            15. Contato
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
