// --- Lógica de Cadastro de Pet (Preview + Signo) ---
function updatePetPreview() {
    const name = document.getElementById('petNameInput').value;
    const breed = document.getElementById('petBreedInput').value;
    const age = document.getElementById('petAgeInput').value;

    document.getElementById('previewName').innerText = name || 'Nome';
    document.getElementById('previewBreed').innerText = breed || 'Raça';
    document.getElementById('previewAge').innerText = age || 'Idade';
}

function updateZodiac() {
    const dateValue = document.getElementById('petDateInput').value;
    if (!dateValue) return;

    const date = new Date(dateValue);
    const day = date.getDate() + 1; // Ajuste simples de fuso
    const month = date.getMonth() + 1;

    const zodiac = getZodiacSign(day, month);
    document.getElementById('zodiacName').innerText = zodiac.name;
    document.getElementById('zodiacIcon').innerText = zodiac.icon;
}

// --- SIGNO (versão usada no cadastro) ---
function getZodiacSign(day, month) {
    if((month == 1 && day <= 20) || (month == 12 && day >=22)) return {name: "Capricórnio", icon: "♑"};
    if((month == 1 && day >= 21) || (month == 2 && day <= 18)) return {name: "Aquário", icon: "♒"};
    if((month == 2 && day >= 19) || (month == 3 && day <= 20)) return {name: "Peixes", icon: "♓"};
    if((month == 3 && day >= 21) || (month == 4 && day <= 20)) return {name: "Áries", icon: "♈"};
    if((month == 4 && day >= 21) || (month == 5 && day <= 20)) return {name: "Touro", icon: "♉"};
    if((month == 5 && day >= 21) || (month == 6 && day <= 20)) return {name: "Gêmeos", icon: "♊"};
    if((month == 6 && day >= 21) || (month == 7 && day <= 22)) return {name: "Câncer", icon: "♋"};
    if((month == 7 && day >= 23) || (month == 8 && day <= 22)) return {name: "Leão", icon: "♌"};
    if((month == 8 && day >= 23) || (month == 9 && day <= 22)) return {name: "Virgem", icon: "♍"};
    if((month == 9 && day >= 23) || (month == 10 && day <= 22)) return {name: "Libra", icon: "♎"};
    if((month == 10 && day >= 23) || (month == 11 && day <= 21)) return {name: "Escorpião", icon: "♏"};
    if((month == 11 && day >= 22) || (month == 12 && day <= 21)) return {name: "Sagitário", icon: "♐"};
    return {name: "--", icon: "❓"};
}

// --- SIGNO (versão usada no dashboard) ---
function getZodiacSign(date) {
    if (!date) return { icon: "❓", name: "--" };

    const d = new Date(date);
    const day = d.getUTCDate();
    const month = d.getUTCMonth() + 1;

    const signs = [
        { name: "Aquário",     icon: "♒", start: "01-20", end: "02-18" },
        { name: "Peixes",      icon: "♓", start: "02-19", end: "03-20" },
        { name: "Áries",       icon: "♈", start: "03-21", end: "04-19" },
        { name: "Touro",       icon: "♉", start: "04-20", end: "05-20" },
        { name: "Gêmeos",      icon: "♊", start: "05-21", end: "06-20" },
        { name: "Câncer",      icon: "♋", start: "06-21", end: "07-22" },
        { name: "Leão",        icon: "♌", start: "07-23", end: "08-22" },
        { name: "Virgem",      icon: "♍", start: "08-23", end: "09-22" },
        { name: "Libra",       icon: "♎", start: "09-23", end: "10-22" },
        { name: "Escorpião",   icon: "♏", start: "10-23", end: "11-21" },
        { name: "Sagitário",   icon: "♐", start: "11-22", end: "12-21" },
        { name: "Capricórnio", icon: "♑", start: "12-22", end: "01-19" }
    ];

    const mmdd = String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");

    for (const s of signs) {
        if (
            (mmdd >= s.start && mmdd <= s.end) ||
            (s.start > s.end && (mmdd >= s.start || mmdd <= s.end))
        ) {
            return s;
        }
    }

    return { icon: "❓", name: "--" };
}

// --- CÁLCULO DE IDADE ---
function calculateAge(date) {
    if (!date) return "--";

    const birth = new Date(date);
    const today = new Date();

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();

    if (months < 0) {
        years--;
        months += 12;
    }

    if (years <= 0) return `${months} meses`;
    return `${years} anos`;
}

// --- CALENDÁRIO DO DASHBOARD ---
function atualizarCalendarioDashboard() {
    const hoje = new Date();
    const dia = hoje.getDate();

    const elementosDia = document.querySelectorAll(".calendario-dia");

    elementosDia.forEach(el => {
        const numero = parseInt(el.dataset.dia);
        if (numero === dia) {
            el.classList.add("bg-orange-500", "text-white", "rounded-xl");
            el.innerHTML = `
                <div class="text-[10px] font-bold">HOJE</div>
                <div class="text-lg font-bold">${dia}</div>
            `;
        }
    });
}

document.addEventListener("DOMContentLoaded", atualizarCalendarioDashboard);
