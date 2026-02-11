// server/src/config/ai.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
require("dotenv").config();

// Configuração do Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

// Configuração do Groq (Opcional por enquanto, mas já deixamos pronto)
const groq = process.env.GROQ_API_KEY 
    ? new Groq({ apiKey: process.env.GROQ_API_KEY }) 
    : null;

module.exports = { geminiModel, groq };