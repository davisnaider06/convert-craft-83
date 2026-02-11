const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const SYSTEM_PROMPT = `
Você é um Copywriter Sênior e Web Designer especializado em Landing Pages de Alta Conversão.
O usuário vai te passar o Nicho e as Customizações.

Você DEVE retornar EXATAMENTE um JSON válido com a seguinte estrutura. NÃO adicione texto extra, nem markdown.

{
  "colors": {
    "primary": "OBRIGATÓRIO usar código HEX (ex: #EF4444 para vermelho, #10B981 para verde)",
    "secondary": "Cor secundária em código HEX",
    "accent": "Cor de destaque em código HEX"
  },
  "hero": {
    "headline": "Headline principal curta e muito persuasiva focada no resultado",
    "subheadline": "Subtítulo explicativo focando na dor do cliente (2 a 3 linhas)",
    "cta": "Texto de ação forte para o botão (ex: Quero Começar Agora)",
    "image_keyword": "keyword em inglês para buscar imagem no unsplash (ex: modern gym workout)"
  },
  "features": [
    { "title": "Benefício 1", "description": "Explicação persuasiva.", "icon": "zap" },
    { "title": "Benefício 2", "description": "Explicação persuasiva.", "icon": "shield" },
    { "title": "Benefício 3", "description": "Explicação persuasiva.", "icon": "star" }
  ],
  "social_proof": {
    "title": "Empresas e pessoas que confiam",
    "logos": ["Empresa A", "Empresa B", "Empresa C", "Empresa D"]
  },
  "testimonials": [
    { "name": "Nome Cliente 1", "role": "Cargo/Situação", "content": "Depoimento realista e focado no resultado." },
    { "name": "Nome Cliente 2", "role": "Cargo/Situação", "content": "Depoimento realista e focado no resultado." }
  ],
  "pricing": [
    { "name": "Básico", "price": "R$ 97", "features": ["Feature principal"], "recommended": false },
    { "name": "Profissional", "price": "R$ 197", "features": ["Tudo do básico", "Suporte VIP"], "recommended": true }
  ],
  "faq": [
    { "question": "Dúvida comum 1?", "answer": "Quebra de objeção clara e direta." },
    { "question": "Dúvida comum 2?", "answer": "Quebra de objeção clara e direta." }
  ],
  "cta_section": {
    "title": "Chamada final irresistível",
    "subtitle": "Gatilho mental de urgência ou garantia",
    "button_text": "Garantir minha vaga"
  }
}
`;

async function gerarDados(prompt) {
    // Cascata de Modelos: Do mais moderno ao mais conservador
    const geminiModels = [
        "gemini-2.0-flash",
        "gemini-1.5-pro-latest",
        "gemini-1.5-flash-latest",
        "gemini-pro"
    ];

    let dadosJson = null;

    for (const modelName of geminiModels) {
        try {
            console.log(`🤖 Tentando Gemini com o modelo: ${modelName}...`);
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                generationConfig: { responseMimeType: "application/json" } 
            });
            
            const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nINSTRUÇÕES DO USUÁRIO:\n${prompt}`);
            const text = result.response.text();
            
            dadosJson = JSON.parse(text);
            console.log(`✅ Sucesso com ${modelName}!`);
            break; 
            
        } catch (e) {
            console.warn(`⚠️ Falha no ${modelName}: ${e.message.split('\n')[0]}`);
        }
    }

    if (dadosJson) return dadosJson;

    console.warn("🚨 Todos os modelos Gemini falharam. Tentando Groq de emergência...");
    if (groq) {
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: prompt }
                ],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }, 
                temperature: 0.7,
            });
            const text = completion.choices[0]?.message?.content || "{}";
            console.log("✅ Sucesso com Groq!");
            return JSON.parse(text);
        } catch (e) {
            console.error("❌ Groq também falhou:", e.message);
        }
    }
    
    throw new Error("As IAs falharam em estruturar o conteúdo do site.");
}

async function gerarSite(prompt) {
    const dadosJson = await gerarDados(prompt);
    return dadosJson;
}

function limparCodigo(texto) { return texto; }

module.exports = { gerarSite, limparCodigo };