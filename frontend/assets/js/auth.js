const PUBLIC_SCREENS = new Set(["login", "register"]);

function requiresAuthScreen(screenId) {
    return !PUBLIC_SCREENS.has(screenId);
}

function getLoginElements() {
    return {
        form: document.getElementById("loginForm"),
        email: document.getElementById("loginEmail"),
        senha: document.getElementById("loginSenha")
    };
}

function getRegisterElements() {
    return {
        form: document.getElementById("registerForm"),
        nome: document.getElementById("registerNome"),
        telefone: document.getElementById("registerTelefone"),
        email: document.getElementById("registerEmail"),
        emailConfirm: document.getElementById("registerEmailConfirm"),
        senha: document.getElementById("registerSenha"),
        senhaConfirm: document.getElementById("registerSenhaConfirm")
    };
}

async function parseApiResponse(response) {
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : null;

    if (!response.ok) {
        throw new Error(data?.error || `Erro HTTP ${response.status}`);
    }

    return data;
}

async function handleLoginSubmit(event) {
    event.preventDefault();

    const { email, senha } = getLoginElements();
    const payload = {
        email: email.value.trim(),
        senha: senha.value
    };

    if (!payload.email || !payload.senha) {
        showPetToast("Preencha e-mail e senha para entrar.", {
            title: "Login incompleto",
            iconClass: "fa-solid fa-circle-exclamation",
            iconWrapperClass: "bg-red-100 text-red-500"
        });
        return;
    }

    try {
        const response = await apiFetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await parseApiResponse(response);
        setAuthSession(data);
        showPetToast("Voce entrou com sucesso.", {
            title: "Login realizado",
            iconClass: "fa-solid fa-right-to-bracket"
        });
        nav("dashboard");
    } catch (error) {
        showPetToast(error.message, {
            title: "Falha no login",
            iconClass: "fa-solid fa-triangle-exclamation",
            iconWrapperClass: "bg-red-100 text-red-500"
        });
    }
}

async function handleRegisterSubmit(event) {
    event.preventDefault();

    const { nome, telefone, email, emailConfirm, senha, senhaConfirm } = getRegisterElements();
    const payload = {
        nome: nome.value.trim(),
        telefone: telefone.value.trim(),
        email: email.value.trim().toLowerCase(),
        senha: senha.value
    };

    if (!payload.nome || !payload.email || !payload.senha) {
        showPetToast("Preencha nome, e-mail e senha para continuar.", {
            title: "Cadastro incompleto",
            iconClass: "fa-solid fa-circle-exclamation",
            iconWrapperClass: "bg-red-100 text-red-500"
        });
        return;
    }

    if (payload.email !== emailConfirm.value.trim().toLowerCase()) {
        showPetToast("Os e-mails informados nao coincidem.", {
            title: "E-mails diferentes",
            iconClass: "fa-solid fa-envelope-circle-check",
            iconWrapperClass: "bg-red-100 text-red-500"
        });
        return;
    }

    if (payload.senha !== senhaConfirm.value) {
        showPetToast("As senhas informadas nao coincidem.", {
            title: "Senhas diferentes",
            iconClass: "fa-solid fa-lock",
            iconWrapperClass: "bg-red-100 text-red-500"
        });
        return;
    }

    try {
        const createResponse = await apiFetch("/api/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        await parseApiResponse(createResponse);

        const loginResponse = await apiFetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: payload.email,
                senha: payload.senha
            })
        });

        const session = await parseApiResponse(loginResponse);
        setAuthSession(session);
        showPetToast("Conta criada e acesso liberado.", {
            title: "Cadastro concluido",
            iconClass: "fa-solid fa-user-check"
        });
        nav("dashboard");
    } catch (error) {
        showPetToast(error.message, {
            title: "Falha no cadastro",
            iconClass: "fa-solid fa-triangle-exclamation",
            iconWrapperClass: "bg-red-100 text-red-500"
        });
    }
}

function updateDashboardIdentity() {
    const usuario = getAuthUser();
    if (!usuario) return;

    const greeting = document.getElementById("dashboardUserGreeting");
    if (greeting) {
        greeting.textContent = `Ola, ${usuario.nome}!`;
    }

    const meta = document.getElementById("dashboardUserMeta");
    if (meta) {
        meta.innerHTML = `<i class="fa-solid fa-paw text-brand-orange"></i> Usuario conectado`;
    }

    const avatar = document.getElementById("dashboardUserAvatar");
    if (avatar) {
        const initials = usuario.nome
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() || "")
            .join("") || "AU";

        avatar.textContent = initials;
    }
}

function initAuthForms() {
    const login = getLoginElements();
    const register = getRegisterElements();

    login.form?.addEventListener("submit", handleLoginSubmit);
    register.form?.addEventListener("submit", handleRegisterSubmit);
    updateDashboardIdentity();
}

window.requiresAuthScreen = requiresAuthScreen;
window.logout = function logout() {
    clearAuthSession();
    nav("login");
};

document.addEventListener("DOMContentLoaded", initAuthForms);
