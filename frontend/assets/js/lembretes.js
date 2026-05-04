console.log("lembretes.js carregado!");

const API_LEMBRETES = buildApiUrl("/api/lembretes");
const listaLembretes = document.getElementById("listaLembretes");
const dashboardPlaceholder = document.getElementById("dashboardNextReminder");
const reminderBellButton = document.getElementById("reminderBellButton");
const reminderBellBadge = document.getElementById("reminderBellBadge");
const remindersTotalCount = document.getElementById("remindersTotalCount");
const remindersTodayCount = document.getElementById("remindersTodayCount");
const remindersUpcomingCount = document.getElementById("remindersUpcomingCount");

let lembreteEditando = null;
let reminderNotifications = [];
let reminderNotificationsPanel = null;

async function fetchLembretes() {
    try {
        const res = await apiFetch("/api/lembretes");
        if (!res.ok) throw new Error("Erro ao buscar lembretes: " + res.status);
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

function getReminderNotificationItems(lembretes) {
    const hoje = new Date();
    const hojeBase = new Date(hoje.toDateString());

    return lembretes
        .map((item) => {
            const data = new Date(item.data_hora);
            const diff = Math.ceil((data - hojeBase) / (1000 * 60 * 60 * 24));

            return {
                ...item,
                diff
            };
        })
        .filter((item) => item.diff >= 0 && item.diff <= 1)
        .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
}

function ensureReminderNotificationsPanel() {
    if (reminderNotificationsPanel || !reminderBellButton) return reminderNotificationsPanel;

    reminderNotificationsPanel = document.createElement("div");
    reminderNotificationsPanel.id = "reminderNotificationsPanel";
    reminderNotificationsPanel.className = "hidden absolute right-0 top-14 z-40 w-[320px] rounded-[24px] border border-gray-100 bg-white p-3 shadow-2xl";
    reminderNotificationsPanel.innerHTML = `
        <div class="mb-2 flex items-center justify-between px-2 pt-1">
            <h3 class="font-heading text-sm font-bold text-gray-800">Notificacoes</h3>
            <button type="button" data-close-notifications class="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <div id="reminderNotificationsContent" class="max-h-80 overflow-y-auto"></div>
    `;

    const headerActions = reminderBellButton.parentElement;
    if (headerActions) {
        headerActions.classList.add("relative");
        headerActions.appendChild(reminderNotificationsPanel);
    }

    reminderNotificationsPanel
        .querySelector("[data-close-notifications]")
        .addEventListener("click", () => reminderNotificationsPanel.classList.add("hidden"));

    return reminderNotificationsPanel;
}

function renderReminderNotificationsPanel() {
    const panel = ensureReminderNotificationsPanel();
    if (!panel) return;

    const content = panel.querySelector("#reminderNotificationsContent");
    if (!content) return;

    if (!reminderNotifications.length) {
        content.innerHTML = `
            <div class="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-500">
                Nenhum lembrete proximo no momento.
            </div>
        `;
        return;
    }

    content.innerHTML = reminderNotifications
        .map((item) => {
            const isHoje = item.diff === 0;
            const iconClass = item.tipo === "vacina" ? "fa-solid fa-syringe" : "fa-solid fa-bag-shopping";
            const iconColors = item.tipo === "vacina"
                ? "bg-red-100 text-red-500"
                : "bg-green-100 text-green-500";
            const urgencyText = isHoje ? "Para hoje" : "Para amanha";

            return `
                <button
                    type="button"
                    data-reminder-notification
                    class="mb-2 flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-gray-50"
                >
                    <div class="${iconColors} mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center justify-between gap-3">
                            <p class="font-bold text-gray-800">${escapeHTML(item.titulo)}</p>
                            <span class="rounded-full bg-orange-100 px-2 py-1 text-[10px] font-bold uppercase text-brand-orange">
                                ${urgencyText}
                            </span>
                        </div>
                        <p class="mt-1 text-xs text-gray-500">
                            ${formatarData(item.data_hora)}${item.local_evento ? ` - ${escapeHTML(item.local_evento)}` : ""}
                        </p>
                    </div>
                </button>
            `;
        })
        .join("");

    content.querySelectorAll("[data-reminder-notification]").forEach((button) => {
        button.addEventListener("click", () => {
            panel.classList.add("hidden");
            nav("reminders");
            setTimeout(() => carregarLembretesPagina(), 30);
        });
    });
}

function updateReminderNotifications(lembretes) {
    reminderNotifications = getReminderNotificationItems(lembretes);

    if (reminderBellBadge) {
        reminderBellBadge.classList.toggle("hidden", reminderNotifications.length === 0);
    }

    renderReminderNotificationsPanel();
}

async function refreshReminderNotifications() {
    const lembretes = await fetchLembretes();
    updateReminderNotifications(lembretes);
    return lembretes;
}

function toggleReminderNotificationsPanel() {
    const panel = ensureReminderNotificationsPanel();
    if (!panel) return;

    const willOpen = panel.classList.contains("hidden");
    panel.classList.toggle("hidden");

    if (willOpen) {
        refreshReminderNotifications();
    }
}

function getReminderTypeMeta(tipo) {
    if (tipo === "vacina") {
        return {
            label: "Vacina",
            iconClass: "fa-solid fa-syringe",
            badgeClass: "bg-[#fff1f0] text-[#c65b52]",
            iconWrapperClass: "bg-[#ffe4e1] text-[#d25b52]"
        };
    }

    return {
        label: "Compra",
        iconClass: "fa-solid fa-bag-shopping",
        badgeClass: "bg-[#eefbf6] text-[#2e8b62]",
        iconWrapperClass: "bg-[#dcf7eb] text-[#24885e]"
    };
}

function updateReminderSummary(lembretes) {
    const hoje = new Date();
    const hojeBase = new Date(hoje.toDateString());
    const amanhaBase = new Date(hojeBase.getTime() + 24 * 60 * 60 * 1000);

    const total = lembretes.length;
    const todayCount = lembretes.filter((item) => {
        const data = new Date(item.data_hora);
        return data >= hojeBase && data < amanhaBase;
    }).length;
    const upcomingCount = lembretes.filter((item) => new Date(item.data_hora) >= amanhaBase).length;

    if (remindersTotalCount) remindersTotalCount.textContent = String(total);
    if (remindersTodayCount) remindersTodayCount.textContent = String(todayCount);
    if (remindersUpcomingCount) remindersUpcomingCount.textContent = String(upcomingCount);
}

async function carregarLembretesPagina() {
    const lembretes = await fetchLembretes();
    if (!listaLembretes) return;

    updateReminderSummary(lembretes);
    listaLembretes.innerHTML = "";

    if (!lembretes.length) {
        listaLembretes.innerHTML = `
            <div class="dashboard-card rounded-[30px] p-8 text-center">
                <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#fff1e2] text-2xl text-[var(--pet-coral)]">
                    <i class="fa-regular fa-bell"></i>
                </div>
                <h3 class="mt-4 font-heading text-2xl font-bold text-[var(--pet-ink)]">Nenhum lembrete cadastrado</h3>
                <p class="mt-2 text-sm text-[var(--pet-brown)]">
                    Crie seu primeiro lembrete para acompanhar vacinas, compras e compromissos importantes.
                </p>
                <button type="button" onclick="abrirModalCriarLembrete()" class="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[var(--pet-coral)] px-5 py-3 font-bold text-white shadow-lg transition hover:scale-[1.02]">
                    <i class="fa-solid fa-plus"></i> Novo lembrete
                </button>
            </div>
        `;
        return;
    }

    lembretes.forEach((item) => {
        const meta = getReminderTypeMeta(item.tipo);
        const card = document.createElement("div");
        card.className = "dashboard-card rounded-[30px] p-5";

        card.innerHTML = `
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div class="flex items-start gap-4">
                    <div class="${meta.iconWrapperClass} flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                        <i class="${meta.iconClass}"></i>
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${meta.badgeClass}">
                                ${meta.label}
                            </span>
                            <span class="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9c7a63]">
                                ${formatarDataRelativo(item.data_hora)}
                            </span>
                        </div>
                        <h4 class="mt-3 font-heading text-xl font-bold text-[var(--pet-ink)]">${escapeHTML(item.titulo)}</h4>
                        <div class="mt-2 grid gap-2 text-sm text-[var(--pet-brown)] sm:grid-cols-2">
                            <p class="rounded-2xl bg-[#fff8ef] px-3 py-2">
                                <i class="fa-regular fa-clock mr-2 text-[var(--pet-coral)]"></i>${formatarData(item.data_hora)}
                            </p>
                            <p class="rounded-2xl bg-[#fff8ef] px-3 py-2">
                                <i class="fa-solid fa-location-dot mr-2 text-[var(--pet-coral)]"></i>${escapeHTML(item.local_evento || "Sem local definido")}
                            </p>
                        </div>
                        ${item.descricao ? `<p class="mt-3 text-sm leading-relaxed text-[var(--pet-brown)]">${escapeHTML(item.descricao)}</p>` : ""}
                    </div>
                </div>
                <div class="flex gap-2 md:self-start">
                    <button type="button" class="btn-editar-lembrete flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f0ff] text-brand-purple transition hover:bg-brand-purple hover:text-white" aria-label="Editar lembrete">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" class="btn-excluir-lembrete flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1f0] text-[#d25b52] transition hover:bg-[#d25b52] hover:text-white" aria-label="Excluir lembrete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        card.querySelector(".btn-editar-lembrete").addEventListener("click", () => {
            abrirModalEditarLembrete(item);
        });

        card.querySelector(".btn-excluir-lembrete").addEventListener("click", () => {
            deletarLembrete(item.id);
        });

        listaLembretes.appendChild(card);
    });
}

async function atualizarDashboardNextReminder() {
    if (!dashboardPlaceholder) return;

    const lembretes = await fetchLembretes();
    updateReminderNotifications(lembretes);
    dashboardPlaceholder.innerHTML = "";

    const primeiro = lembretes.length ? lembretes[0] : null;

    if (!primeiro) {
        dashboardPlaceholder.innerHTML = `
            <div class="bg-white rounded-3xl p-4 shadow-soft">
                <div class="p-6 rounded-[20px] border border-gray-100 text-gray-500">
                    Nenhum lembrete agendado.
                </div>
            </div>
        `;
        return;
    }

    const cor = primeiro.tipo === "comprar" ? "#22C55E" : "#EF4444";
    const bgGradient = primeiro.tipo === "comprar" ? "from-green-50 to-white" : "from-red-50 to-white";
    const borderColor = primeiro.tipo === "comprar" ? "border-green-100" : "border-red-100";
    const iconClass = primeiro.tipo === "comprar" ? "fa-solid fa-bag-shopping" : "fa-solid fa-syringe";
    const pillClass = primeiro.tipo === "comprar" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500";

    dashboardPlaceholder.innerHTML = `
        <div class="bg-white rounded-3xl p-1 shadow-soft cursor-pointer transition duration-300" onclick="nav('reminders')">
            <div class="bg-gradient-to-r ${bgGradient} p-6 rounded-[20px] border ${borderColor} flex justify-between items-center">
                <div>
                    <span class="inline-block px-3 py-1 ${pillClass} rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                        ${primeiro.tipo === "vacina" ? "Urgente" : "Lembrete"}
                    </span>
                    <h3 class="font-heading font-bold text-gray-800 text-xl">${escapeHTML(primeiro.titulo)}</h3>
                    <p class="text-sm text-gray-500 mt-1">
                        Vence em <span class="text-red-500 font-bold">${diasAte(primeiro.data_hora)}</span> • (${formatarData(primeiro.data_hora)})
                    </p>
                </div>
                <div class="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-lg"
                    style="background:${cor}; box-shadow: 0 4px 12px ${cor}33">
                    <i class="${iconClass}"></i>
                </div>
            </div>
        </div>
    `;
}

function formatarData(dtString) {
    const d = new Date(dtString);
    return d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatarDataRelativo(dtString) {
    const d = new Date(dtString);
    const hoje = new Date();
    const diff = Math.ceil((d - new Date(hoje.toDateString())) / (1000 * 60 * 60 * 24));

    if (diff === 0) return "Hoje";
    if (diff === 1) return "Amanha";

    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function diasAte(dtString) {
    const d = new Date(dtString);
    const hoje = new Date();
    const diff = Math.ceil((d - new Date(hoje.toDateString())) / (1000 * 60 * 60 * 24));

    if (diff <= 0) return "hoje";
    if (diff === 1) return "1 dia";
    return `${diff} dias`;
}

function escapeHTML(s) {
    if (!s) return "";
    return String(s).replace(/[&<>"'`]/g, (c) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "`": "&#96;"
    }[c]));
}

async function deletarLembrete(id) {
    const confirmed = await showPetConfirm("Tem certeza que deseja excluir o lembrete?", {
        title: "Excluir lembrete",
        confirmLabel: "Excluir",
        cancelLabel: "Manter",
        iconClass: "fa-solid fa-trash"
    });
    if (!confirmed) return;

    await apiFetch(`/api/lembretes/${id}`, {
        method: "DELETE"
    });

    carregarLembretesPagina();
    atualizarDashboardNextReminder();
    refreshReminderNotifications();
    showPetToast("Lembrete excluido com sucesso.", {
        title: "Lembrete removido",
        iconClass: "fa-solid fa-trash"
    });
}

function abrirModalEditarLembrete(item) {
    lembreteEditando = item;

    document.getElementById("editTitulo").value = item.titulo;
    document.getElementById("editTipo").value = item.tipo;
    document.getElementById("editData").value = item.data_hora?.slice(0, 16);
    document.getElementById("editLocal").value = item.local_evento || "";
    document.getElementById("editDesc").value = item.descricao || "";

    document.getElementById("modalEditarLembrete").classList.remove("hidden");
}

function fecharModalEditarLembrete() {
    document.getElementById("modalEditarLembrete").classList.add("hidden");
}

async function salvarEdicaoLembrete() {
    if (!lembreteEditando) return;

    const atualizado = {
        titulo: document.getElementById("editTitulo").value.trim(),
        tipo: document.getElementById("editTipo").value,
        dataHora: document.getElementById("editData").value,
        localEvento: document.getElementById("editLocal").value.trim(),
        descricao: document.getElementById("editDesc").value.trim()
    };

    if (!atualizado.titulo || !atualizado.tipo || !atualizado.dataHora) {
        showPetToast("Preencha titulo, tipo e data antes de salvar.", {
            title: "Campos obrigatorios",
            iconClass: "fa-solid fa-circle-exclamation",
            iconWrapperClass: "bg-red-100 text-red-500"
        });
        return;
    }

    try {
        await apiFetch(`/api/lembretes/${lembreteEditando.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(atualizado)
        });

        fecharModalEditarLembrete();
        carregarLembretesPagina();
        atualizarDashboardNextReminder();
        refreshReminderNotifications();
    } catch (err) {
        console.error(err);
        showPetToast("Nao foi possivel atualizar o lembrete.", {
            title: "Erro na edicao",
            iconClass: "fa-solid fa-triangle-exclamation",
            iconWrapperClass: "bg-red-100 text-red-500"
        });
    }
}

function abrirModalCriarLembrete() {
    document.getElementById("modalCriarLembrete").classList.remove("hidden");
}

function fecharModalCriarLembrete() {
    document.getElementById("modalCriarLembrete").classList.add("hidden");
}

async function salvarLembrete() {
    const titulo = document.getElementById("tituloLembrete").value.trim();
    const tipo = document.getElementById("tipoLembrete").value;
    const dataHora = document.getElementById("dataHoraLembrete").value;
    const localEvento = document.getElementById("localLembrete").value.trim();
    const descricao = document.getElementById("descricaoLembrete").value.trim();

    if (!titulo || !tipo || !dataHora) {
        showPetToast("Preencha titulo, tipo e data antes de cadastrar.", {
            title: "Campos obrigatorios",
            iconClass: "fa-solid fa-circle-exclamation",
            iconWrapperClass: "bg-red-100 text-red-500"
        });
        return;
    }

    try {
        const response = await apiFetch("/api/lembretes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                titulo,
                tipo,
                dataHora,
                localEvento,
                descricao
            })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }

        fecharModalCriarLembrete();
        carregarLembretesPagina();
        atualizarDashboardNextReminder();
        refreshReminderNotifications();
        showPetToast("Lembrete cadastrado com sucesso.", {
            title: "Lembrete criado",
            iconClass: "fa-solid fa-bell"
        });
    } catch (err) {
        console.error(err);
        showPetToast("Nao foi possivel cadastrar o lembrete.", {
            title: "Erro no cadastro",
            iconClass: "fa-solid fa-triangle-exclamation",
            iconWrapperClass: "bg-red-100 text-red-500"
        });
    }
}

window.carregarLembretesPagina = carregarLembretesPagina;
window.atualizarDashboardNextReminder = atualizarDashboardNextReminder;
window.abrirModalEditarLembrete = abrirModalEditarLembrete;
window.fecharModalEditarLembrete = fecharModalEditarLembrete;
window.salvarEdicaoLembrete = salvarEdicaoLembrete;
window.abrirModalCriarLembrete = abrirModalCriarLembrete;
window.fecharModalCriarLembrete = fecharModalCriarLembrete;
window.salvarLembrete = salvarLembrete;

if (reminderBellButton) {
    reminderBellButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleReminderNotificationsPanel();
    });
}

document.addEventListener("click", (event) => {
    if (!reminderNotificationsPanel || reminderNotificationsPanel.classList.contains("hidden")) return;
    if (reminderNotificationsPanel.contains(event.target) || reminderBellButton?.contains(event.target)) return;
    reminderNotificationsPanel.classList.add("hidden");
});

document.addEventListener("DOMContentLoaded", () => {
    if (dashboardPlaceholder) {
        atualizarDashboardNextReminder();
    }

    refreshReminderNotifications();

    const paginaLembretes = document.getElementById("reminders");
    if (paginaLembretes && !paginaLembretes.classList.contains("hidden")) {
        carregarLembretesPagina();
    }
});
