import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent("Hello! Test message from Vastu AI.");
  console.log(result.response.text());
}

test();