const aiService = require("../aiService");

/**
 * Thin wrapper so the fullstack engine can reuse the existing providers/fallback.
 * We keep the contract "return valid JSON object or throw".
 */
async function generateJson({ systemPrompt, userPrompt, temperature = 0.4 }) {
  if (!aiService || typeof aiService.__generateJsonWithFallback !== "function") {
    throw new Error("LLM JSON generator not available. Update aiService exports.");
  }

  const result = await aiService.__generateJsonWithFallback({ systemPrompt, userPrompt, temperature });
  if (!result || typeof result !== "object") {
    throw new Error("LLM did not return a JSON object.");
  }
  return result;
}

module.exports = { generateJson };

