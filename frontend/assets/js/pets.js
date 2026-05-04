function showPetToast(message, options = {}) {
    const {
        title = "Cadastro concluido",
        iconClass = "fa-solid fa-paw",
        iconWrapperClass = "bg-gradient-to-br from-brand-orange to-brand-purple text-white"
    } = options;

    const existingToast = document.getElementById("petSuccessToast");
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement("div");
    toast.id = "petSuccessToast";
    toast.className = "fixed right-5 top-5 z-[100] max-w-sm rounded-2xl bg-white px-4 py-3 text-sm text-gray-700 shadow-2xl ring-1 ring-brand-purple/10 transition-all duration-300";
    toast.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full ${iconWrapperClass}">
                <i class="${iconClass}"></i>
            </div>
            <div class="flex-1">
                <p class="font-bold text-gray-800">${title}</p>
                <p class="text-gray-500">${message}</p>
            </div>
        </div>
    `;

    document.body.appendChild(toast);

    window.setTimeout(() => {
        toast.classList.add("opacity-0", "translate-y-[-8px]");
        window.setTimeout(() => toast.remove(), 250);
    }, 2600);
}

function showPetConfirm(message, options = {}) {
    const {
        title = "Confirmar acao",
        confirmLabel = "Confirmar",
        cancelLabel = "Cancelar",
        iconClass = "fa-solid fa-triangle-exclamation"
    } = options;

    const existingModal = document.getElementById("petConfirmModal");
    if (existingModal) {
        existingModal.remove();
    }

    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.id = "petConfirmModal";
        overlay.className = "fixed inset-0 z-[110] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm";
        overlay.innerHTML = `
            <div class="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl">
                <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-orange to-brand-purple text-white shadow-lg">
                    <i class="${iconClass}"></i>
                </div>
                <h3 class="font-heading text-xl font-bold text-gray-800">${title}</h3>
                <p class="mt-2 text-sm leading-relaxed text-gray-500">${message}</p>
                <div class="mt-6 flex gap-3">
                    <button type="button" data-action="cancel" class="flex-1 rounded-xl bg-gray-100 px-4 py-3 font-bold text-gray-600 transition hover:bg-gray-200">
                        ${cancelLabel}
                    </button>
                    <button type="button" data-action="confirm" class="flex-1 rounded-xl bg-gradient-to-r from-brand-orange to-brand-purple px-4 py-3 font-bold text-white shadow-lg transition hover:scale-[1.02]">
                        ${confirmLabel}
                    </button>
                </div>
            </div>
        `;

        const cleanup = (result) => {
            overlay.remove();
            resolve(result);
        };

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                cleanup(false);
            }
        });

        const cancelButton = overlay.querySelector('[data-action="cancel"]');
        const confirmButton = overlay.querySelector('[data-action="confirm"]');

        cancelButton.addEventListener("click", () => cleanup(false));
        confirmButton.addEventListener("click", () => cleanup(true));

        document.body.appendChild(overlay);
    });
}

async function salvarPet() {
    const nome = document.getElementById("petNameInput").value;
    const raca = document.getElementById("petBreedInput").value;
    const aniversario = document.getElementById("petDateInput").value;
    const fotoInput = document.getElementById("petPhotoInput");
    const foto = fotoInput?.files?.[0];
    const signo = aniversario ? getZodiacSignByDate(aniversario).name : "";
    const idade = aniversario ? getAgeInYears(aniversario) : "";

    if (!nome || !raca) {
        showPetToast("Preencha nome e raca antes de continuar.", {
            title: "Campos obrigatorios",
            iconClass: "fa-solid fa-circle-exclamation",
            iconWrapperClass: "bg-red-100 text-red-500"
        });
        return;
    }

    if (!foto) {
        showPetToast("E obrigatorio colocar a foto do pet.", {
            title: "Foto obrigatoria",
            iconClass: "fa-solid fa-camera",
            iconWrapperClass: "bg-red-100 text-red-500"
        });
        return;
    }

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("raca", raca);
    formData.append("idade", idade);
    formData.append("aniversario", aniversario);
    formData.append("signo", signo);

    if (foto) {
        formData.append("foto", foto);
    }

    try {
        const response = await apiFetch("/api/pets/add", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }

        await response.json();
        showPetToast("Pet cadastrado com sucesso.");
        nav("dashboard");
        loadPets();
    } catch (error) {
        console.error("Erro ao salvar pet:", error);
        showPetToast("Nao foi possivel cadastrar o pet.", {
            title: "Erro no cadastro",
            iconClass: "fa-solid fa-triangle-exclamation",
            iconWrapperClass: "bg-red-100 text-red-500"
        });
    }
}

function updatePetPreview() {
    const nome = document.getElementById("petNameInput").value;
    const raca = document.getElementById("petBreedInput").value;
    const idade = document.getElementById("petAgeInput").value;

    document.getElementById("previewName").innerText = nome || "Nome do Pet";
    document.getElementById("previewBreed").innerText = raca || "SRD";
    document.getElementById("previewAge").innerText = idade || "...";
}

function updateZodiac() {
    const date = document.getElementById("petDateInput").value;
    if (!date) return;

    const signo = getZodiacSignByDate(date);
    document.getElementById("zodiacName").textContent = signo.name;
    document.getElementById("zodiacIcon").textContent = signo.icon;
}

function formatBirthday(date) {
    if (!date) return "-";

    const d = new Date(date);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");

    return `${day}/${month}`;
}

const petPhotoInput = document.getElementById("petPhotoInput");
if (petPhotoInput) {
    petPhotoInput.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.querySelector("#pet-register .w-28.h-28");
            if (preview) {
                preview.style.backgroundImage = `url('${e.target.result}')`;
            }
        };
        reader.readAsDataURL(file);
    });
}

window.showPetConfirm = showPetConfirm;

const petDateInput = document.getElementById("petDateInput");
if (petDateInput) {
    petDateInput.addEventListener("change", function () {
        const nasc = new Date(this.value);
        const hoje = new Date();

        if (isNaN(nasc)) return;

        let anos = hoje.getFullYear() - nasc.getFullYear();
        let meses = hoje.getMonth() - nasc.getMonth();

        if (meses < 0 || (meses === 0 && hoje.getDate() < nasc.getDate())) {
            anos--;
            meses += 12;
        }

        const idadeStr =
            anos < 1
                ? `${meses} meses`
                : meses === 0
                ? `${anos} anos`
                : `${anos} anos e ${meses} meses`;

        document.getElementById("petAgeInput").value = idadeStr;
        document.getElementById("previewAge").innerText = idadeStr;
        updateZodiac();
    });
}
