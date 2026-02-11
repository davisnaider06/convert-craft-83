const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function gerarSite(promptUsuario: string) {
  const response = await fetch(`${API_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: promptUsuario }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro ao conectar com o servidor da IA');
  }

  return data.code; 
}