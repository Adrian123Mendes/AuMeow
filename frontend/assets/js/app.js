const originalNav = nav;
const AI_VISIBLE_SCREENS = new Set(["dashboard", "reminders", "adoption", "pet-register"]);

function updateAiChatVisibility(screenId) {
    const chatToggle = document.getElementById("ai-chat-toggle");
    const chatWindow = document.getElementById("ai-chat-window");
    const shouldShow = AI_VISIBLE_SCREENS.has(screenId);

    if (chatToggle) {
        chatToggle.classList.toggle("hidden", !shouldShow);
        chatToggle.classList.toggle("flex", shouldShow);
    }

    if (!shouldShow && chatWindow) {
        chatWindow.classList.add("hidden", "scale-95");
    }
}

nav = function (screenId) {
    originalNav(screenId);
    updateAiChatVisibility(screenId);

    if (screenId === "dashboard") {
        loadPets();

        if (typeof atualizarDashboardNextReminder === "function") {
            setTimeout(() => atualizarDashboardNextReminder(), 30);
        }
    }

    if (screenId === "reminders") {
        if (typeof carregarLembretesPagina === "function") {
            setTimeout(() => carregarLembretesPagina(), 30);
        }
    }
};

async function loadPets() {
    try {
        const response = await apiFetch("/api/pets");
        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }

        const pets = await response.json();
        const container = document.querySelector("#dashboardPetsList");
        if (!container) return;

        container.innerHTML = "";

        pets.forEach((pet) => {
            const zodiac = pet.signo ? { name: pet.signo } : getZodiacSignByDate(pet.aniversario);
            const zodiacVisual = getZodiacPresentation(zodiac.name);
            const imageUrl = pet.foto ? buildApiUrl(`/uploads/pets/${pet.foto}`) : "";

            const card = document.createElement("div");
            card.classList.add(
                "flip-card",
                "min-w-[160px]",
                "rounded-[28px]",
                "text-center",
                "cursor-pointer",
                "hover:scale-[1.03]",
                "transition-all"
            );

            card.innerHTML = `
<div class="w-full md:w-56">
    <div class="dashboard-card border border-[rgba(222,196,163,0.45)] p-3 rounded-[24px] text-center relative overflow-hidden transition-all duration-500 hover:shadow-xl">
        <button
            type="button"
            onclick="excluirPet(${pet.id}, event)"
            class="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--pet-card)] text-[#b95c36] shadow-sm ring-1 ring-orange-100 transition hover:bg-[var(--pet-coral)] hover:text-white"
            title="Excluir pet"
        >
            <i class="fa-solid fa-trash"></i>
        </button>
        <div class="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-[#ffe8d2] via-[#fff4e6] to-[#f3ebe4]"></div>
        <div class="w-20 h-20 mx-auto rounded-full border-4 border-white shadow-md relative z-10 bg-[var(--pet-card)] bg-cover bg-center"
             style="background-image: url('${imageUrl}');">
        </div>
        <h3 class="font-heading font-bold text-lg text-[var(--pet-ink)] mt-2">${pet.nome}</h3>
        <p class="text-[11px] text-[var(--pet-brown)] mb-3">
            ${pet.raca || "SRD"} - ${calculateAge(pet.aniversario)}
        </p>
        <div class="rounded-[18px] border border-orange-100 bg-[#fff6ec] p-2 flex items-center justify-center gap-2">
            <div class="w-7 h-7 bg-white rounded-full flex items-center justify-center text-[11px] shadow-sm ring-1 ring-orange-100 ${zodiacVisual.iconColorClass}">
                <i class="${zodiacVisual.iconClass}"></i>
            </div>
            <div class="text-left leading-tight">
                <span class="block text-[8px] text-[#9c7a63] font-bold uppercase tracking-[0.16em]">Signo</span>
                <span class="block text-[11px] font-bold text-[var(--pet-ink)]">
                    ${zodiac.name}
                </span>
            </div>
        </div>
    </div>
</div>
`;

            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar pets:", error);
    }
}

async function excluirPet(id, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const confirmed = await showPetConfirm("Deseja excluir este pet?", {
        title: "Excluir pet",
        confirmLabel: "Excluir",
        cancelLabel: "Manter",
        iconClass: "fa-solid fa-trash"
    });
    if (!confirmed) {
        return;
    }

    try {
        const response = await apiFetch(`/api/pets/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }

        await loadPets();
        showPetToast("Pet removido com sucesso.", {
            title: "Pet excluido",
            iconClass: "fa-solid fa-trash"
        });
    } catch (error) {
        console.error("Erro ao excluir pet:", error);
        showPetToast("Nao foi possivel excluir o pet.", {
            title: "Erro na exclusao",
            iconClass: "fa-solid fa-triangle-exclamation",
            iconWrapperClass: "bg-red-100 text-red-500"
        });
    }
}

window.excluirPet = excluirPet;

nav(isAuthenticated() ? "dashboard" : "login");
