function toggleChat() {
    const chat = document.getElementById("ai-chat-window");
    if (chat.classList.contains("hidden")) {
        chat.classList.remove("hidden");
        setTimeout(() => chat.classList.remove("scale-95"), 10);
        setTimeout(() => document.getElementById("chat-input").focus(), 100);
    } else {
        chat.classList.add("scale-95");
        setTimeout(() => chat.classList.add("hidden"), 200);
    }
}

function handleChatKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const input = document.getElementById("chat-input");
    const message = input.value.trim();

    if (!message) return;

    addMessageToChat(message, "user");
    input.value = "";

    const container = document.getElementById("chat-messages");
    const loading = document.createElement("div");
    loading.id = "ai-loading";
    loading.className = "flex gap-2 items-end fade-in";
    loading.innerHTML = `
        <div class="w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center text-white text-xs">
            <i class="fa-solid fa-cat"></i>
        </div>
        <div class="bg-white p-3 rounded-xl rounded-tl-none shadow-sm text-gray-400 border border-gray-100 text-xs italic">
            Digitando...
        </div>
    `;
    container.appendChild(loading);
    container.scrollTop = container.scrollHeight;

    try {
        const response = await fetch(buildApiUrl("/api/ia/chat"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }

        const data = await response.json();
        loading.remove();
        addMessageToChat(data.reply || "Sem resposta.", "bot");
    } catch (error) {
        loading.remove();
        addMessageToChat("Desculpe, eu estou com dificuldade para responder agora.", "bot");
        console.error("Erro ao conectar com IA:", error);
    }
}

function addMessageToChat(text, sender) {
    const container = document.getElementById("chat-messages");
    const div = document.createElement("div");
    div.className = sender === "user" ? "flex justify-end fade-in" : "flex gap-2 items-end fade-in";

    const bubble = document.createElement("div");

    if (sender === "user") {
        bubble.className = "bg-brand-purple text-white p-3 rounded-xl rounded-tr-none shadow-sm text-sm max-w-[80%]";
        bubble.textContent = text;
        div.appendChild(bubble);
    } else {
        const icon = document.createElement("div");
        icon.className = "w-6 h-6 bg-brand-orange rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs";
        icon.innerHTML = '<i class="fa-solid fa-cat"></i>';

        bubble.className = "bg-white p-3 rounded-xl rounded-tl-none shadow-sm text-gray-600 border border-gray-100 text-sm";
        bubble.textContent = text;

        div.appendChild(icon);
        div.appendChild(bubble);
    }

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}
