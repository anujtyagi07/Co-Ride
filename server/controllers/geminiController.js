import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()
export const generateText=async(req,res,next)=>{
    const prompt = req.body.prompt;
  const apiKey =process.env.GEMINI_API_KEY;

  try {
    const response = await axios.post('https://api.gemini.com/v1/generate', {
      prompt: prompt,
      // Additional options if needed
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).send('Error calling Gemini API');
  }
}