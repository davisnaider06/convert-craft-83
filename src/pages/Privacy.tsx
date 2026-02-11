import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/boder/AnimatedBackground";
import boderLogo from "@/assets/boder-logo.png";

export default function Privacy() {
  return (
    <div className="relative min-h-screen bg-background">
      <AnimatedBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={boderLogo} alt="Boder AI" className="h-8 w-auto" />
            <span className="text-xl font-semibold">Boder AI</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-4xl pt-24 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Política de Privacidade</h1>
            <p className="text-muted-foreground">
              Última atualização: Janeiro de 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none space-y-8">
            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">1. Introdução</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Boder AI está comprometida em proteger sua privacidade. Esta Política de 
                Privacidade explica como coletamos, usamos, armazenamos e protegemos suas 
                informações pessoais quando você utiliza nossa plataforma.
              </p>
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">2. Dados que Coletamos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Coletamos os seguintes tipos de informações:
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>• <strong className="text-foreground">Dados de cadastro:</strong> nome, email e senha criptografada</li>
                <li>• <strong className="text-foreground">Dados de uso:</strong> interações com a plataforma, sites criados, preferências</li>
                <li>• <strong className="text-foreground">Dados de pagamento:</strong> processados por nossos parceiros de pagamento (não armazenamos dados de cartão)</li>
                <li>• <strong className="text-foreground">Dados técnicos:</strong> endereço IP, tipo de navegador, dispositivo</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">3. Como Usamos seus Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos suas informações para:
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>• Fornecer e melhorar nossos serviços</li>
                <li>• Processar transações e gerenciar sua conta</li>
                <li>• Enviar comunicações importantes sobre o serviço</li>
                <li>• Personalizar sua experiência na plataforma</li>
                <li>• Analisar padrões de uso para melhorias</li>
                <li>• Cumprir obrigações legais</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">4. Compartilhamento de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Não vendemos seus dados pessoais. Podemos compartilhar informações apenas com:
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>• Provedores de serviços essenciais (hospedagem, pagamentos)</li>
                <li>• Quando exigido por lei ou ordem judicial</li>
                <li>• Para proteger nossos direitos legais</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">5. Segurança dos Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger 
                seus dados, incluindo:
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>• Criptografia de dados em trânsito e em repouso</li>
                <li>• Controles de acesso rigorosos</li>
                <li>• Monitoramento contínuo de segurança</li>
                <li>• Backups regulares</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">6. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground leading-relaxed">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>• Acessar seus dados pessoais</li>
                <li>• Corrigir dados incompletos ou incorretos</li>
                <li>• Solicitar a exclusão de seus dados</li>
                <li>• Revogar consentimentos</li>
                <li>• Obter informações sobre compartilhamento de dados</li>
                <li>• Portabilidade dos dados</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">7. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies e tecnologias similares para melhorar sua experiência, 
                manter você logado, entender como você usa nossa plataforma e exibir conteúdo 
                personalizado. Você pode gerenciar preferências de cookies nas configurações 
                do seu navegador.
              </p>
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">8. Retenção de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Mantemos seus dados pelo tempo necessário para fornecer nossos serviços ou 
                conforme exigido por lei. Ao encerrar sua conta, seus dados serão excluídos 
                dentro de 30 dias, exceto quando houver obrigação legal de retenção.
              </p>
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">9. Menores de Idade</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nossos serviços não são destinados a menores de 18 anos. Não coletamos 
                intencionalmente dados de menores. Se tomarmos conhecimento de que coletamos 
                dados de um menor, excluiremos essas informações imediatamente.
              </p>
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">10. Alterações nesta Política</h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos 
                sobre alterações significativas por email ou através da plataforma. Recomendamos 
                revisar esta política regularmente.
              </p>
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">11. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta política, 
                entre em contato com nosso Encarregado de Proteção de Dados:
              </p>
              <p className="mt-4 text-muted-foreground">
                Email: <a href="mailto:privacidade@boder.app" className="text-primary hover:underline">privacidade@boder.app</a>
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 Boder AI. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-primary transition-colors">
              Termos de Uso
            </Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Política de Privacidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
