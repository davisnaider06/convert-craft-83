// src/components/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPlan?: 'free' | 'pro' | 'enterprise';
  requiredAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requiredPlan,
  requiredAdmin = false,
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  // Aguardando verificação de autenticação
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

  // Não autenticado
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Verificar se requer admin
  if (requiredAdmin && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Verificar plano
  if (requiredPlan && profile?.plan !== requiredPlan) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
}
