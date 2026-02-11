// src/components/PublicRoute.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface PublicRouteProps {
  children: ReactNode;
}

/**
 * Rota pública que redireciona para dashboard se usuário já está autenticado
 * Usada para auth, landing, etc.
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { user, loading } = useAuth();

  // Aguardando verificação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se já autenticado, redireciona para dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Caso contrário, mostra a página pública
  return <>{children}</>;
}
