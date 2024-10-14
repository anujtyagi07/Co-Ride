

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Use import.meta.env for environment variables in Vite
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export async function run(startLocation, destination) {
  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  const result = await chatSession.sendMessage(`approximate fare from ${startLocation} to ${destination} in Bengaluru with a cab at 1 pm. Give only the price and no extra information.`);
  console.log(result.response.text());
  return result.response.text();
}

const filterPrompt = async (prompt) => {
  return '';
};
