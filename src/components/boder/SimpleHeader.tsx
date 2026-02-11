import { useAuth, UserButton, SignInButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Ajuste o import se seu Button estiver em outro lugar

export const SimpleHeader = () => {
  // AQUI ESTAVA O ERRO: antes você importava de um contexto local.
  // Agora usamos o hook oficial do Clerk.
  const { isSignedIn } = useAuth();

  return (
    <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
        {/* Logo / Home Link */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <span>SeuLogo</span>
          </Link>
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            // Se estiver logado, mostra o botão do usuário (Avatar)
            <UserButton afterSignOutUrl="/" />
          ) : (
            // Se NÃO estiver logado, mostra botão de entrar
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
};