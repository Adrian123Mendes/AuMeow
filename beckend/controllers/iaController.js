import dotenv from "dotenv";
import { Ollama } from "ollama";

dotenv.config();

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma3:4b";
const OLLAMA_TIMEOUT_MS = Number.parseInt(process.env.OLLAMA_TIMEOUT_MS || "120000", 10);
const ollamaClient = new Ollama({ host: OLLAMA_HOST });

const SYSTEM_PROMPT = [
  "Você é a IA do AuMeow.",
  "Responda sempre em português do Brasil, de forma curta, direta e simples.",
  "Não misture outros idiomas.",
  "Não use markdown, negrito ou asteriscos.",
  "Responda em no máximo 2 ou 3 frases.",
  "Quando o assunto envolver saúde de pets, oriente procurar um médico veterinário em casos graves, urgentes ou persistentes."
].join(" ");

function getErrorMessage(error) {
  return (
    error?.error ||
    error?.cause?.message ||
    error?.message ||
    "Falha desconhecida ao conectar com o Ollama."
  );
}

function getNormalizedErrorMessage(error) {
  return [error?.error, error?.message, error?.cause?.message]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getOllamaFailure(error) {
  const message = getErrorMessage(error);
  const normalizedMessage = getNormalizedErrorMessage(error);

  if (error?.code === "OLLAMA_TIMEOUT" || normalizedMessage.includes("tempo limite")) {
    return {
      status: 504,
      error: "Tempo limite ao gerar resposta da IA.",
      details: `O Ollama demorou mais de ${OLLAMA_TIMEOUT_MS / 1000}s para responder. Tente novamente.`
    };
  }

  if (normalizedMessage.includes("model requires more system memory")) {
    return {
      status: 503,
      error: "Modelo de IA sem memória suficiente.",
      details: `${message}. Feche outros programas ou configure OLLAMA_MODEL com um modelo menor.`
    };
  }

  if (
    normalizedMessage.includes("model") &&
    (normalizedMessage.includes("not found") ||
      normalizedMessage.includes("pull") ||
      normalizedMessage.includes("does not exist"))
  ) {
    return {
      status: 503,
      error: "Modelo de IA não encontrado.",
      details: `Instale o modelo com: ollama pull ${OLLAMA_MODEL}.`
    };
  }

  if (
    normalizedMessage.includes("fetch failed") ||
    normalizedMessage.includes("econnrefused") ||
    normalizedMessage.includes("connection refused") ||
    normalizedMessage.includes("connect") ||
    normalizedMessage.includes("bad port") ||
    normalizedMessage.includes("invalid url") ||
    normalizedMessage.includes("failed to parse")
  ) {
    return {
      status: 503,
      error: "Ollama indisponível.",
      details: `Não foi possível conectar ao Ollama em ${OLLAMA_HOST}. Verifique se o serviço está rodando.`
    };
  }

  return {
    status: 500,
    error: "Erro ao gerar resposta da IA.",
    details: message
  };
}

function withTimeout(promise, timeoutMs) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return promise;
  }

  let timeoutId;

  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error("Tempo limite ao conectar com o Ollama.");
      error.code = "OLLAMA_TIMEOUT";
      reject(error);
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

export async function generateResponse(req, res) {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";

  if (!message) {
    return res.status(400).json({ error: "Mensagem obrigatória." });
  }

  if (message.length > 2000) {
    return res.status(413).json({
      error: "Mensagem muito longa.",
      details: "Envie no máximo 2000 caracteres."
    });
  }

  try {
    const response = await withTimeout(
      ollamaClient.chat({
        model: OLLAMA_MODEL,
        stream: false,
        options: {
          temperature: 0.2,
          top_p: 0.9,
          num_predict: 180
        },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message }
        ]
      }),
      OLLAMA_TIMEOUT_MS
    );

    const reply = response?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({
        error: "A IA retornou uma resposta vazia.",
        details: "Tente novamente em instantes."
      });
    }

    return res.json({ reply });
  } catch (error) {
    console.error("Erro IA:", error);
    const failure = getOllamaFailure(error);
    return res.status(failure.status).json({
      error: failure.error,
      details: failure.details
    });
  }
}
