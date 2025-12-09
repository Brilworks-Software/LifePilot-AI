import { GoogleGenAI } from "@google/genai";
import { GeminiConfig, Message } from '../firebase/types';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error("API_KEY is not defined in the environment.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_FOR_BUILD' });

export const sendMessageToGemini = async (
  messages: Message[],
  newItem: string,
  config: GeminiConfig,
  image?: string // Base64 string
): Promise<string> => {
  try {
    // Construct the history for the chat
    // We only take the last few messages to keep context relevant and avoid token limits,
    // though Flash has a large context window.
    const recentHistory = messages.slice(-10).map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    // Create the content part for the new message
    const newParts: any[] = [{ text: newItem }];
    
    if (image) {
      // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
      const base64Data = image.split(',')[1] || image;
      newParts.unshift({
        inlineData: {
          mimeType: 'image/jpeg', // Assuming jpeg for simplicity, or detect from string
          data: base64Data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: config.model,
      contents: [
        ...recentHistory.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: newParts }
      ],
      config: {
        systemInstruction: config.systemInstruction,
        temperature: config.temperature,
      }
    });

    return response.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the stars (or the server). Please try again later.";
  }
};

export const generateScheduleICS = (taskDescription: string): string => {
  // A simple helper to simulate ICS generation (mocked for this context)
  // In a real app, this would use a library to parse the text and create a blob.
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OmniLife AI//EN
BEGIN:VEVENT
SUMMARY:Scheduled Task
DESCRIPTION:${taskDescription}
DTSTART:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${new Date(Date.now() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z
END:VEVENT
END:VCALENDAR`;
};
