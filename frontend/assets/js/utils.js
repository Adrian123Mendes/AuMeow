const API_BASE_URL = window.API_BASE_URL || "http://localhost:3000";

function buildApiUrl(path) {
    return `${API_BASE_URL}${path}`;
}

function getZodiacSignByDate(date) {
    if (!date) return { icon: "?", name: "--" };

    const d = new Date(date);
    const day = d.getUTCDate();
    const month = d.getUTCMonth() + 1;

    const signs = [
        { name: "Aquario", icon: "â™’", start: "01-20", end: "02-18" },
        { name: "Peixes", icon: "â™“", start: "02-19", end: "03-20" },
        { name: "Aries", icon: "â™ˆ", start: "03-21", end: "04-19" },
        { name: "Touro", icon: "â™‰", start: "04-20", end: "05-20" },
        { name: "Gemeos", icon: "â™Š", start: "05-21", end: "06-20" },
        { name: "Cancer", icon: "â™‹", start: "06-21", end: "07-22" },
        { name: "Leao", icon: "â™Œ", start: "07-23", end: "08-22" },
        { name: "Virgem", icon: "â™", start: "08-23", end: "09-22" },
        { name: "Libra", icon: "â™Ž", start: "09-23", end: "10-22" },
        { name: "Escorpiao", icon: "â™", start: "10-23", end: "11-21" },
        { name: "Sagitario", icon: "â™", start: "11-22", end: "12-21" },
        { name: "Capricornio", icon: "â™‘", start: "12-22", end: "01-19" }
    ];

    const mmdd = String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");

    for (const sign of signs) {
        if (
            (mmdd >= sign.start && mmdd <= sign.end) ||
            (sign.start > sign.end && (mmdd >= sign.start || mmdd <= sign.end))
        ) {
            return sign;
        }
    }

    return { icon: "?", name: "--" };
}

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

function atualizarCalendarioDashboard() {
    const hoje = new Date();
    const dia = hoje.getDate();

    document.querySelectorAll(".calendario-dia").forEach((el) => {
        const numero = parseInt(el.dataset.dia, 10);
        if (numero === dia) {
            el.classList.add("bg-orange-500", "text-white", "rounded-xl");
            el.innerHTML = `
                <div class="text-[10px] font-bold">HOJE</div>
                <div class="text-lg font-bold">${dia}</div>
            `;
        }
    });
}

window.API_BASE_URL = API_BASE_URL;
window.buildApiUrl = buildApiUrl;
window.getZodiacSignByDate = getZodiacSignByDate;
window.calculateAge = calculateAge;

document.addEventListener("DOMContentLoaded", atualizarCalendarioDashboard);
