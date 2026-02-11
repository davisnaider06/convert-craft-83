// server/test-models.js
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ ERRO: Nenhuma GEMINI_API_KEY encontrada no arquivo .env");
    process.exit(1);
}

console.log("🔍 Testando chave de API:", API_KEY.substring(0, 10) + "...");
console.log("📡 Conectando ao Google para listar modelos disponíveis...");

async function listarModelos() {
    try {
        // Vamos usar a API REST direta para não depender da versão do SDK
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        
        console.log("\n✅ CONEXÃO BEM SUCEDIDA! Aqui estão seus modelos:");
        console.log("=================================================");

        if (!data.models) {
            console.log("⚠️ Nenhum modelo retornado. Sua chave pode estar sem permissões de IA Generativa.");
            return;
        }

        // Filtra e mostra apenas os modelos que servem para gerar texto (generateContent)
        const modelosUteis = data.models.filter(m => 
            m.supportedGenerationMethods.includes("generateContent")
        );

        modelosUteis.forEach(model => {
            console.log(`🔹 NOME: ${model.name.replace('models/', '')}`);
            console.log(`   DESCRIÇÃO: ${model.displayName}`);
            console.log(`   VERSÃO: ${model.version}`);
            console.log("-------------------------------------------------");
        });

        console.log("\n💡 DICA: Copie um dos 'NOME' acima (ex: gemini-pro) e coloque no seu código.");

    } catch (error) {
        console.error("\n❌ FALHA FATAL:");
        console.error(error.message);
        console.error("Verifique se sua chave de API é válida e se a API 'Google Generative AI' está ativada no Google Cloud Console.");
    }
}

listarModelos();