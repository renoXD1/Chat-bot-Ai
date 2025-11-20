// groq-api.js
const GROQ_API_KEY = "GROQ_API_KEY"; // GANTI YA!
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function sendMessageToGroq(messages, model = "llama-3.1-70b-versatile") {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.8,
      stream: true
    })
  });

  if (!response.ok) throw new Error("Gagal koneksi ke Groq");

  return response.body.getReader();
}
