console.log("lembretes.js carregado!");

const API_LEMBRETES = buildApiUrl("/api/lembretes");
const listaLembretes = document.getElementById("listaLembretes");
const dashboardPlaceholder = document.getElementById("dashboardNextReminder");

let lembreteEditando = null;

async function fetchLembretes() {
    try {
        const res = await fetch(API_LEMBRETES);
        if (!res.ok) throw new Error("Erro ao buscar lembretes: " + res.status);
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
}

async function carregarLembretesPagina() {
    const lembretes = await fetchLembretes();
    if (!listaLembretes) return;

    listaLembretes.innerHTML = "";

    lembretes.forEach((item) => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-3xl p-1 shadow-sm flex items-center justify-between mb-4";

        card.innerHTML = `
            <div class="bg-white p-4 rounded-2xl shadow-sm border-l-4 ${item.tipo === "vacina" ? "border-red-500 hover:bg-red-50" : "border-green-500 hover:bg-green-50"} flex justify-between items-center group transition w-full">
                <div class="flex gap-4 items-center">
                    <div class="${item.tipo === "vacina" ? "bg-red-100 text-red-500" : "bg-green-100 text-green-500"} w-12 h-12 rounded-full flex items-center justify-center">
                        <i class="${item.tipo === "vacina" ? "fa-solid fa-syringe" : "fa-solid fa-bowl-food"}"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-800">${escapeHTML(item.titulo)}</h4>
                        <p class="text-xs text-gray-500">
                            ${formatarDataRelativo(item.data_hora)} • ${escapeHTML(item.local_evento || "")}
                        </p>
                    </div>
                </div>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button type="button" class="btn-editar-lembrete text-blue-500 p-2" aria-label="Editar lembrete">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button type="button" class="btn-excluir-lembrete text-red-500 p-2" aria-label="Excluir lembrete">
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
    if (!confirm("Tem certeza que deseja excluir?")) return;

    await fetch(`${API_LEMBRETES}/${id}`, {
        method: "DELETE"
    });

    carregarLembretesPagina();
    atualizarDashboardNextReminder();
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
        alert("Preencha titulo, tipo e data!");
        return;
    }

    try {
        await fetch(`${API_LEMBRETES}/${lembreteEditando.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(atualizado)
        });

        fecharModalEditarLembrete();
        carregarLembretesPagina();
        atualizarDashboardNextReminder();
    } catch (err) {
        console.error(err);
        alert("Erro ao atualizar lembrete");
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
        alert("Preencha titulo, tipo e data!");
        return;
    }

    await fetch(API_LEMBRETES, {
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

    fecharModalCriarLembrete();
    carregarLembretesPagina();
    atualizarDashboardNextReminder();
}

window.carregarLembretesPagina = carregarLembretesPagina;
window.atualizarDashboardNextReminder = atualizarDashboardNextReminder;
window.abrirModalEditarLembrete = abrirModalEditarLembrete;
window.fecharModalEditarLembrete = fecharModalEditarLembrete;
window.salvarEdicaoLembrete = salvarEdicaoLembrete;
window.abrirModalCriarLembrete = abrirModalCriarLembrete;
window.fecharModalCriarLembrete = fecharModalCriarLembrete;
window.salvarLembrete = salvarLembrete;

document.addEventListener("DOMContentLoaded", () => {
    if (dashboardPlaceholder) {
        atualizarDashboardNextReminder();
    }

    const paginaLembretes = document.getElementById("reminders");
    if (paginaLembretes && !paginaLembretes.classList.contains("hidden")) {
        carregarLembretesPagina();
    }
});
