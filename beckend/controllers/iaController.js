import ollama from "ollama";

export async function generateResponse(req, res) {
  const { message } = req.body;

  try {
const response = await ollama.chat({
    model: "gemma3:4b",
    messages: [
        {
            role: "system",
            content:
                "Você é o AuMeow IA. Sempre responda de forma curta, direta e simples. Não use markdown, não use negrito, não use asteriscos. Responda em no máximo 2 ou 3 frases."
        },
        { role: "user", content: message }
    ],
});

    res.json({ reply: response.message.content });
  } catch (error) {
    console.error("Erro IA:", error.message);
    res.status(500).json({ error: "Erro ao gerar resposta da IA" });
  }
}
