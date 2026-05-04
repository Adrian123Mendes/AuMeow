 function nav(screenId) {
            if (
                typeof window.requiresAuthScreen === "function" &&
                window.requiresAuthScreen(screenId) &&
                typeof window.isAuthenticated === "function" &&
                !window.isAuthenticated()
            ) {
                screenId = "login";
            }

            // Esconde todas as telas
            document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
            
            // Remove scroll de telas que não precisam (como login)
            const container = document.getElementById('app-container');
            container.scrollTo(0, 0);

            // Mostra a tela selecionada
            const selected = document.getElementById(screenId);
            if(selected) {
                selected.classList.remove('hidden');
                // Pequena animação de entrada
                selected.classList.remove('fade-in');
                void selected.offsetWidth; // trigger reflow
                selected.classList.add('fade-in');
            }
        }

        // --- Navegação Tabs Admin ---
        function switchAdminTab(tabName) {
            // Atualiza conteúdo
            document.querySelectorAll('.admin-tab').forEach(el => el.classList.add('hidden'));
            document.getElementById('admin-' + tabName).classList.remove('hidden');
        }
