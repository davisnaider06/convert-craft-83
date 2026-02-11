import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/boder/AnimatedBackground";
import boderLogo from "@/assets/boder-logo.png";

export default function Terms() {
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
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Termos de Uso</h1>
            <p className="text-muted-foreground">
              Última atualização: Janeiro de 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none space-y-8">
            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e usar a plataforma Boder AI, você concorda em cumprir e estar vinculado 
                a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, 
                não poderá acessar ou usar nossos serviços.
              </p>
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Boder AI é uma plataforma de criação de sites e landing pages utilizando 
                inteligência artificial. Nossos serviços incluem:
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>• Geração de sites e landing pages com IA</li>
                <li>• Hospedagem de sites gerados</li>
                <li>• Subdomínios personalizados</li>
                <li>• Integração com domínios próprios (planos pagos)</li>
                <li>• Editor visual para customização</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">3. Conta de Usuário</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para usar nossos serviços, você deve criar uma conta fornecendo informações 
                precisas e completas. Você é responsável por manter a confidencialidade de 
                suas credenciais de acesso e por todas as atividades realizadas em sua conta.
              </p>
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">4. Planos e Pagamentos</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Boder AI oferece planos gratuitos e pagos. Os planos pagos fornecem 
                recursos adicionais como remoção de marca d'água, domínios customizados 
                e mais créditos de geração. Os pagamentos são processados de forma segura 
                através de nossos parceiros de pagamento.
              </p>
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">5. Uso Aceitável</h2>
              <p className="text-muted-foreground leading-relaxed">
                Você concorda em não usar a plataforma para:
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>• Criar conteúdo ilegal, difamatório ou ofensivo</li>
                <li>• Violar direitos de propriedade intelectual de terceiros</li>
                <li>• Distribuir malware ou conteúdo prejudicial</li>
                <li>• Realizar atividades fraudulentas</li>
                <li>• Tentar acessar sistemas não autorizados</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">6. Propriedade Intelectual</h2>
              <p className="text-muted-foreground leading-relaxed">
                Todo o conteúdo gerado através da plataforma Boder AI pertence ao usuário 
                que o criou, sujeito às limitações de uso da tecnologia de IA subjacente. 
                A marca, logotipo e tecnologia da Boder AI permanecem propriedade exclusiva 
                da empresa.
              </p>
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">7. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Boder AI é fornecida "como está". Não garantimos que o serviço será 
                ininterrupto ou livre de erros. Em nenhum caso seremos responsáveis por 
                danos indiretos, incidentais ou consequenciais decorrentes do uso de 
                nossos serviços.
              </p>
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">8. Modificações</h2>
              <p className="text-muted-foreground leading-relaxed">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                Alterações significativas serão notificadas por email ou através da 
                plataforma. O uso continuado após as modificações constitui aceitação 
                dos novos termos.
              </p>
            </section>

            <section className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold mb-4">9. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para dúvidas sobre estes Termos de Uso, entre em contato conosco através 
                do email: <a href="mailto:contato@boder.app" className="text-primary hover:underline">contato@boder.app</a>
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
