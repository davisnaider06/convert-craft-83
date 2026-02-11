import { useUser } from "@clerk/clerk-react";

// Adicionei "admin@boder.ia" para o modo de desenvolvimento funcionar
const ADMIN_EMAILS = [
  "kaueramaciott@gmail.com", 
  "conteudosmr@gmail.com", 
  "fernandafernamdesoliveira@gmail.com",
  "admin@boder.ia" 
];

export function useAdminCheck() {
  // Substituindo o hook antigo pelo do Clerk
  const { user, isLoaded } = useUser();

  // No Clerk, o objeto user é um pouco diferente.
  // Precisamos pegar o email primário.
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  // Verificação direta (sem necessidade de useEffect/useState complexo)
  const isAdmin = 
    isLoaded && 
    !!userEmail && 
    ADMIN_EMAILS.includes(userEmail);

  return { 
    isAdmin, 
    isLoading: !isLoaded, // No Clerk, se não está carregado (!isLoaded), é porque está carregando
    user 
  };
}

export { ADMIN_EMAILS };