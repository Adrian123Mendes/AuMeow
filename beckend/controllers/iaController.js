import ollama from "ollama";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma3:4b";

export async function generateResponse(req, res) {
  const { message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: "Mensagem obrigatoria." });
  }

  try {
    const response = await ollama.chat({
      host: OLLAMA_HOST,
      model: OLLAMA_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Voce e o AuMeow IA. Sempre responda de forma curta, direta e simples. Nao use markdown, nao use negrito, nao use asteriscos. Responda em no maximo 2 ou 3 frases."
        },
        { role: "user", content: message.trim() }
      ]
    });

    res.json({ reply: response.message.content });
  } catch (error) {
    console.error("Erro IA:", error);
    res.status(500).json({
      error: "Erro ao gerar resposta da IA.",
      details: error?.message || "Falha desconhecida ao conectar com o Ollama."
    });
  }
}
