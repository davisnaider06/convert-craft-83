const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

// O Prompt agora foca 100% em Copywriting e Estrutura de Vendas
const SYSTEM_PROMPT = `
Você é um Copywriter Sênior e Web Designer especializado em Landing Pages de Alta Conversão.
O usuário vai te passar o Nicho, o Template Base e as Customizações.

Você DEVE retornar EXATAMENTE um JSON válido com a seguinte estrutura. NÃO adicione texto extra, nem markdown.

{
  "colors": {
    "primary": "Um hex code ou nome de cor do tailwind que combine com o nicho (ex: #3b82f6 ou blue-600)",
    "secondary": "Cor secundária hex",
    "accent": "Cor de destaque hex"
  },
  "hero": {
    "headline": "Headline principal curta e muito persuasiva focada no resultado",
    "subheadline": "Subtítulo explicativo focando na dor do cliente (2 a 3 linhas)",
    "cta": "Texto de ação forte para o botão (ex: Quero Começar Agora)",
    "image_keyword": "keyword em inglês para buscar imagem no unsplash (ex: modern gym workout)"
  },
  "features": [
    { "title": "Benefício 1", "description": "Explicação persuasiva do benefício.", "icon": "zap" },
    { "title": "Benefício 2", "description": "Explicação persuasiva do benefício.", "icon": "shield" },
    { "title": "Benefício 3", "description": "Explicação persuasiva do benefício.", "icon": "star" }
  ],
  "social_proof": {
    "title": "Empresas e pessoas que confiam",
    "logos": ["Empresa A", "Empresa B", "Empresa C", "Empresa D"]
  },
  "testimonials": [
    { "name": "Nome Cliente 1", "role": "Cargo/Situação", "content": "Depoimento realista e focado no resultado que a pessoa teve." },
    { "name": "Nome Cliente 2", "role": "Cargo/Situação", "content": "Depoimento realista e focado no resultado que a pessoa teve." }
  ],
  "pricing": [
    { "name": "Básico", "price": "R$ 97", "features": ["Feature principal", "Feature secundária"], "recommended": false },
    { "name": "Profissional", "price": "R$ 197", "features": ["Tudo do básico", "Feature Exclusiva", "Suporte VIP"], "recommended": true }
  ],
  "faq": [
    { "question": "Dúvida comum 1 do nicho?", "answer": "Quebra de objeção clara e direta." },
    { "question": "Dúvida comum 2 do nicho?", "answer": "Quebra de objeção clara e direta." }
  ],
  "cta_section": {
    "title": "Chamada final irresistível",
    "subtitle": "Gatilho mental de urgência ou garantia de satisfação",
    "button_text": "Garantir minha vaga"
  }
}
`;

async function gerarDados(prompt) {
    // 1. TENTA GEMINI PRO (Forçando saída JSON pura)
    try {
        console.log("🤖 Consultando Gemini 1.5 Pro...");
        const model = genAI.getGenerativeModel({ 
            model: "gemini-pro-latest",
            generationConfig: { responseMimeType: "application/json" } // Impede a IA de mandar texto inútil
        });
        
        const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nINSTRUÇÕES DO USUÁRIO:\n${prompt}`);
        const text = result.response.text();
        return JSON.parse(text);
    } catch (e) {
        console.warn("⚠️ Gemini falhou, tentando Groq...", e.message);
    }

    // 2. TENTA GROQ FALLBACK (Forçando saída JSON pura)
    if (groq) {
        try {
            console.log("⚡ Consultando Groq...");
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }, // Exige JSON estrito
                temperature: 0.7,
            });
            const text = completion.choices[0]?.message?.content || "{}";
            return JSON.parse(text);
        } catch (e) {
            console.error("❌ Groq também falhou:", e.message);
        }
    }
    
    throw new Error("As IAs falharam em estruturar o conteúdo do site.");
}

async function gerarSite(prompt) {
    // O backend agora gera apenas os DADOS (Copywriting + Estrutura) e devolve o JSON pro frontend montar.
    const dadosJson = await gerarDados(prompt);
    return dadosJson;
}

// Essa função pode ser removida depois, mas deixei pra não quebrar imports do seu controller antigo
function limparCodigo(texto) { return texto; }

module.exports = { gerarSite, limparCodigo };