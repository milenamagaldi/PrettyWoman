// ==========================================
// 1. SEGURANÇA E DADOS DA PARTIDA
// ==========================================
const partidaInfoText = localStorage.getItem('partidaAtual');
if (!partidaInfoText) window.location.href = 'home.html';

const partidaInfo = JSON.parse(partidaInfoText || '{}');
const dadosTreinador = JSON.parse(localStorage.getItem('usuarioLogado') || '{}');

if (!dadosTreinador.id) {
    localStorage.removeItem('usuarioLogado'); window.location.href = 'login.html';
}

const idDoTreinador = dadosTreinador.id;
let modoVisualizacao = localStorage.getItem('modoVisualizacao') === 'true';
let dadosAlterados = false; // Rastreador de alterações não salvas

const headerNome = document.getElementById('nome-treinador');
if (headerNome && partidaInfo.adversario) headerNome.innerHTML = `<span style="color:#4da3ff;">vs ${partidaInfo.adversario}</span>`;

let atletaIdSelecionado = 0; let jogadorSelecionado = "Desconhecido";
if (partidaInfo.escalacao && partidaInfo.escalacao.titulares && partidaInfo.escalacao.titulares[0]) {
    atletaIdSelecionado = parseInt(partidaInfo.escalacao.titulares[0].id);
    jogadorSelecionado = `${partidaInfo.escalacao.titulares[0].nome} (${partidaInfo.escalacao.titulares[0].numero_camisa})`;
}

// Variáveis Globais
const campo = document.getElementById('campo'); const svgQuadra = document.getElementById('quadra-svg');
const modalAcao = document.getElementById('modal-acao'); const tituloModal = document.getElementById('modal-titulo');
const btnFecharModal = document.getElementById('fechar-modal'); const botoesAcao = document.querySelectorAll('#modal-acao .btn-acao');
const inputTempo = document.getElementById('tempo-video'); const displayTempo = document.getElementById('tempo-display');
const listaHistorico = document.getElementById('lista-historico'); const modalEdicao = document.getElementById('modal-edicao');
const selectEditarAcao = document.getElementById('editar-tipo-acao'); const inputEditarMinuto = document.getElementById('editar-minuto');
const escudoBloqueio = document.getElementById('escudo-bloqueio'); const modalSubstituicao = document.getElementById('modal-substituicao');
const textoSubstituicao = document.getElementById('texto-substituicao'); const containerTitulares = document.querySelector('.titulares');
const containerReservas = document.querySelector('.lista-reservas'); const btnModoPartida = document.getElementById('btn-modo-partida');

let cliqueX = 0; let cliqueY = 0; let tempoAtualFormatado = '00:00';
let lancesDaPartida = []; let idLanceEmEdicao = null; let primeiraCarga = true;
let idSaindo = null; let idEntrando = null;

// ==========================================
// 2. SISTEMA DE MODAIS CUSTOMIZADOS
// ==========================================
function mostrarAlertaCustom(titulo, mensagem) {
    document.getElementById('titulo-alerta-custom').textContent = titulo;
    document.getElementById('texto-alerta-custom').textContent = mensagem;
    escudoBloqueio.classList.add('ativo');
    document.getElementById('modal-alerta-custom').classList.remove('escondido');
}
document.getElementById('btn-ok-alerta').addEventListener('click', () => {
    document.getElementById('modal-alerta-custom').classList.add('escondido');
    escudoBloqueio.classList.remove('ativo');
});

function mostrarConfirmCustom(titulo, mensagem, corBotao, textoBotao, callbackSim) {
    document.getElementById('titulo-confirm-custom').textContent = titulo;
    document.getElementById('texto-confirm-custom').textContent = mensagem;
    const btnSim = document.getElementById('btn-sim-confirm');
    btnSim.className = `btn-acao ${corBotao}`;
    btnSim.textContent = textoBotao;

    const novoBtnSim = btnSim.cloneNode(true);
    btnSim.parentNode.replaceChild(novoBtnSim, btnSim);

    novoBtnSim.addEventListener('click', () => {
        document.getElementById('modal-confirm-custom').classList.add('escondido');
        escudoBloqueio.classList.remove('ativo');
        callbackSim();
    });

    escudoBloqueio.classList.add('ativo');
    document.getElementById('modal-confirm-custom').classList.remove('escondido');
}
document.getElementById('btn-nao-confirm').addEventListener('click', () => {
    document.getElementById('modal-confirm-custom').classList.add('escondido');
    escudoBloqueio.classList.remove('ativo');
});

// ==========================================
// 3. CONTROLE DE MODO E NAVEGAÇÃO SEGURA
// ==========================================
function atualizarVisualBotao() {
    if (modoVisualizacao) {
        btnModoPartida.style.backgroundColor = 'var(--duo-orange)'; btnModoPartida.textContent = '⚙️ Alterar Partida';
    } else {
        btnModoPartida.style.backgroundColor = 'var(--duo-green-primary)'; btnModoPartida.textContent = '🔒 Encerrar Edição';
    }
}
atualizarVisualBotao();

btnModoPartida.addEventListener('click', () => {
    if (modoVisualizacao) {
        mostrarConfirmCustom("Modo de Edição", "Deseja destravar a tela para adicionar e remover lances da partida?", "btn-duo-orange", "Sim, destravar", () => {
            modoVisualizacao = false; localStorage.setItem('modoVisualizacao', 'false'); dadosAlterados = false; atualizarVisualBotao();
        });
    } else {
        mostrarAlertaCustom("Sucesso", "Edição encerrada. Todos os dados já estão sincronizados com a nuvem!");
        modoVisualizacao = true; localStorage.setItem('modoVisualizacao', 'true'); dadosAlterados = false; atualizarVisualBotao();
    }
});

document.getElementById('btn-voltar-menu').addEventListener('click', (e) => {
    e.preventDefault();
    if (!modoVisualizacao && dadosAlterados) {
        mostrarConfirmCustom("Sair sem Salvar?", "Você tem lances não finalizados. Deseja sair da edição e voltar ao menu?", "btn-duo-vermelho", "Sair mesmo assim", () => {
            window.location.href = 'home.html';
        });
    } else {
        window.location.href = 'home.html';
    }
});

document.getElementById('btn-sair').addEventListener('click', (e) => {
    e.preventDefault();
    const executarLogout = () => { localStorage.removeItem('usuarioLogado'); window.location.href = 'login.html'; };
    if (!modoVisualizacao && dadosAlterados) {
        mostrarConfirmCustom("Deslogar sem Salvar?", "Você tem lances não finalizados. Deseja sair do sistema e perder a sessão?", "btn-duo-vermelho", "Deslogar mesmo assim", executarLogout);
    } else {
        executarLogout();
    }
});

// ==========================================
// 4. CONTROLE DO TEMPO E AUTO-SWITCH
// ==========================================
inputTempo.addEventListener('input', (e) => {
    const segundosTotais = e.target.value;
    tempoAtualFormatado = `${Math.floor(segundosTotais / 60).toString().padStart(2, '0')}:${(segundosTotais % 60).toString().padStart(2, '0')}`;
    displayTempo.textContent = tempoAtualFormatado;
});

inputTempo.addEventListener('change', (e) => {
    const sSelecionados = parseInt(e.target.value);
    reorganizarTitularesEReservas(sSelecionados);

    if (!estaEmQuadra(atletaIdSelecionado, sSelecionados)) {
        const subDele = lancesDaPartida.find(l => l.tipo_acao === 'Substituição' && l.jogador_entrou_id == atletaIdSelecionado);
        let idParaTrocar = null;

        if (subDele && sSelecionados < ((parseInt(subDele.minuto_video.split(':')[0]) * 60) + parseInt(subDele.minuto_video.split(':')[1]))) {
            idParaTrocar = subDele.atleta_id;
        } else {
            const eleSaindo = lancesDaPartida.find(l => l.tipo_acao === 'Substituição' && l.atleta_id == atletaIdSelecionado);
            if (eleSaindo && sSelecionados >= ((parseInt(eleSaindo.minuto_video.split(':')[0]) * 60) + parseInt(eleSaindo.minuto_video.split(':')[1]))) {
                idParaTrocar = eleSaindo.jogador_entrou_id;
            }
        }

        if (idParaTrocar) {
            document.querySelectorAll('.jogador').forEach(j => {
                if (parseInt(j.getAttribute('data-id')) == idParaTrocar) {
                    document.querySelectorAll('.jogador').forEach(x => x.classList.remove('ativo'));
                    j.classList.add('ativo');
                    jogadorSelecionado = j.querySelector('span').textContent;
                    atletaIdSelecionado = idParaTrocar;
                }
            });
            mostrarAlertaCustom("Atenção", `O jogador selecionado estava no banco. Voltamos a seleção para ${jogadorSelecionado} que estava em quadra.`);
            renderizarMapaELista();
        }
    }
});

function atualizarBarraDeTempo(tempoTexto) {
    const p = tempoTexto.split(':'); if (p.length !== 2) return;
    inputTempo.value = (parseInt(p[0]) * 60) + parseInt(p[1]);
    tempoAtualFormatado = tempoTexto; displayTempo.textContent = tempoAtualFormatado;
}

// ==========================================
// 5. SELEÇÃO E SUBSTITUIÇÃO DE JOGADORES
// ==========================================
document.addEventListener('click', (e) => {
    const boxJogador = e.target.closest('.jogador');
    if (!boxJogador) return;
    const isReserva = boxJogador.closest('.lista-reservas') !== null;
    const titularAtivo = document.querySelector('.titulares .jogador.ativo');

    if (isReserva && titularAtivo) {
        if (modoVisualizacao) return mostrarAlertaCustom("Modo Leitura", "A tela está travada. Clique em 'Alterar Partida' para fazer substituições.");

        idSaindo = parseInt(titularAtivo.getAttribute('data-id')); idEntrando = parseInt(boxJogador.getAttribute('data-id'));
        textoSubstituicao.innerHTML = `<strong>${titularAtivo.querySelector('span').textContent}</strong> será substituído por <strong>${boxJogador.querySelector('span').textContent}</strong> aos <span class="cor-duo">${tempoAtualFormatado}</span>?`;
        modalSubstituicao.style.position = 'fixed'; modalSubstituicao.style.left = '50%'; modalSubstituicao.style.top = '50%'; modalSubstituicao.style.transform = 'translate(-50%, -50%)';
        escudoBloqueio.classList.add('ativo'); modalSubstituicao.classList.remove('escondido');
    }
    else if (!isReserva) {
        document.querySelectorAll('.jogador').forEach(j => j.classList.remove('ativo'));
        boxJogador.classList.add('ativo');
        jogadorSelecionado = boxJogador.querySelector('span').textContent; atletaIdSelecionado = parseInt(boxJogador.getAttribute('data-id'));
        const lDoJogador = lancesDaPartida.filter(l => l.atleta_id === atletaIdSelecionado);
        if (lDoJogador.length > 0) {
            const sorted = [...lDoJogador].sort((a, b) => { return ((parseInt(a.minuto_video.split(':')[0]) * 60) + parseInt(a.minuto_video.split(':')[1])) - ((parseInt(b.minuto_video.split(':')[0]) * 60) + parseInt(b.minuto_video.split(':')[1])); });
            atualizarBarraDeTempo(sorted[sorted.length - 1].minuto_video);
        } else {
            const intervalos = calcularIntervalosDoJogador(atletaIdSelecionado);
            if (intervalos.length > 0) { atualizarBarraDeTempo(`${Math.floor(intervalos[0].inicio / 60).toString().padStart(2, '0')}:${(intervalos[0].inicio % 60).toString().padStart(2, '0')}`); }
            else { atualizarBarraDeTempo("00:00"); }
        }
        reorganizarTitularesEReservas(parseInt(inputTempo.value)); renderizarMapaELista();
    }
});

document.getElementById('btn-cancelar-sub').addEventListener('click', () => { modalSubstituicao.classList.add('escondido'); escudoBloqueio.classList.remove('ativo'); });

// A INTELIGÊNCIA CONTRA O PARADOXO TEMPORAL
document.getElementById('btn-confirmar-sub').addEventListener('click', () => {

    // Verifica se o jogador saindo tem ações no futuro em relação ao momento da substituição
    const segSub = (parseInt(tempoAtualFormatado.split(':')[0]) * 60) + parseInt(tempoAtualFormatado.split(':')[1]);
    const acoesFuturas = lancesDaPartida.filter(l => l.atleta_id == idSaindo && l.tipo_acao !== 'Substituição' && ((parseInt(l.minuto_video.split(':')[0]) * 60) + parseInt(l.minuto_video.split(':')[1])) > segSub);

    const efetivarSubstituicao = () => {
        // Se houver ações no futuro, apaga elas em cascata primeiro
        const promisesDelecao = acoesFuturas.map(l => fetch(`http://localhost:3000/api/eventos/${l.id}`, { method: 'DELETE' }));

        Promise.all(promisesDelecao).then(() => {
            const dadosParaBanco = { partida_id: partidaInfo.id, atleta_id: idSaindo, usuario_id: idDoTreinador, jogador_entrou_id: idEntrando, minuto_video: tempoAtualFormatado, tipo_acao: 'Substituição', coord_x: null, coord_y: null };
            fetch('http://localhost:3000/api/eventos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosParaBanco) })
                .then(() => {
                    dadosAlterados = true;
                    atletaIdSelecionado = idEntrando; modalSubstituicao.classList.add('escondido'); escudoBloqueio.classList.remove('ativo'); carregarDadosDoBanco();
                });
        });
    };

    if (acoesFuturas.length > 0) {
        modalSubstituicao.classList.add('escondido'); // Esconde o modal de sub pra mostrar o de confirmação
        mostrarConfirmCustom(
            "Alerta de Linha do Tempo",
            `O jogador atual possui ${acoesFuturas.length} ações registradas DEPOIS desse minuto. Substituí-lo agora apagará essas ações do futuro. Deseja continuar?`,
            "btn-duo-vermelho",
            "Sim, Substituir e Apagar",
            efetivarSubstituicao
        );
    } else {
        efetivarSubstituicao();
    }
});

// ==========================================
// 6. CLIQUE NO MAPA E REGISTRO DE AÇÕES
// ==========================================
svgQuadra.addEventListener('click', (e) => {
    if (modoVisualizacao) return mostrarAlertaCustom("Modo Leitura", "A tela está travada. Clique em 'Alterar Partida' para adicionar lances.");
    const rect = svgQuadra.getBoundingClientRect(); cliqueX = ((e.clientX - rect.left) / rect.width) * 100; cliqueY = ((e.clientY - rect.top) / rect.height) * 100;
    if (cliqueX < 0 || cliqueX > 100 || cliqueY < 0 || cliqueY > 100) return;

    if (!estaEmQuadra(atletaIdSelecionado, parseInt(inputTempo.value))) return mostrarAlertaCustom("Erro", `Impossível registrar lance. O ${jogadorSelecionado} está no banco neste momento.`);

    const lanceNoMesmoSegundo = lancesDaPartida.some(l => l.minuto_video === tempoAtualFormatado && l.atleta_id === atletaIdSelecionado);
    if (lanceNoMesmoSegundo) return mostrarAlertaCustom("Rápido Demais!", "Já existe uma ação gravada para este jogador neste exato segundo. Avance o tempo na barra.");

    tituloModal.textContent = `${jogadorSelecionado} aos ${tempoAtualFormatado}`;
    modalAcao.style.position = 'fixed'; modalAcao.style.left = '50%'; modalAcao.style.top = '50%'; modalAcao.style.transform = 'translate(-50%, -50%)';
    escudoBloqueio.classList.add('ativo'); modalAcao.classList.remove('escondido');
});

document.getElementById('fechar-modal').addEventListener('click', () => { modalAcao.classList.add('escondido'); escudoBloqueio.classList.remove('ativo'); });

botoesAcao.forEach(botao => {
    botao.addEventListener('click', (e) => {
        const tAcao = e.target.getAttribute('data-tipo'); if (!tAcao) return;
        fetch('http://localhost:3000/api/eventos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ partida_id: partidaInfo.id, atleta_id: atletaIdSelecionado, usuario_id: idDoTreinador, minuto_video: tempoAtualFormatado, tipo_acao: tAcao, coord_x: cliqueX.toFixed(2), coord_y: cliqueY.toFixed(2) }) })
            .then(() => {
                dadosAlterados = true; carregarDadosDoBanco(); modalAcao.classList.add('escondido'); escudoBloqueio.classList.remove('ativo');
            });
    });
});

// ==========================================
// 7. MOTOR DE TEMPO
// ==========================================
function calcularIntervalosDoJogador(idPesquisado) {
    let intervalos = []; const fInit = partidaInfo.escalacao.titulares.some(j => j && j.id == idPesquisado); let tEntrada = fInit ? 0 : null;
    lancesDaPartida.filter(l => l.tipo_acao === 'Substituição').sort((a, b) => (((parseInt(a.minuto_video.split(':')[0]) * 60) + parseInt(a.minuto_video.split(':')[1])) - ((parseInt(b.minuto_video.split(':')[0]) * 60) + parseInt(b.minuto_video.split(':')[1])))).forEach(sub => {
        const tSub = (parseInt(sub.minuto_video.split(':')[0]) * 60) + parseInt(sub.minuto_video.split(':')[1]);
        if (sub.atleta_id == idPesquisado && tEntrada !== null) { intervalos.push({ inicio: tEntrada, fim: tSub }); tEntrada = null; }
        else if (sub.jogador_entrou_id == idPesquisado) { tEntrada = tSub; }
    });
    if (tEntrada !== null) intervalos.push({ inicio: tEntrada, fim: 2400 }); return intervalos;
}
function estaEmQuadra(idPesquisado, sAtual) { return calcularIntervalosDoJogador(idPesquisado).some(int => { if (int.fim >= 2400 && sAtual >= 2400) return sAtual >= int.inicio && sAtual <= int.fim; return sAtual >= int.inicio && sAtual < int.fim; }); }

// function atualizarCoresDaBarra() {
//     const maxS = 2400; let grad = []; let ultF = 0;
//     calcularIntervalosDoJogador(atletaIdSelecionado).forEach(int => {
//         if (int.inicio > ultF) grad.push(`var(--duo-red) ${(ultF/maxS)*100}% ${(int.inicio/maxS)*100}%`);
//         grad.push(`#444 ${(int.inicio/maxS)*100}% ${(int.fim/maxS)*100}%`); ultF = int.fim;
//     });
//     if (ultF < maxS) grad.push(`var(--duo-red) ${(ultF/maxS)*100}% 100%`); inputTempo.style.background = `linear-gradient(to right, ${grad.join(', ')})`;
// }

function atualizarCoresDaBarra() {
    const maxS = 2400; let grad = []; let ultF = 0;
    // Usamos a variável que já muda de cor entre os temas
    const corTrilha = 'var(--border-ui)';

    calcularIntervalosDoJogador(atletaIdSelecionado).forEach(int => {
        if (int.inicio > ultF) grad.push(`var(--duo-red) ${(ultF / maxS) * 100}% ${(int.inicio / maxS) * 100}%`);
        grad.push(`${corTrilha} ${(int.inicio / maxS) * 100}% ${(int.fim / maxS) * 100}%`);
        ultF = int.fim;
    });
    if (ultF < maxS) grad.push(`var(--duo-red) ${(ultF / maxS) * 100}% 100%`);
    inputTempo.style.background = `linear-gradient(to right, ${grad.join(', ')})`;
}

function reorganizarTitularesEReservas(sAtual) {
    document.querySelectorAll('.jogador').forEach(div => {
        const id = parseInt(div.getAttribute('data-id')); const isTitular = estaEmQuadra(id, sAtual); let fDiv = div.querySelector('.foto');
        if (isTitular) {
            containerTitulares.appendChild(div);
            if (!fDiv) {
                fDiv = document.createElement('div'); fDiv.classList.add('foto'); const fReal = div.getAttribute('data-foto');
                if (fReal && fReal !== 'null' && fReal !== '') { fDiv.style.backgroundImage = `url('http://localhost:3000${fReal}')`; fDiv.style.backgroundSize = 'cover'; fDiv.style.backgroundPosition = 'center'; fDiv.style.color = 'transparent'; } else { fDiv.textContent = div.querySelector('span').textContent.charAt(0); } div.prepend(fDiv);
            }
        } else { containerReservas.appendChild(div); if (fDiv) fDiv.remove(); }
    });
}

// ==========================================
// 8. RENDERIZAÇÃO
// ==========================================
function carregarDadosDoBanco() {
    fetch(`http://localhost:3000/api/eventos/partida/${partidaInfo.id}`).then(res => res.json()).then(lances => {
        lancesDaPartida = lances; renderizarMapaELista();
        if (primeiraCarga && modoVisualizacao && lances.length > 0) {
            const uLance = [...lances].sort((a, b) => (((parseInt(a.minuto_video.split(':')[0]) * 60) + parseInt(a.minuto_video.split(':')[1])) - ((parseInt(b.minuto_video.split(':')[0]) * 60) + parseInt(b.minuto_video.split(':')[1]))))[lances.length - 1];
            atualizarBarraDeTempo(uLance.minuto_video); reorganizarTitularesEReservas(parseInt(inputTempo.value)); primeiraCarga = false;
        }
    });
}

function renderizarMapaELista() {
    document.querySelectorAll('.ponto').forEach(p => p.remove()); listaHistorico.innerHTML = ''; reorganizarTitularesEReservas(parseInt(inputTempo.value));
    const lFilt = lancesDaPartida.filter(l => l.atleta_id === atletaIdSelecionado || l.jogador_entrou_id === atletaIdSelecionado).sort((a, b) => (((parseInt(b.minuto_video.split(':')[0]) * 60) + parseInt(b.minuto_video.split(':')[1])) - ((parseInt(a.minuto_video.split(':')[0]) * 60) + parseInt(a.minuto_video.split(':')[1]))));

    lFilt.forEach(lance => {
        if (lance.tipo_acao === 'Substituição') {
            const item = document.createElement('div'); item.classList.add('item-historico');
            item.style.backgroundColor = lance.atleta_id === atletaIdSelecionado ? '#d64444'  : '#33c93a'; // entrou → verde diferente

            // A BLINDAGEM DO CARTÃO VERDE (Sem botão de excluir)
            if (lance.atleta_id === atletaIdSelecionado) {
                // Cartão Vermelho (Foi substituído) -> Tem a lixeira!
                item.innerHTML = `<div class="info-historico" style="width:100%; text-align:center;"><strong>🔄 FOI SUBSTITUÍDO (Banco)</strong> <br><small>⏱️ ${lance.minuto_video}</small></div>
                                  <button class="btn-excluir" style="color:white; opacity:1;" onclick="deletarSubstituicao(event, ${lance.id}, ${lance.jogador_entrou_id}, '${lance.minuto_video}')" title="Cancelar Substituição">🗑️</button>`;
            } else {
                // Cartão Verde (Entrou) -> Sem lixeira, apenas visual!
                item.innerHTML = `<div class="info-historico" style="width:100%; text-align:center;"><strong>🔄 ENTROU NA QUADRA</strong> <br><small>⏱️ ${lance.minuto_video}</small></div>`;
            }

            listaHistorico.appendChild(item); return;
        }

        const b = document.createElement('div'); b.classList.add('ponto'); b.id = `bolinha-${lance.id}`;
        if (lance.tipo_acao === 'Passe Certo') b.classList.add('passe-certo'); if (lance.tipo_acao === 'Passe Errado') b.classList.add('passe-errado'); if (lance.tipo_acao === 'Interceptação') b.classList.add('interceptacao'); if (lance.tipo_acao === 'Finalização') b.classList.add('finalizacao'); if (lance.tipo_acao === 'Gol') b.classList.add('gol');
        b.style.left = `${lance.coord_x}%`; b.style.top = `${lance.coord_y}%`; campo.appendChild(b);

        const item = document.createElement('div'); item.classList.add('item-historico'); item.style.cursor = 'pointer';
        // Ela transforma "Passe Certo" em "item-passe-certo", por exemplo.
        function normalizarTexto(texto) {
            return texto
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "") // remove acentos
                .replace(/\s+/g, '-');
        }
        
        const classeAcao = 'item-' + normalizarTexto(lance.tipo_acao);
        item.classList.add(classeAcao);
        item.innerHTML = `<div class="info-historico"><strong>${lance.nome_atleta}</strong>: ${lance.tipo_acao} <br><small>⏱️ ${lance.minuto_video}</small></div><button class="btn-excluir" onclick="abrirModalEdicao(event, ${lance.id}, '${lance.tipo_acao}', '${lance.minuto_video}')">⚙️</button>`;
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-excluir')) return;
            atualizarBarraDeTempo(lance.minuto_video); reorganizarTitularesEReservas(parseInt(inputTempo.value));
            const bA = document.getElementById(`bolinha-${lance.id}`); if (bA) { bA.classList.add('ponto-destaque'); setTimeout(() => bA.classList.remove('ponto-destaque'), 1500); }
        });
        listaHistorico.appendChild(item);
    });
    atualizarCoresDaBarra();
}

// ==========================================
// 9. EDIÇÃO, ELIMINAÇÃO E EFEITO DOMINÓ
// ==========================================
function abrirModalEdicao(e, id, acaoAtual, minutoAtual) {
    e.stopPropagation();
    if (modoVisualizacao) return mostrarAlertaCustom("Modo Leitura", "Clique em 'Alterar Partida' para editar lances.");
    idLanceEmEdicao = id; selectEditarAcao.value = acaoAtual; inputEditarMinuto.value = minutoAtual; modalEdicao.style.position = 'fixed'; modalEdicao.style.left = `50%`; modalEdicao.style.top = `50%`; modalEdicao.style.transform = `translate(-50%, -50%)`; escudoBloqueio.classList.add('ativo'); modalEdicao.classList.remove('escondido');
}

document.getElementById('btn-cancelar-edicao').addEventListener('click', () => { modalEdicao.classList.add('escondido'); escudoBloqueio.classList.remove('ativo'); });

document.getElementById('btn-salvar-edicao').addEventListener('click', () => {
    fetch(`http://localhost:3000/api/eventos/${idLanceEmEdicao}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo_acao: selectEditarAcao.value, minuto_video: inputEditarMinuto.value }) })
        .then(() => { dadosAlterados = true; carregarDadosDoBanco(); modalEdicao.classList.add('escondido'); escudoBloqueio.classList.remove('ativo'); });
});

// document.getElementById('btn-eliminar-definitivo').addEventListener('click', () => {
//     mostrarConfirmCustom("Excluir Lance", "Deseja realmente apagar esta ação da partida?", "btn-duo-vermelho", "Sim, Excluir", () => {
//         fetch(`http://localhost:3000/api/eventos/${idLanceEmEdicao}`, { method: 'DELETE' }).then(() => { dadosAlterados = true; carregarDadosDoBanco(); modalEdicao.classList.add('escondido'); escudoBloqueio.classList.remove('ativo'); });
//     });
// });

document.getElementById('btn-eliminar-definitivo').addEventListener('click', () => {

    // 🔥 FECHA O MODAL ATUAL PRIMEIRO
    modalEdicao.classList.add('escondido');

    mostrarConfirmCustom(
        "Excluir Lance",
        "Deseja realmente apagar esta ação da partida?",
        "btn-duo-vermelho",
        "Sim, Excluir",
        () => {
            fetch(`http://localhost:3000/api/eventos/${idLanceEmEdicao}`, { method: 'DELETE' })
                .then(() => {
                    dadosAlterados = true;
                    carregarDadosDoBanco();

                    // 🔥 GARANTE QUE O BLOQUEIO SOME SÓ NO FINAL
                    escudoBloqueio.classList.remove('ativo');
                });
        }
    );
});

// A INTELIGÊNCIA EM CASCATA (EFEITO DOMINÓ)
function deletarSubstituicao(e, lanceId, idQuemEntrou, minutoSubCancelada) {
    e.stopPropagation();
    if (modoVisualizacao) return mostrarAlertaCustom("Modo Leitura", "Clique em 'Alterar Partida' para desfazer substituições.");

    const paraSegundos = (t) => (parseInt(t.split(':')[0]) * 60) + parseInt(t.split(':')[1]);
    const segSubCancelada = paraSegundos(minutoSubCancelada);

    let idsParaDeletar = [lanceId];
    let jogadoresAfetados = [idQuemEntrou];
    let i = 0;

    while (i < jogadoresAfetados.length) {
        let jogId = jogadoresAfetados[i];
        let acoes = lancesDaPartida.filter(l => l.atleta_id == jogId && paraSegundos(l.minuto_video) >= segSubCancelada && l.id !== lanceId);

        acoes.forEach(acao => {
            if (!idsParaDeletar.includes(acao.id)) idsParaDeletar.push(acao.id);
            if (acao.tipo_acao === 'Substituição' && acao.jogador_entrou_id) {
                if (!jogadoresAfetados.includes(acao.jogador_entrou_id)) jogadoresAfetados.push(acao.jogador_entrou_id);
            }
        });
        i++;
    }

    const totalAcoesExtras = idsParaDeletar.length - 1;
    let aviso = "Tem certeza que deseja cancelar esta substituição e devolver o jogador à quadra?";
    if (totalAcoesExtras > 0) aviso = `Atenção Crítica: Cancelar esta substituição causará um EFEITO DOMINÓ! O jogador que entrou (e seus possíveis substitutos futuros) realizaram ${totalAcoesExtras} ações. TODAS essas ações sumirão da linha do tempo. Prosseguir?`;

    mostrarConfirmCustom("Cancelar Substituição", aviso, "btn-duo-vermelho", "Sim, Apagar Tudo", () => {
        Promise.all(idsParaDeletar.map(id => fetch(`http://localhost:3000/api/eventos/${id}`, { method: 'DELETE' })))
            .then(() => {
                dadosAlterados = true;
                setTimeout(() => carregarDadosDoBanco(), 500);
            });
    });
}

// ==========================================
// 10. INICIALIZAÇÃO
// ==========================================
function inicializarEscalacao() {
    try {
        containerTitulares.innerHTML = '<h3>⚽ Titulares</h3>'; containerReservas.innerHTML = '';
        const criarBoxJogador = (atleta) => {
            if (!atleta) return null;
            const div = document.createElement('div'); div.classList.add('jogador');
            if (atletaIdSelecionado !== null && atleta.id == atletaIdSelecionado) div.classList.add('ativo');
            div.setAttribute('data-id', atleta.id); div.setAttribute('data-foto', atleta.foto || ''); div.innerHTML = `<span>${atleta.nome} (${atleta.numero_camisa})</span>`; return div;
        };
        if (partidaInfo.escalacao && partidaInfo.escalacao.titulares) partidaInfo.escalacao.titulares.forEach(a => { const box = criarBoxJogador(a); if (box) containerTitulares.appendChild(box); });
        if (partidaInfo.escalacao && partidaInfo.escalacao.reservas) partidaInfo.escalacao.reservas.forEach(a => { const box = criarBoxJogador(a); if (box) containerReservas.appendChild(box); });
        carregarDadosDoBanco();
    } catch (e) { window.location.href = 'home.html'; }
}

inicializarEscalacao();