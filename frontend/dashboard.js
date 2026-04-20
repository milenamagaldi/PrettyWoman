const seletorPartida = document.getElementById('seletor-partida');
let meuGrafico = null; 

// 1. Carregar as partidas no Dropdown
fetch('http://localhost:3000/api/partidas')
    .then(res => res.json())
    .then(partidas => {
        seletorPartida.innerHTML = '';
        if (partidas.length === 0) {
            seletorPartida.innerHTML = '<option value="">Nenhuma partida encontrada</option>';
            return;
        }

        partidas.forEach(p => {
            const dataJogo = new Date(p.data_jogo).toLocaleDateString('pt-BR');
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `vs ${p.adversario} (${dataJogo})`;
            seletorPartida.appendChild(option);
        });

        carregarDadosDaPartida(partidas[0].id);
    });

seletorPartida.addEventListener('change', (e) => {
    carregarDadosDaPartida(e.target.value);
});

// 2. A Função Principal que processa os dados
function carregarDadosDaPartida(partidaId) {
    if (!partidaId) return;

    fetch(`http://localhost:3000/api/eventos/partida/${partidaId}`)
        .then(res => res.json())
        .then(lances => {
            const kpis = atualizarKPIs(lances);
            atualizarGrafico(lances);
            atualizarHeatmap(lances);
            gerarAnaliseIA(kpis.gols, kpis.passesC, kpis.passesE, kpis.intercep, lances);
        });
}

// 3. Atualizar os Cartões (KPIs)
function atualizarKPIs(lances) {
    let gols = 0; let passesC = 0; let passesE = 0; let intercep = 0;

    lances.forEach(lance => {
        if (lance.tipo_acao === 'Gol') gols++;
        if (lance.tipo_acao === 'Passe Certo') passesC++;
        if (lance.tipo_acao === 'Passe Errado') passesE++;
        if (lance.tipo_acao === 'Interceptação') intercep++;
    });

    document.getElementById('kpi-gols').textContent = gols;
    document.getElementById('kpi-passes-c').textContent = passesC;
    document.getElementById('kpi-passes-e').textContent = passesE;
    document.getElementById('kpi-intercep').textContent = intercep;

    return { gols, passesC, passesE, intercep };
}

// 4. A MÁGICA DA IA (Algoritmo Baseado em Regras)
function gerarAnaliseIA(gols, passesC, passesE, intercep, lances) {
    const textoIA = document.getElementById('texto-analise-ia');
    const totalPasses = passesC + passesE;
    const precisaoPasses = totalPasses > 0 ? Math.round((passesC / totalPasses) * 100) : 0;
    
    let analise = "";

    // Análise de Posse e Passe
    if (totalPasses === 0) {
        analise += "A equipa ainda não registou volume de jogo suficiente para uma análise de passes. ";
    } else if (precisaoPasses >= 80) {
        analise += `<strong>Excelente retenção de bola:</strong> A equipa atingiu uma notável precisão de passes de ${precisaoPasses}%. O meio-campo demonstrou tranquilidade e controlo tático. `;
    } else if (precisaoPasses <= 60) {
        analise += `<strong>Alerta na construção de jogo:</strong> A precisão de passes foi perigosamente baixa (${precisaoPasses}%). O excesso de passes errados (${passesE}) sugere nervosismo ou pressão alta do adversário. Recomenda-se treinar a saída de bola curta. `;
    } else {
        analise += `A equipa teve uma precisão de passes razoável de ${precisaoPasses}%, mas com margem para melhoria técnica. `;
    }

    // Análise Defensiva
    if (intercep >= 10) {
        analise += `<br><br><strong>Defesa sólida:</strong> O elevado número de interceções (${intercep}) mostra um excelente posicionamento e leitura tática defensiva, destruindo as linhas de passe adversárias. `;
    } else if (intercep < 3 && totalPasses > 10) {
        analise += `<br><br><strong>Atenção defensiva:</strong> A equipa recuperou muito pouco a bola por interceção (${intercep}). A marcação pode estar demasiado reativa em vez de proativa. `;
    }

    // Análise Ofensiva
    const finalizacoes = lances.filter(l => l.tipo_acao === 'Finalização').length;
    if (gols >= 3) {
        analise += `<br><br><strong>Ataque Letal:</strong> A produção ofensiva foi impecável com ${gols} gol(s) marcado(s), refletindo alta eficácia no último terço do campo.`;
    } else if (gols === 0 && finalizacoes >= 5) {
        analise += `<br><br><strong>Ineficácia ofensiva:</strong> A equipa criou oportunidades (${finalizacoes} finalizações), mas não conseguiu concretizar em golos. É necessário trabalhar a frieza na cara da baliza.`;
    } else if (gols === 0 && finalizacoes < 5) {
        analise += `<br><br><strong>Dificuldade de criação:</strong> A equipa praticamente não ameaçou a baliza adversária. Faltou profundidade e agressividade no ataque.`;
    }

    textoIA.innerHTML = analise;
}

// 5. Desenhar o Gráfico de Desempenho
function atualizarGrafico(lances) {
    const statsJogadores = {};
    lances.forEach(lance => {
        if (lance.tipo_acao === 'Substituição') return;
        const nome = lance.nome_atleta;
        if (!statsJogadores[nome]) statsJogadores[nome] = { passes: 0, finalizacoes: 0, interceptacoes: 0 };
        
        if (lance.tipo_acao === 'Passe Certo') statsJogadores[nome].passes++;
        if (lance.tipo_acao === 'Finalização' || lance.tipo_acao === 'Gol') statsJogadores[nome].finalizacoes++;
        if (lance.tipo_acao === 'Interceptação') statsJogadores[nome].interceptacoes++;
    });

    const nomes = Object.keys(statsJogadores);
    const dadosPasses = nomes.map(n => statsJogadores[n].passes);
    const dadosFinalizacoes = nomes.map(n => statsJogadores[n].finalizacoes);
    const dadosIntercep = nomes.map(n => statsJogadores[n].interceptacoes);

    const ctx = document.getElementById('graficoDesempenho').getContext('2d');
    if (meuGrafico) meuGrafico.destroy();

    meuGrafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: nomes,
            datasets: [
                { label: 'Passes Certos', data: dadosPasses, backgroundColor: '#1CB0F6', borderRadius: 4 },
                { label: 'Remates/Golos', data: dadosFinalizacoes, backgroundColor: '#9C27B0', borderRadius: 4 },
                { label: 'Interceções', data: dadosIntercep, backgroundColor: '#FF9600', borderRadius: 4 }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#aaa', font: { family: 'Nunito' } } } },
            scales: {
                y: { ticks: { color: '#aaa' }, grid: { color: '#444' } },
                x: { ticks: { color: '#aaa' }, grid: { display: false } }
            }
        }
    });
}

// 6. O Mapa de Calor (Heatmap)
function atualizarHeatmap(lances) {
    const campo = document.getElementById('campo-heatmap');
    campo.querySelectorAll('.mancha-calor').forEach(m => m.remove());

    lances.forEach(lance => {
        if (lance.tipo_acao === 'Substituição' || !lance.coord_x || !lance.coord_y) return;
        const mancha = document.createElement('div');
        mancha.classList.add('mancha-calor');
        mancha.style.left = `${lance.coord_x}%`; mancha.style.top = `${lance.coord_y}%`;
        campo.appendChild(mancha);
    });
}

// ==========================================
// 7. EXPORTAÇÃO PARA PDF
// ==========================================
document.getElementById('btn-exportar-pdf').addEventListener('click', () => {
    // Muda o botão para mostrar que está a carregar
    const btn = document.getElementById('btn-exportar-pdf');
    const textoOriginal = btn.textContent;
    btn.textContent = "A gerar PDF...";
    btn.disabled = true;

    // Pega exatamente a área que queremos fotografar (área do relatório)
    const elementoParaPDF = document.getElementById('area-relatorio');

    // Configurações do PDF
    const opcoes = {
        margin:       10, // Margem em mm
        filename:     `Relatorio_PowerScout.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#2D2D2D' }, // Alta resolução e fundo escuro
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Gera o PDF e volta o botão ao normal
    html2pdf().set(opcoes).from(elementoParaPDF).save().then(() => {
        btn.textContent = textoOriginal;
        btn.disabled = false;
    });
});