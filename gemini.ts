
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { KNOWLEDGE_BASE } from "../constants";

export const getGeminiResponse = async (prompt: string): Promise<string> => {
  try {
    // Fix: Initialize GoogleGenAI using process.env.API_KEY directly as required by guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct system instruction with context from our knowledge base
    const knowledgeContext = KNOWLEDGE_BASE.map(cat => {
      const subs = cat.subCategories.map(sub => `- ${sub.title}: ${sub.links.map(l => l.title).join(', ')}`).join('\n');
      return `### ${cat.title}\n${cat.description || ''}\n${subs}`;
    }).join('\n\n');

    const systemInstruction = `
      You are InsightHub Assistant, an AI expert focused on the user's personal knowledge base.
      The user has notes on these subjects:
      ${knowledgeContext}

      Instructions:
      1. Use the provided context to answer questions about what is in the repository.
      2. If asked about a specific topic, provide a brief, professional summary and how it relates to other topics in the index.
      3. Keep responses concise, helpful, and academic in tone.
      4. If a topic isn't in the index, you can still answer but mention it's outside the current repository.
      5. Use Markdown for formatting.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    // Accessing .text as a property, not a method, as per guidelines
    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while communicating with the AI. Please ensure your API key is valid.";
  }
};
