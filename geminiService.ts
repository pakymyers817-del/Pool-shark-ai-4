import { GoogleGenAI, Type } from "@google/genai";
import { ShotAnalysis, PlayerTarget } from "./types";

const processFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const analyzePoolShot = async (file: File, playerTarget: PlayerTarget): Promise<ShotAnalysis> => {
  try {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error("API Key is missing. In Vercel, go to Settings > Environment Variables and add 'API_KEY'.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const base64Data = await processFileToBase64(file);

    const targetDescription = playerTarget === 'solids' 
      ? "Solids (Balls 1-7, colored balls)" 
      : "Stripes (Balls 9-15, white balls with colored stripe)";

    const prompt = `
      You are a professional 8-ball pool instructor and physics expert. 
      Analyze the provided image of a pool table. 
      
      The active player is targeting: ${targetDescription}.
      
      Identify the cue ball and all object balls. 
      Determine the statistically optimal next shot for the active player.
      You must ONLY recommend a shot on a ball belonging to the ${targetDescription} group.
      If all balls of that group are cleared, you may recommend shooting the 8-ball (black).
      Do NOT recommend shooting the opponent's balls.
      
      Consider:
      1. Angle of cut.
      2. Distance to pocket.
      3. Potential cue ball scratch risks.
      4. Position for the next shot (leave).
      5. Obstacles or blockers.
      
      Return the coordinates as percentages (0-100) relative to the image dimensions (Top-Left is 0,0).
      If you cannot determine the exact coordinates, estimate them based on the visual layout.
      
      Output strictly in JSON format matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedShot: { 
              type: Type.STRING, 
              description: "A short, punchy title for the shot (e.g., 'Cut the 5-ball into Corner Pocket')" 
            },
            reasoning: { 
              type: Type.STRING, 
              description: "Detailed explanation of why this is the best shot, including english/spin advice if applicable." 
            },
            difficulty: { 
              type: Type.STRING, 
              enum: ["Easy", "Medium", "Hard", "Expert"] 
            },
            cueBallPosition: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER, description: "X percentage (0-100) from left" },
                y: { type: Type.NUMBER, description: "Y percentage (0-100) from top" }
              }
            },
            targetBallPosition: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER, description: "X percentage (0-100) from left" },
                y: { type: Type.NUMBER, description: "Y percentage (0-100) from top" }
              }
            },
            targetPocketPosition: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER, description: "X percentage (0-100) from left" },
                y: { type: Type.NUMBER, description: "Y percentage (0-100) from top" }
              }
            },
            confidenceScore: { 
              type: Type.NUMBER, 
              description: "Confidence in the analysis from 0 to 1" 
            }
          },
          required: ["recommendedShot", "reasoning", "difficulty", "confidenceScore"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No data returned from AI.");
    }

    return JSON.parse(jsonText) as ShotAnalysis;

  } catch (error: any) {
    console.error("Analysis Failed:", error);
    if (error.message && error.message.includes("API Key")) {
      throw error;
    }
    throw new Error("Failed to analyze the pool table. Please ensure the image is clear and try again.");
  }
};