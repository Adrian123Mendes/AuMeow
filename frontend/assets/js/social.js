const socialState = {
    conversations: [],
    invites: [],
    selectedConversationId: null,
    messages: [],
    initialized: false
};

function getSocialElements() {
    return {
        addFriendButton: document.getElementById("socialAddFriendButton"),
        addFriendModal: document.getElementById("modalAdicionarAmigoSocial"),
        addFriendForm: document.getElementById("socialAddFriendForm"),
        addFriendEmail: document.getElementById("socialAddFriendEmail"),
        addFriendError: document.getElementById("socialAddFriendError"),
        addFriendCloseButton: document.getElementById("socialAddFriendCloseButton"),
        addFriendCancelButton: document.getElementById("socialAddFriendCancelButton"),
        addFriendSubmitButton: document.getElementById("socialAddFriendSubmitButton"),
        invitesList: document.getElementById("socialInvitesList"),
        conversationsList: document.getElementById("socialConversationsList"),
        chatAvatar: document.getElementById("socialChatAvatar"),
        chatName: document.getElementById("socialChatName"),
        chatStatus: document.getElementById("socialChatStatus"),
        messagesList: document.getElementById("socialMessagesList"),
        messageForm: document.getElementById("socialMessageForm"),
        messageInput: document.getElementById("socialMessageInput"),
        sendButton: document.getElementById("socialSendButton")
    };
}

function notifySocial(message, options = {}) {
    if (typeof showPetToast === "function") {
        showPetToast(message, options);
        return;
    }

    console.log(message);
}

function setSocialAddFriendError(message = "") {
    const { addFriendError } = getSocialElements();
    if (!addFriendError) return;

    addFriendError.textContent = message;
    addFriendError.classList.toggle("hidden", !message);
}

function setSocialAddFriendLoading(isLoading) {
    const { addFriendEmail, addFriendSubmitButton, addFriendCancelButton, addFriendCloseButton } = getSocialElements();

    if (addFriendEmail) {
        addFriendEmail.disabled = isLoading;
    }

    if (addFriendSubmitButton) {
        addFriendSubmitButton.disabled = isLoading;
        addFriendSubmitButton.textContent = isLoading ? "Enviando..." : "Enviar convite";
        addFriendSubmitButton.classList.toggle("opacity-70", isLoading);
        addFriendSubmitButton.classList.toggle("cursor-not-allowed", isLoading);
    }

    [addFriendCancelButton, addFriendCloseButton].forEach((button) => {
        if (!button) return;
        button.disabled = isLoading;
        button.classList.toggle("opacity-70", isLoading);
        button.classList.toggle("cursor-not-allowed", isLoading);
    });
}

function openSocialAddFriendModal() {
    const { addFriendModal, addFriendForm, addFriendEmail } = getSocialElements();
    if (!addFriendModal) return;

    addFriendForm?.reset();
    setSocialAddFriendError("");
    setSocialAddFriendLoading(false);
    addFriendModal.classList.remove("hidden");
    setTimeout(() => addFriendEmail?.focus(), 50);
}

function closeSocialAddFriendModal() {
    const { addFriendModal } = getSocialElements();
    if (!addFriendModal) return;

    setSocialAddFriendError("");
    setSocialAddFriendLoading(false);
    addFriendModal.classList.add("hidden");
}

async function parseSocialResponse(response) {
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : null;

    if (!response.ok) {
        throw new Error(data?.error || `Erro HTTP ${response.status}`);
    }

    return data;
}

function getSocialInitials(name = "") {
    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("");

    return initials || "AU";
}

function formatSocialTime(value) {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const today = new Date();
    const sameDay = date.toDateString() === today.toDateString();

    if (sameDay) {
        return date.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit"
    });
}

function setSocialChatEnabled(enabled) {
    const { messageInput, sendButton } = getSocialElements();

    if (messageInput) {
        messageInput.disabled = !enabled;
        if (!enabled) messageInput.value = "";
    }

    if (sendButton) {
        sendButton.disabled = !enabled;
    }
}

function renderSocialInvites() {
    const { invitesList } = getSocialElements();
    if (!invitesList) return;

    invitesList.innerHTML = "";

    if (socialState.invites.length === 0) {
        const empty = document.createElement("p");
        empty.className = "text-xs text-gray-400";
        empty.textContent = "Sem convites pendentes.";
        invitesList.appendChild(empty);
        return;
    }

    socialState.invites.forEach((invite) => {
        const item = document.createElement("div");
        item.className = "flex items-center gap-2 bg-[var(--pet-card)] p-2 rounded-lg shadow-sm";

        const avatar = document.createElement("div");
        avatar.className = "w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center text-[10px] font-bold";
        avatar.textContent = getSocialInitials(invite.remetente_nome);

        const body = document.createElement("div");
        body.className = "flex-1 min-w-0";

        const name = document.createElement("p");
        name.className = "text-xs font-bold truncate";
        name.textContent = invite.remetente_nome;

        const email = document.createElement("p");
        email.className = "text-[10px] text-gray-400 truncate";
        email.textContent = invite.remetente_email;

        body.appendChild(name);
        body.appendChild(email);

        const accept = document.createElement("button");
        accept.type = "button";
        accept.className = "text-green-500 hover:bg-green-100 p-1 rounded";
        accept.title = "Aceitar convite";
        accept.innerHTML = '<i class="fa-solid fa-check"></i>';
        accept.addEventListener("click", () => respondSocialInvite(invite.id, "accept"));

        const reject = document.createElement("button");
        reject.type = "button";
        reject.className = "text-red-500 hover:bg-red-100 p-1 rounded";
        reject.title = "Recusar convite";
        reject.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        reject.addEventListener("click", () => respondSocialInvite(invite.id, "reject"));

        item.appendChild(avatar);
        item.appendChild(body);
        item.appendChild(accept);
        item.appendChild(reject);
        invitesList.appendChild(item);
    });
}

function renderSocialConversations() {
    const { conversationsList } = getSocialElements();
    if (!conversationsList) return;

    conversationsList.innerHTML = "";

    if (socialState.conversations.length === 0) {
        const empty = document.createElement("div");
        empty.className = "p-3 text-xs text-gray-400 leading-relaxed";
        empty.textContent = "Nenhuma conversa ainda. Use + Amigo para convidar alguém pelo e-mail.";
        conversationsList.appendChild(empty);
        return;
    }

    const selectedExists = socialState.conversations.some(
        (conversation) => conversation.id === socialState.selectedConversationId
    );

    if (!selectedExists) {
        socialState.selectedConversationId = socialState.conversations[0].id;
    }

    socialState.conversations.forEach((conversation) => {
        const isSelected = conversation.id === socialState.selectedConversationId;
        const item = document.createElement("button");
        item.type = "button";
        item.className = [
            "w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition text-left",
            isSelected
                ? "bg-[var(--pet-card)] shadow-sm border border-orange-100"
                : "hover:bg-gray-100"
        ].join(" ");

        const avatarWrap = document.createElement("div");
        avatarWrap.className = "relative";

        const avatar = document.createElement("div");
        avatar.className = "w-10 h-10 rounded-full bg-brand-purple text-white flex items-center justify-center text-xs font-bold";
        avatar.textContent = getSocialInitials(conversation.outro_usuario_nome);

        const online = document.createElement("span");
        online.className = "absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full";

        avatarWrap.appendChild(avatar);
        avatarWrap.appendChild(online);

        const body = document.createElement("div");
        body.className = "flex-1 min-w-0";

        const row = document.createElement("div");
        row.className = "flex justify-between gap-2";

        const name = document.createElement("h4");
        name.className = `font-bold text-sm truncate ${isSelected ? "text-gray-800" : "text-gray-600"}`;
        name.textContent = conversation.outro_usuario_nome;

        const time = document.createElement("span");
        time.className = "text-[10px] text-gray-400 shrink-0";
        time.textContent = formatSocialTime(conversation.ultima_mensagem_em || conversation.criado_em);

        row.appendChild(name);
        row.appendChild(time);

        const preview = document.createElement("p");
        preview.className = `text-xs truncate ${isSelected ? "text-gray-500" : "text-gray-400"}`;
        preview.textContent = conversation.ultima_mensagem || "Conversa iniciada. Envie uma mensagem.";

        body.appendChild(row);
        body.appendChild(preview);

        item.appendChild(avatarWrap);
        item.appendChild(body);
        item.addEventListener("click", () => selectSocialConversation(conversation.id));
        conversationsList.appendChild(item);
    });
}

function renderSocialHeader() {
    const { chatAvatar, chatName, chatStatus } = getSocialElements();
    const conversation = socialState.conversations.find(
        (item) => item.id === socialState.selectedConversationId
    );

    if (!conversation) {
        if (chatAvatar) chatAvatar.textContent = "--";
        if (chatName) chatName.textContent = "Selecione uma conversa";
        if (chatStatus) chatStatus.innerHTML = '<i class="fa-solid fa-circle text-[6px]"></i> Social AuMeow';
        setSocialChatEnabled(false);
        return;
    }

    if (chatAvatar) {
        chatAvatar.textContent = getSocialInitials(conversation.outro_usuario_nome);
    }

    if (chatName) {
        chatName.textContent = conversation.outro_usuario_nome;
    }

    if (chatStatus) {
        chatStatus.innerHTML = '<i class="fa-solid fa-circle text-[6px] text-green-500"></i> Conversa ativa';
    }

    setSocialChatEnabled(true);
}

function renderSocialMessages() {
    const { messagesList } = getSocialElements();
    if (!messagesList) return;

    messagesList.innerHTML = "";

    if (!socialState.selectedConversationId) {
        const empty = document.createElement("div");
        empty.className = "h-full flex items-center justify-center text-center text-sm text-gray-400";
        empty.textContent = "Adicione um amigo pelo e-mail ou selecione uma conversa.";
        messagesList.appendChild(empty);
        return;
    }

    if (socialState.messages.length === 0) {
        const empty = document.createElement("div");
        empty.className = "h-full flex items-center justify-center text-center text-sm text-gray-400";
        empty.textContent = "Conversa criada. Envie a primeira mensagem.";
        messagesList.appendChild(empty);
        return;
    }

    socialState.messages.forEach((message) => {
        const sentByMe = Boolean(message.enviada_por_mim);
        const row = document.createElement("div");
        row.className = sentByMe
            ? "flex items-end gap-2 justify-end"
            : "flex items-end gap-2";

        if (!sentByMe) {
            const avatar = document.createElement("div");
            avatar.className = "w-8 h-8 rounded-full bg-brand-purple text-white flex items-center justify-center text-[10px] font-bold mb-1";
            avatar.textContent = getSocialInitials(message.usuario_nome);
            row.appendChild(avatar);
        }

        const bubble = document.createElement("div");
        bubble.className = sentByMe
            ? "bg-[var(--pet-coral)] text-white p-3 rounded-2xl rounded-br-none shadow-md max-w-[75%] text-sm whitespace-pre-wrap break-words"
            : "bg-[var(--pet-card)] text-gray-700 p-3 rounded-2xl rounded-bl-none shadow-sm max-w-[75%] text-sm whitespace-pre-wrap break-words";
        bubble.textContent = message.conteudo;

        row.appendChild(bubble);
        messagesList.appendChild(row);
    });

    messagesList.scrollTop = messagesList.scrollHeight;
}

async function loadSocialMessages() {
    if (!socialState.selectedConversationId) {
        socialState.messages = [];
        renderSocialHeader();
        renderSocialMessages();
        return;
    }

    const { messagesList } = getSocialElements();
    if (messagesList) {
        messagesList.innerHTML = '<p class="text-sm text-gray-400">Carregando mensagens...</p>';
    }

    try {
        const response = await apiFetch(`/api/social/conversations/${socialState.selectedConversationId}/messages`);
        socialState.messages = await parseSocialResponse(response);
        renderSocialHeader();
        renderSocialMessages();
    } catch (error) {
        console.error("Erro ao carregar mensagens sociais:", error);
        notifySocial(error.message, {
            title: "Falha no Social",
            iconClass: "fa-solid fa-triangle-exclamation",
            iconWrapperClass: "bg-red-100 text-red-500"
        });
    }
}

async function refreshSocialSidebar() {
    const [invitesResponse, conversationsResponse] = await Promise.all([
        apiFetch("/api/social/invites"),
        apiFetch("/api/social/conversations")
    ]);

    socialState.invites = await parseSocialResponse(invitesResponse);
    socialState.conversations = await parseSocialResponse(conversationsResponse);

    renderSocialInvites();
    renderSocialConversations();
    renderSocialHeader();
}

async function loadSocial() {
    try {
        await refreshSocialSidebar();
        await loadSocialMessages();
    } catch (error) {
        console.error("Erro ao carregar Social:", error);
        notifySocial(error.message, {
            title: "Falha no Social",
            iconClass: "fa-solid fa-triangle-exclamation",
            iconWrapperClass: "bg-red-100 text-red-500"
        });
    }
}

async function selectSocialConversation(conversationId) {
    socialState.selectedConversationId = conversationId;
    renderSocialConversations();
    renderSocialHeader();
    await loadSocialMessages();
}

async function respondSocialInvite(inviteId, action) {
    try {
        const response = await apiFetch(`/api/social/invites/${inviteId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action })
        });

        const data = await parseSocialResponse(response);
        if (data.conversationId) {
            socialState.selectedConversationId = data.conversationId;
        }

        notifySocial(data.message || "Convite atualizado.", {
            title: "Social",
            iconClass: "fa-solid fa-user-check"
        });
        await loadSocial();
    } catch (error) {
        console.error("Erro ao responder convite social:", error);
        notifySocial(error.message, {
            title: "Falha no convite",
            iconClass: "fa-solid fa-triangle-exclamation",
            iconWrapperClass: "bg-red-100 text-red-500"
        });
    }
}

async function addSocialFriend(event) {
    event.preventDefault();

    const { addFriendEmail } = getSocialElements();
    const normalizedEmail = addFriendEmail?.value.trim().toLowerCase();

    if (!normalizedEmail) {
        setSocialAddFriendError("Informe o e-mail do amigo.");
        addFriendEmail?.focus();
        return;
    }

    setSocialAddFriendError("");
    setSocialAddFriendLoading(true);

    try {
        const response = await apiFetch("/api/social/invites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: normalizedEmail })
        });

        const data = await parseSocialResponse(response);
        notifySocial(data.message || "Convite enviado.", {
            title: "Social",
            iconClass: "fa-solid fa-user-plus"
        });
        closeSocialAddFriendModal();
        await loadSocial();
    } catch (error) {
        console.error("Erro ao enviar convite social:", error);
        setSocialAddFriendError(error.message);
    } finally {
        setSocialAddFriendLoading(false);
    }
}

async function sendSocialMessage(event) {
    event.preventDefault();

    const { messageInput, sendButton } = getSocialElements();
    const content = messageInput?.value.trim();

    if (!socialState.selectedConversationId || !content) return;

    if (sendButton) sendButton.disabled = true;

    try {
        const response = await apiFetch(`/api/social/conversations/${socialState.selectedConversationId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content })
        });

        const message = await parseSocialResponse(response);
        socialState.messages.push(message);
        if (messageInput) messageInput.value = "";
        renderSocialMessages();
        await refreshSocialSidebar();
    } catch (error) {
        console.error("Erro ao enviar mensagem social:", error);
        notifySocial(error.message, {
            title: "Falha ao enviar",
            iconClass: "fa-solid fa-triangle-exclamation",
            iconWrapperClass: "bg-red-100 text-red-500"
        });
    } finally {
        if (sendButton) sendButton.disabled = !socialState.selectedConversationId;
    }
}

function initSocial() {
    if (socialState.initialized) return;

    const {
        addFriendButton,
        addFriendModal,
        addFriendForm,
        addFriendCloseButton,
        addFriendCancelButton,
        messageForm
    } = getSocialElements();

    addFriendButton?.addEventListener("click", openSocialAddFriendModal);
    addFriendForm?.addEventListener("submit", addSocialFriend);
    addFriendCloseButton?.addEventListener("click", closeSocialAddFriendModal);
    addFriendCancelButton?.addEventListener("click", closeSocialAddFriendModal);
    addFriendModal?.addEventListener("click", (event) => {
        if (event.target === addFriendModal) {
            closeSocialAddFriendModal();
        }
    });
    document.addEventListener("keydown", (event) => {
        const { addFriendModal } = getSocialElements();
        if (event.key === "Escape" && addFriendModal && !addFriendModal.classList.contains("hidden")) {
            closeSocialAddFriendModal();
        }
    });
    messageForm?.addEventListener("submit", sendSocialMessage);
    socialState.initialized = true;
}

window.loadSocial = loadSocial;

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSocial);
} else {
    initSocial();
}
