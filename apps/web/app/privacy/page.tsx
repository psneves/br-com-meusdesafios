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
          Última atualização: 21 de fevereiro de 2026
        </p>

        {/* 1. Informações que Coletamos */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            1. Informações que Coletamos
          </h2>
          <p>Ao utilizar o Meus Desafios, coletamos as seguintes informações:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Dados de autenticação Google:</strong> nome, endereço de
              e-mail, foto de perfil e identificador de conta Google (ID único
              emitido pelo Google), utilizados para criar e manter sua conta
            </li>
            <li>
              <strong>Dados de perfil:</strong> nome de exibição, nome de
              usuário (@handle) e foto de perfil (que pode ser a foto do Google
              ou uma imagem enviada por você)
            </li>
            <li>
              <strong>Dados de uso:</strong> registros de desafios (água, dieta,
              sono, exercício físico), metas configuradas, pontuações,
              sequências (streaks) e estatísticas de progresso diário
            </li>
            <li>
              <strong>Dados sociais:</strong> solicitações de amizade (enviadas,
              recebidas, aceitas, negadas), lista de amigos e histórico de
              interações sociais
            </li>
            <li>
              <strong>Dados de localização (opcional):</strong> quando você ativa
              o recurso &quot;Perto de mim&quot;, coletamos sua localização
              aproximada na forma de uma célula geográfica de aproximadamente
              5 km. Não armazenamos coordenadas exatas (latitude/longitude).
              Também registramos a data da última atualização da localização
            </li>
            <li>
              <strong>Dados técnicos:</strong> os provedores de infraestrutura
              (hospedagem e CDN) podem coletar automaticamente tipo de
              dispositivo, navegador e endereço IP para fins de segurança e
              desempenho. Esses dados são geridos pelos provedores de acordo com
              suas próprias políticas de privacidade
            </li>
            <li>
              <strong>Dados de atividade:</strong> data e hora do último login e
              datas de criação e atualização da conta
            </li>
          </ul>
        </section>

        {/* 2. Base Legal para o Tratamento */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            2. Base Legal para o Tratamento
          </h2>
          <p>
            O tratamento dos seus dados pessoais é realizado com base nas
            seguintes hipóteses previstas na LGPD (Lei nº 13.709/2018):
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Execução de contrato (Art. 7º, V):</strong> dados
              necessários para fornecer o Serviço (autenticação, perfil,
              registros de desafios, pontuações, social e rankings)
            </li>
            <li>
              <strong>Consentimento (Art. 7º, I):</strong> dados de localização
              aproximada, coletados apenas quando você ativa voluntariamente o
              recurso &quot;Perto de mim&quot;. Você pode revogar este
              consentimento a qualquer momento desativando a localização nas
              configurações do perfil
            </li>
            <li>
              <strong>Legítimo interesse (Art. 7º, IX):</strong> dados técnicos
              de infraestrutura para segurança e desempenho do Serviço
            </li>
          </ul>
        </section>

        {/* 3. Como Utilizamos seus Dados */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            3. Como Utilizamos seus Dados
          </h2>
          <p>Utilizamos suas informações para:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Criar e manter sua conta</li>
            <li>Calcular pontuações, sequências e progresso dos desafios</li>
            <li>
              Exibir rankings entre amigos e, quando ativada, entre usuários
              próximos
            </li>
            <li>
              Permitir a busca e conexão com outros usuários através do recurso
              social
            </li>
            <li>Melhorar a experiência e o desempenho do Serviço</li>
          </ul>
        </section>

        {/* 4. Privacidade e Dados Sociais */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            4. Dados Compartilhados com Outros Usuários
          </h2>
          <p>
            Ao utilizar os recursos sociais, algumas informações são
            compartilhadas com outros usuários:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Perfil público:</strong> seu nome de exibição, nome de
              usuário (@handle) e foto de perfil são visíveis para outros
              usuários que buscam amigos
            </li>
            <li>
              <strong>Amigos aceitos:</strong> ao aceitar uma solicitação de
              amizade, seus amigos podem ver seu nome, foto, pontuação total
              (do dia, da semana e do mês), metas ativas (categoria e valor),
              número de dias com metas cumpridas e posição no ranking semanal
              e mensal
            </li>
            <li>
              <strong>Ranking &quot;Perto de mim&quot;:</strong> se você ativar a
              localização, usuários dentro do raio selecionado (50, 100 ou
              500 km) poderão ver seu nome, foto, pontuação total (do dia,
              da semana e do mês) e posição no ranking,
              mesmo que não sejam seus amigos. Ao desativar a localização, você
              deixa de aparecer neste ranking
            </li>
            <li>
              <strong>Solicitações de amizade:</strong> requerem aceitação
              explícita. Caso ambos os usuários enviem uma solicitação
              mutuamente, a amizade é aceita automaticamente
            </li>
          </ul>
          <p>
            Nunca são compartilhados: registros individuais de log (horários
            exatos de sono, quantidades detalhadas de água, etc.), notas pessoais
            ou dados brutos de entrada.
          </p>
        </section>

        {/* 5. Dados de Localização */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            5. Dados de Localização
          </h2>
          <p>
            O recurso &quot;Perto de mim&quot; é totalmente opcional. Quando
            ativado:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Sua posição é convertida em uma célula geográfica de
              aproximadamente 5 km de lado (geohash). Coordenadas exatas
              (latitude e longitude) não são armazenadas
            </li>
            <li>
              Essa localização aproximada é usada exclusivamente para calcular o
              ranking entre usuários geograficamente próximos
            </li>
            <li>
              Você pode desativar a localização a qualquer momento nas
              configurações do perfil, o que remove sua célula geográfica do
              banco de dados
            </li>
          </ul>
        </section>

        {/* 6. Compartilhamento com Terceiros */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            6. Compartilhamento com Terceiros
          </h2>
          <p>
            Não vendemos, alugamos ou compartilhamos suas informações pessoais
            com terceiros, exceto:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Quando exigido por lei ou ordem judicial</li>
            <li>
              Com provedores de serviço essenciais para o funcionamento do
              aplicativo (hospedagem, autenticação Google, análise de
              desempenho), que estão vinculados a obrigações de
              confidencialidade
            </li>
          </ul>
        </section>

        {/* 7. Armazenamento e Segurança */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            7. Armazenamento e Segurança
          </h2>
          <p>
            Seus dados são armazenados em servidores seguros com criptografia em
            trânsito (HTTPS). A sessão de autenticação utiliza cookies
            criptografados (HTTP-only). Implementamos medidas técnicas e
            organizacionais para proteger suas informações contra acesso não
            autorizado, alteração ou destruição.
          </p>
          <p>
            Fotos de perfil enviadas por você são armazenadas diretamente no
            banco de dados do Serviço.
          </p>
        </section>

        {/* 8. Seus Direitos (LGPD) */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            8. Seus Direitos (LGPD)
          </h2>
          <p>
            Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você
            tem direito a:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos ou inexatos (nome, foto e handle podem ser editados diretamente no aplicativo)</li>
            <li>Solicitar a exclusão da sua conta e de todos os dados associados</li>
            <li>Revogar o consentimento para coleta de localização (desativando o recurso no aplicativo)</li>
            <li>Solicitar portabilidade dos dados em formato estruturado</li>
            <li>Obter informações sobre com quem seus dados são compartilhados</li>
          </ul>
          <p>
            Para exercer qualquer desses direitos, envie um e-mail para{" "}
            <a
              href="mailto:contato@meusdesafios.com.br"
              className="text-indigo-600 hover:underline dark:text-indigo-400"
            >
              contato@meusdesafios.com.br
            </a>. Solicitações serão respondidas em até 15 dias úteis.
          </p>
        </section>

        {/* 9. Retenção de Dados */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            9. Retenção de Dados
          </h2>
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa. Ao solicitar a
            exclusão da conta, todos os dados pessoais associados (perfil,
            registros de desafios, pontuações, sequências, conexões sociais e
            localização) serão removidos em até 30 dias, exceto quando a
            retenção for necessária por obrigação legal.
          </p>
          <p>
            Solicitações de amizade negadas ou bloqueios são removidos
            juntamente com a exclusão da conta.
          </p>
        </section>

        {/* 10. Menores de Idade */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            10. Menores de Idade
          </h2>
          <p>
            O Meus Desafios é destinado a maiores de 18 anos. Não coletamos
            intencionalmente dados de menores de idade. Se tomarmos
            conhecimento de que dados de um menor foram coletados, tomaremos
            medidas para excluí-los imediatamente.
          </p>
        </section>

        {/* 11. Alterações nesta Política */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            11. Alterações nesta Política
          </h2>
          <p>
            Podemos atualizar esta Política de Privacidade periodicamente. A
            data da última atualização estará sempre indicada no topo desta
            página. Recomendamos que consulte esta página regularmente.
          </p>
        </section>

        {/* 12. Contato */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            12. Contato
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
