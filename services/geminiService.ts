import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
export const generatePoeticWelcome = async (name: string, eventName: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Write a very short, poetic, and warm welcome email body (max 50 words) for an attendee named "${name}" 
      who has been approved for the event "${eventName}". 
      The tone should be serene, elegant, and welcoming. 
      Do not include subject lines or headers. Just the message.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || `Welcome, ${name}. We are honored to have you join us.`;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Welcome, ${name}. We are delighted to confirm your attendance to ${eventName}.`;
  }
};

export const analyzePaymentProof = async (base64Image: string): Promise<boolean> => {
  // Simulating a check on a receipt image using Gemini Vision
  // In a real app, we would send the image to check for valid dates/amounts.
  // For this demo, we just return true effectively, but showing the code structure.
  try {
     // To minimize API usage in this demo context, we just simulate a delay.
     // Real implementation:
     /*
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                { text: "Is this a valid receipt or payment proof? Answer YES or NO." }
            ]
        }
     });
     */
     await new Promise(resolve => setTimeout(resolve, 1000));
     return true; 
  } catch (e) {
    return true;
  }
}
