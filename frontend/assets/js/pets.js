async function salvarPet() {
    const nome = document.getElementById("petNameInput").value;
    const raca = document.getElementById("petBreedInput").value;
    const idade = document.getElementById("petAgeInput").value;
    const aniversario = document.getElementById("petDateInput").value;
    const fotoInput = document.getElementById("petPhotoInput");
    const foto = fotoInput?.files?.[0];

    if (!nome || !raca) {
        alert("Preencha nome e raca!");
        return;
    }

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("raca", raca);
    formData.append("idade", idade);
    formData.append("aniversario", aniversario);
    formData.append("id_usuario", 1);

    if (foto) {
        formData.append("foto", foto);
    }

    try {
        const response = await fetch(buildApiUrl("/api/pets/add"), {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP ${response.status}`);
        }

        await response.json();
        alert("Pet cadastrado com sucesso!");
        nav("dashboard");
        loadPets();
    } catch (error) {
        console.error("Erro ao salvar pet:", error);
        alert("Erro ao cadastrar o pet.");
    }
}

function updatePetPreview() {
    const nome = document.getElementById("petNameInput").value;
    const raca = document.getElementById("petBreedInput").value;
    const idade = document.getElementById("petAgeInput").value;

    document.getElementById("previewName").innerText = nome || "Nome do Pet";
    document.getElementById("previewBreed").innerText = raca || "Raca";
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
