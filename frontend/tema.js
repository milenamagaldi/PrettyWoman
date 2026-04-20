// tema.js - Cérebro Global do Sistema (CORRIGIDO)
// =========================================================

// O evento 'DOMContentLoaded' garante que o JavaScript só arranca
// quando o <body> e o resto do HTML já existem na tela!
document.addEventListener('DOMContentLoaded', () => {

    // 1. CARREGAMENTO DO TEMA
    if (localStorage.getItem('tema') === 'light') {
        document.body.classList.add('light-mode');
    }
    if (localStorage.getItem('daltonico') === 'true') {
        document.body.classList.add('daltonico-mode');
    }

    // 2. LÓGICA DA SPLASH SCREEN (TELA DE ABERTURA)
    const splash = document.getElementById('splash-screen');
    if (splash) {
        // Aguarda 0.8 segundos (800ms) para dar o charme
        setTimeout(() => {
            splash.classList.add('esconder-splash');

            // Aguarda o CSS do fade-out terminar (0.5s) e remove do HTML
            setTimeout(() => {
                splash.remove();
            }, 500);
        }, 800);
    }

    // 3. LÓGICA DOS BOTÕES DE CONFIGURAÇÃO (SETTINGS)
    const btnSettings = document.getElementById('btn-settings');
    const modalSettings = document.getElementById('modal-settings');
    const toggleTema = document.getElementById('toggle-tema');
    const toggleDaltonismo = document.getElementById('toggle-daltonismo');
    const fecharSettings = document.getElementById('fechar-settings');

    // Procura o escudo de bloqueio. Se não existir na página, cria um.
    let escudo = document.getElementById('escudo-bloqueio');
    if (!escudo && modalSettings) {
        escudo = document.createElement('div');
        escudo.id = 'escudo-bloqueio';
        escudo.classList.add('bloqueio-tela');
        document.body.appendChild(escudo);
    }

    // Atualiza os textos dos botões com base no que foi salvo no LocalStorage
    if (toggleTema) {
        toggleTema.textContent = document.body.classList.contains('light-mode') ? 'Modo Claro Ativo' : 'Modo Escuro Ativo';
    }
    if (toggleDaltonismo) {
        toggleDaltonismo.textContent = document.body.classList.contains('daltonico-mode') ? 'Modo Daltônico: Ligado' : 'Modo Daltônico: Desligado';
    }

    // Abrir Modal
    if (btnSettings && modalSettings) {
        btnSettings.addEventListener('click', () => {
            modalSettings.classList.remove('escondido');
            if (escudo) escudo.classList.add('ativo');
        });
    }

    // Fechar Modal
    if (fecharSettings && modalSettings) {
        fecharSettings.addEventListener('click', () => {
            modalSettings.classList.add('escondido');
            if (escudo) escudo.classList.remove('ativo');
        });
    }

    // Botão de trocar Tema (Claro/Escuro)
    if (toggleTema) {
        toggleTema.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            localStorage.setItem('tema', isLight ? 'light' : 'dark');
            toggleTema.textContent = isLight ? 'Modo Claro Ativo' : 'Modo Escuro Ativo';
        });
    }

    // Botão de trocar Acessibilidade (Daltônico)
    if (toggleDaltonismo) {
        toggleDaltonismo.addEventListener('click', () => {
            document.body.classList.toggle('daltonico-mode');
            const isDaltonico = document.body.classList.contains('daltonico-mode');
            localStorage.setItem('daltonico', isDaltonico ? 'true' : 'false');
            toggleDaltonismo.textContent = isDaltonico ? 'Modo Daltônico: Ligado' : 'Modo Daltônico: Desligado';
        });
    }
}); 