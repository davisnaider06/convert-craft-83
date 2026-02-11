// MOCK CLIENT - Substitui o cliente real do Supabase
// Isso impede erros de conexão e permite que o build funcione sem as chaves de API

console.log("⚠️ Supabase Client: Modo de Simulação Ativado (Mock)");

const mockSupabase = {
  from: (table: string) => {
    // Retorna uma cadeia de promessas falsas para qualquer tabela
    const queryBuilder = {
      select: () => queryBuilder,
      insert: () => queryBuilder,
      update: () => queryBuilder,
      delete: () => queryBuilder,
      eq: () => queryBuilder,
      order: () => queryBuilder,
      limit: () => queryBuilder,
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: any) => resolve({ data: [], error: null }),
    };
    return queryBuilder;
  },
  auth: {
    signUp: async () => ({ data: null, error: null }),
    signInWithPassword: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    updateUser: async () => ({ data: null, error: null }),
    resetPasswordForEmail: async () => ({ data: null, error: null }),
  },
  functions: {
    invoke: async () => ({ data: {}, error: null }),
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
    }),
  },
};

// Exportamos como 'any' para o TypeScript não reclamar que faltam propriedades
export const supabase = mockSupabase as any;