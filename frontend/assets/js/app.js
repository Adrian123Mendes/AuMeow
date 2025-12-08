// =====================
// 1. Salvar função nav original
// =====================
const originalNav = nav;

// Sobrescreve nav para adicionar comportamentos extras
nav = function(screenId) {
    originalNav(screenId);

    // Se entrar no dashboard → atualizar pets + lembrete
    if (screenId === "dashboard") {
        loadPets();

        if (typeof atualizarDashboardNextReminder === "function") {
            setTimeout(() => atualizarDashboardNextReminder(), 30);
        }
    }

    // Se entrar na tela de lembretes → carregar lista
    if (screenId === "reminders") {
        if (typeof carregarLembretesPagina === "function") {
            setTimeout(() => carregarLembretesPagina(), 30);
        }
    }
};

// ======================
// 3. CARREGAR PETS DO BANCO
// ======================
async function loadPets() {
    try {
        const response = await fetch("http://localhost:3000/api/pets");
        const pets = await response.json();

        const container = document.querySelector("#dashboardPetsList");
        if (!container) return;

        container.innerHTML = "";

        pets.forEach(pet => {
            const card = document.createElement("div");
            card.classList.add(
                "flip-card",
                "min-w-[160px]",
                "bg-white",
                "p-4",
                "rounded-3xl",
                "shadow-md",
                "text-center",
                "border",
                "border-gray-200",
                "cursor-pointer",
                "hover:scale-[1.03]",
                "transition-all"
            );

            card.innerHTML = `
<div class="w-full md:w-56">
    <div class="bg-white p-3 rounded-[24px] shadow-glow text-center relative overflow-hidden transition-all duration-500">

        <!-- Topo com gradiente MENOR -->
        <div class="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-brand-orange/20 to-brand-purple/20"></div>

        <!-- FOTO MENOR -->
        <div class="w-20 h-20 mx-auto rounded-full border-4 border-white shadow-md relative z-10
             bg-cover bg-center"
             style="background-image: url('http://localhost:3000/uploads/pets/${pet.foto}');">
        </div>

        <!-- NOME MENOR -->
        <h3 class="font-heading font-bold text-lg text-gray-800 mt-2">${pet.nome}</h3>

        <!-- RAÇA + IDADE REDUZIDOS -->
        <p class="text-[11px] text-gray-500 mb-2">
            ${pet.raca || "SRD"} • ${calculateAge(pet.aniversario)}
        </p>

        <!-- SIGNO SUPER COMPACTO -->
        <div class="bg-indigo-50 rounded-xl p-2 flex items-center justify-center gap-2">
            <div class="w-7 h-7 bg-white rounded-full flex items-center justify-center text-base shadow-sm">
                ${getZodiacSign(pet.aniversario).icon}
            </div>
            <div class="text-left leading-tight">
                <span class="block text-[8px] text-gray-400 font-bold uppercase">Signo</span>
                <span class="block text-[11px] font-bold text-brand-purple">
                    ${getZodiacSign(pet.aniversario).name}
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

// =====================
// 4. Inicializar na tela de login
// =====================
nav('login');
