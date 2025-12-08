// ======================
//  SALVAR PET NO BACKEND
// ======================
async function salvarPet() {
    const nome = document.getElementById("petNameInput").value;
    const raca = document.getElementById("petBreedInput").value;
    const idade = document.getElementById("petAgeInput").value;
    const aniversario = document.getElementById("petDateInput").value;
    const foto = document.getElementById("petPhotoInput").files[0];

    if (!nome || !raca) {
        alert("Preencha nome e raça!");
        return;
    }

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("raca", raca);
    formData.append("idade", idade);
    formData.append("aniversario", aniversario);

    // forçar id_usuario enquanto não há login
    formData.append("id_usuario", 1);

    if (foto) {
        formData.append("foto", foto);
    }

    try {
        const response = await fetch("http://localhost:3000/api/pets/add", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        console.log("Pet cadastrado:", data);

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
    document.getElementById("previewBreed").innerText = raca || "Raça";
    document.getElementById("previewAge").innerText = idade || "...";
}
document.getElementById("petPhotoInput").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const preview = document.querySelector(
            "#pet-register .w-28.h-28"
        );
        preview.style.backgroundImage = `url('${e.target.result}')`;
    };
    reader.readAsDataURL(file);
});
document.getElementById("petDateInput").addEventListener("change", function () {
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

    // Atualiza campo de idade (somente visual)
    document.getElementById("petAgeInput").value = idadeStr;

    // Atualiza preview
    document.getElementById("previewAge").innerText = idadeStr;

    // Atualiza signo
    updateZodiac();
});

function updateZodiac() {
    const date = document.getElementById("petDateInput").value;
    if (!date) return;

    const [year, month, day] = date.split("-");
    const d = parseInt(day);
    const m = parseInt(month);

    const signos = [
        { nome: "Capricórnio", simbolo: "♑", inicio: [12, 22], fim: [1, 19] },
        { nome: "Aquário", simbolo: "♒", inicio: [1, 20], fim: [2, 18] },
        { nome: "Peixes", simbolo: "♓", inicio: [2, 19], fim: [3, 20] },
        { nome: "Áries", simbolo: "♈", inicio: [3, 21], fim: [4, 19] },
        { nome: "Touro", simbolo: "♉", inicio: [4, 20], fim: [5, 20] },
        { nome: "Gêmeos", simbolo: "♊", inicio: [5, 21], fim: [6, 20] },
        { nome: "Câncer", simbolo: "♋", inicio: [6, 21], fim: [7, 22] },
        { nome: "Leão", simbolo: "♌", inicio: [7, 23], fim: [8, 22] },
        { nome: "Virgem", simbolo: "♍", inicio: [8, 23], fim: [9, 22] },
        { nome: "Libra", simbolo: "♎", inicio: [9, 23], fim: [10, 22] },
        { nome: "Escorpião", simbolo: "♏", inicio: [10, 23], fim: [11, 21] },
        { nome: "Sagitário", simbolo: "♐", inicio: [11, 22], fim: [12, 21] }
    ];

    const signo = signos.find(s => {
        const [im, id] = s.inicio;
        const [fm, fd] = s.fim;

        if (m === im && d >= id) return true;
        if (m === fm && d <= fd) return true;
        return false;
    });

    if (signo) {
        document.getElementById("zodiacName").textContent = signo.nome;
        document.getElementById("zodiacIcon").textContent = signo.simbolo;
    }
}
function formatBirthday(date) {
    if (!date) return "—";

    const d = new Date(date);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");

    return `${day}/${month}`;
}

