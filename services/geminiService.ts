import { GoogleGenAI } from "@google/genai";
import { UserProfile } from "../types";

// Initialize AI Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemInstruction = (role: 'trainer' | 'nutritionist' | 'general', profile: UserProfile): string => {
  const baseInfo = `
    PERFIL DO CLIENTE:
    - Idade: ${profile.age} anos
    - Peso: ${profile.weight}kg
    - Objetivo: ${profile.goal}
  `;

  const commonRules = `
    DIRETRIZES GERAIS:
    1. **OBJETIVIDADE**: Use parágrafos curtos.
    2. **VISUAL**: Use **Negrito** para destaques. Tabelas Markdown limpas.
    3. **LINKS DO YOUTUBE (CRÍTICO - PRIORIDADE MÁXIMA)**:
       - O usuário PRECISA ver o vídeo da execução.
       - Tente encontrar um vídeo específico com a ferramenta de busca (googleSearch).
       - **REGRA DE SEGURANÇA (FALLBACK)**: Se a busca falhar ou não retornar um vídeo exato, VOCÊ DEVE USAR O LINK DE PESQUISA DO YOUTUBE fornecido no prompt ou gerar um similar.
         Exemplo de Fallback: "https://www.youtube.com/results?search_query=tecnica+correta+NOME_DO_EXERCICIO"
       - O Link DEVE aparecer no texto EXATAMENTE assim: [Assistir Vídeo no YouTube](URL).
    4. **TOM**: Profissional de elite.
  `;

  if (role === 'trainer') {
    return `
      ${baseInfo}
      ATUE COMO: Personal Trainer Especialista.
      ${commonRules}
      
      REGRAS ESPECÍFICAS:
      1. **CRONOGRAMAS**: Tabela limpa (| Exercício | Séries | Repetições |). Sem cadência/tempo. Abaixo, explique a execução em parágrafos resumidos (3 linhas máx).
      2. **CORREÇÃO DE TÉCNICA**: 
         - **OBRIGATÓRIO**: A resposta DEVE começar com o link do vídeo.
         - Formato: [Assistir Vídeo no YouTube](URL).
         - Se não tiver certeza da URL do vídeo específico, use a URL de busca geral. NUNCA deixe sem link.
    `;
  }

  if (role === 'nutritionist') {
    return `
      ${baseInfo}
      ATUE COMO: Nutricionista Esportivo Clínico.
      ${commonRules}
      
      REGRAS ESPECÍFICAS:
      1. **PLANO ALIMENTAR**: Foco na COMIDA.
         - Tabela OBRIGATÓRIA: | Refeição | Alimentos | Quantidade (g) |.
         - IMPORTANTE: Você DEVE especificar o peso em GRAMAS para cada item (ex: Arroz Branco 150g). Se for unidade, estime o peso em gramas (ex: 1 Ovo Médio (50g)).
      2. **SUPLEMENTAÇÃO + LAUDO**: Quando pedido suplementação, liste TODOS os suplementos necessários. No final da resposta, inclua um breve LAUDO NUTRICIONAL (Resumo do estado atual e estratégia).
    `;
  }

  return baseInfo;
};

export interface AIResponse {
  text: string;
  groundingMetadata?: any;
}

export const sendMessageToAI = async (
  message: string, 
  history: any[], 
  profile: UserProfile, 
  role: 'trainer' | 'nutritionist'
): Promise<AIResponse> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: getSystemInstruction(role, profile),
        temperature: 0.4,
        maxOutputTokens: 3000,
        tools: [
            { googleSearch: {} }
        ]
      },
      history: history
    });

    const response = await chat.sendMessage({
      message: message + " (Responda em Markdown. Para exercícios, OBRIGATÓRIO incluir link [Assistir Vídeo no YouTube](URL). Para dieta, use GRAMAS)."
    });

    return {
      text: response.text || "Comando processado.",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };
  } catch (error) {
    console.error("AI Error:", error);
    return { text: "Ocorreu um erro ao gerar sua resposta. Tente novamente." };
  }
};

// Updated to accept multiple images
export const analyzeImage = async (base64Images: string[], prompt: string, type: 'body' | 'food'): Promise<AIResponse> => {
   try {
    const model = 'gemini-2.5-flash-image';
    const enhancedPrompt = prompt + " Responda com um laudo técnico profissional e estruturado.";

    // Create parts for each image
    const imageParts = base64Images.map(imgData => ({
        inlineData: { mimeType: 'image/jpeg', data: imgData }
    }));

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
            ...imageParts,
            { text: enhancedPrompt }
        ]
      }
    });

    return {
        text: response.text || "Imagem analisada."
    };
   } catch (error) {
     console.error("Vision Error:", error);
     return { text: "Erro na análise visual." };
   }
};