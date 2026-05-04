const API_BASE_URL = window.API_BASE_URL || "http://localhost:3000";
const AUTH_STORAGE_KEY = "aumeow-auth";

function buildApiUrl(path) {
    return `${API_BASE_URL}${path}`;
}

function getStoredAuth() {
    try {
        const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function getAuthToken() {
    return getStoredAuth()?.token || null;
}

function getAuthUser() {
    return getStoredAuth()?.usuario || null;
}

function isAuthenticated() {
    return Boolean(getAuthToken());
}

function setAuthSession(session) {
    if (!session?.token || !session?.usuario) {
        throw new Error("Sessao invalida.");
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        token: session.token,
        usuario: session.usuario
    }));
}

function clearAuthSession() {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

async function apiFetch(path, options = {}) {
    const token = getAuthToken();
    const headers = new Headers(options.headers || {});

    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(buildApiUrl(path), {
        ...options,
        headers
    });

    if (response.status === 401 && !path.startsWith("/api/auth/")) {
        clearAuthSession();
        if (typeof nav === "function") {
            nav("login");
        }
    }

    return response;
}

function getZodiacPresentation(signName) {
    const presentations = {
        Aquario: { iconClass: "fa-solid fa-water", iconColorClass: "text-sky-500" },
        Peixes: { iconClass: "fa-solid fa-fish", iconColorClass: "text-cyan-500" },
        Aries: { iconClass: "fa-solid fa-fire", iconColorClass: "text-red-500" },
        Touro: { iconClass: "fa-solid fa-shield-dog", iconColorClass: "text-amber-600" },
        Gemeos: { iconClass: "fa-solid fa-user-group", iconColorClass: "text-violet-500" },
        Cancer: { iconClass: "fa-solid fa-moon", iconColorClass: "text-blue-500" },
        Leao: { iconClass: "fa-solid fa-crown", iconColorClass: "text-yellow-500" },
        Virgem: { iconClass: "fa-solid fa-seedling", iconColorClass: "text-emerald-500" },
        Libra: { iconClass: "fa-solid fa-scale-balanced", iconColorClass: "text-indigo-500" },
        Escorpiao: { iconClass: "fa-solid fa-bolt", iconColorClass: "text-rose-500" },
        Sagitario: { iconClass: "fa-solid fa-location-arrow", iconColorClass: "text-orange-500" },
        Capricornio: { iconClass: "fa-solid fa-mountain", iconColorClass: "text-stone-500" }
    };

    return presentations[signName] || {
        iconClass: "fa-solid fa-star",
        iconColorClass: "text-brand-orange"
    };
}

function getAgeInYears(date) {
    if (!date) return null;

    const birth = new Date(date);
    if (Number.isNaN(birth.getTime())) return null;

    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        years--;
    }

    return Math.max(years, 0);
}

function getZodiacSignByDate(date) {
    if (!date) return { icon: "?", name: "--" };

    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return { icon: "?", name: "--" };

    const day = d.getUTCDate();
    const month = d.getUTCMonth() + 1;

    const signs = [
        { name: "Aquario", start: "01-20", end: "02-18" },
        { name: "Peixes", start: "02-19", end: "03-20" },
        { name: "Aries", start: "03-21", end: "04-19" },
        { name: "Touro", start: "04-20", end: "05-20" },
        { name: "Gemeos", start: "05-21", end: "06-20" },
        { name: "Cancer", start: "06-21", end: "07-22" },
        { name: "Leao", start: "07-23", end: "08-22" },
        { name: "Virgem", start: "08-23", end: "09-22" },
        { name: "Libra", start: "09-23", end: "10-22" },
        { name: "Escorpiao", start: "10-23", end: "11-21" },
        { name: "Sagitario", start: "11-22", end: "12-21" },
        { name: "Capricornio", start: "12-22", end: "01-19" }
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
    if (Number.isNaN(birth.getTime())) return "--";

    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
        years--;
        months += 12;
    }

    if (years <= 0) return `${Math.max(months, 0)} meses`;
    if (months === 0) return `${years} anos`;
    return `${years} anos e ${months} meses`;
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
window.apiFetch = apiFetch;
window.getAuthToken = getAuthToken;
window.getAuthUser = getAuthUser;
window.isAuthenticated = isAuthenticated;
window.setAuthSession = setAuthSession;
window.clearAuthSession = clearAuthSession;
window.getZodiacPresentation = getZodiacPresentation;
window.getAgeInYears = getAgeInYears;
window.getZodiacSignByDate = getZodiacSignByDate;
window.calculateAge = calculateAge;

document.addEventListener("DOMContentLoaded", atualizarCalendarioDashboard);
