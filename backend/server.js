const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
// NOVOS:
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const porta = 3000;

// Permite que o seu HTML (Frontend) converse com a API sem bloqueios de segurança
app.use(cors());

// Permite que a API receba os dados das coordenadas em formato JSON
app.use(express.json());

// Cria a pasta "uploads" automaticamente se ela não existir
const dir = './uploads';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

// Configuração do Multer (Cria o nome do arquivo com a data atual para não repetir)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

// PERMISSÃO MÁGICA: Permite que o frontend acesse a pasta uploads livremente
app.use('/uploads', express.static('uploads'));

// 1. Criando a conexão com o banco de dados
const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'alunolab', // A senha do seu MySQL Workbench
    database: 'power_soccer', // O nome do banco que criamos
    port: 3303
});

// 2. Testando a conexão na hora que o servidor ligar
conexao.connect((erro) => {
    if (erro) {
        console.error('❌ Erro ao conectar no MySQL:', erro.message);
        return;
    }
    console.log('✅ Conexão com o banco power_soccer estabelecida com sucesso!');
});

// 3. Rota de teste para ver se a API está viva
app.get('/', (req, res) => {
    res.json({ mensagem: 'A API do Scout Power Soccer está rodando!' });
});

// Rota para salvar a ação do jogo (Agora recebe a partida_id dinamicamente!)
// Rota para salvar a ação do jogo (Agora recebe a partida_id E o usuario_id dinamicamente!)
app.post('/api/eventos', (req, res) => {
    // Agora recebemos o usuario_id no pacote
    const { partida_id, atleta_id, usuario_id, minuto_video, tipo_acao, coord_x, coord_y, jogador_entrou_id } = req.body;
    
    // Trocamos o "1" fixo pelo "?" dinâmico no usuario_id
    const sql = `INSERT INTO eventos_scout (partida_id, atleta_id, usuario_id, periodo, minuto_video, tipo_acao, coord_x, coord_y, jogador_entrou_id) 
                 VALUES (?, ?, ?, '1º Tempo', ?, ?, ?, ?, ?)`;
    
    conexao.query(sql, [partida_id, atleta_id, usuario_id, minuto_video, tipo_acao, coord_x || null, coord_y || null, jogador_entrou_id || null], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao salvar no banco:', erro);
            return res.status(500).json({ erro: 'Erro interno ao salvar' });
        }
        res.status(201).json({ mensagem: 'Ação salva!', id_registro: resultados.insertId });
    });
});


// Rota para buscar as Estatísticas Globais dos Jogadores
app.get('/api/estatisticas', (req, res) => {
    const sql = `
        SELECT 
            a.nome AS atleta,
            SUM(CASE WHEN e.tipo_acao = 'Passe Certo' THEN 1 ELSE 0 END) AS passes_certos,
            SUM(CASE WHEN e.tipo_acao = 'Passe Errado' THEN 1 ELSE 0 END) AS passes_errados,
            SUM(CASE WHEN e.tipo_acao = 'Interceptação' THEN 1 ELSE 0 END) AS interceptacoes,
            SUM(CASE WHEN e.tipo_acao = 'Finalização' THEN 1 ELSE 0 END) AS finalizacoes,
            SUM(CASE WHEN e.tipo_acao = 'Gol' THEN 1 ELSE 0 END) AS gols
        FROM atletas a
        LEFT JOIN eventos_scout e ON a.id = e.atleta_id
        GROUP BY a.id, a.nome
        ORDER BY gols DESC, passes_certos DESC;
    `;

    conexao.query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar estatísticas:', erro);
            return res.status(500).json({ erro: 'Erro interno' });
        }
        res.json(resultados);
    });
});

// Rota para buscar os lances de uma partida específica (para redesenhar o mapa)
app.get('/api/eventos/partida/:id', (req, res) => {
    const idPartida = req.params.id;
    const sql = `
        SELECT e.*, a.nome AS nome_atleta 
        FROM eventos_scout e
        JOIN atletas a ON e.atleta_id = a.id
        WHERE e.partida_id = ?
    `;
    
    conexao.query(sql, [idPartida], (erro, resultados) => {
        if (erro) return res.status(500).json({ erro: 'Erro ao buscar lances' });
        res.json(resultados);
    });
});

// Rota para deletar um lance específico
app.delete('/api/eventos/:id', (req, res) => {
    const idLance = req.params.id;
    const sql = 'DELETE FROM eventos_scout WHERE id = ?';

    conexao.query(sql, [idLance], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao deletar:', erro);
            return res.status(500).json({ erro: 'Erro ao deletar o lance' });
        }
        res.json({ mensagem: 'Lance deletado com sucesso!' });
    });
});

// Rota para ATUALIZAR (Alterar) um lance
app.put('/api/eventos/:id', (req, res) => {
    const idLance = req.params.id;
    const { tipo_acao, minuto_video } = req.body;
    
    const sql = 'UPDATE eventos_scout SET tipo_acao = ?, minuto_video = ? WHERE id = ?';

    conexao.query(sql, [tipo_acao, minuto_video, idLance], (erro, resultados) => {
        if (erro) return res.status(500).json({ erro: 'Erro ao atualizar' });
        res.json({ mensagem: 'Lance atualizado com sucesso!' });
    });
});

// Rota para CADASTRAR JOGADOR com foto
app.post('/api/atletas', upload.single('foto'), (req, res) => {
    const { nome, numero_camisa } = req.body;
    
    // Se o cara mandou foto, guarda o caminho. Se não, fica null
    const fotoPath = req.file ? `/uploads/${req.file.filename}` : null;
    
    // Cadastra fixo na equipe 1 (Seleção Brasileira) por enquanto
    const sql = 'INSERT INTO atletas (nome, numero_camisa, equipe_id, foto) VALUES (?, ?, 1, ?)';
    
    conexao.query(sql, [nome, numero_camisa, fotoPath], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao cadastrar jogador:', erro);
            return res.status(500).json({ erro: 'Erro interno ao salvar jogador' });
        }
        res.status(201).json({ mensagem: 'Atleta cadastrado com sucesso!', id: resultados.insertId });
    });
});

// Rota para BUSCAR todos os atletas cadastrados
app.get('/api/atletas', (req, res) => {
    const sql = 'SELECT * FROM atletas ORDER BY id ASC';
    conexao.query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar atletas:', erro);
            return res.status(500).json({ erro: 'Erro ao buscar atletas' });
        }
        res.json(resultados);
    });
});

// ==========================================
// NOVAS ROTAS: PERFIL DO JOGADOR
// ==========================================

// 1. Busca as Estatísticas de UM jogador específico
app.get('/api/estatisticas/atleta/:id', (req, res) => {
    const idAtleta = req.params.id;
    const sql = `
        SELECT 
            a.id, a.nome, a.numero_camisa, a.foto,
            SUM(CASE WHEN e.tipo_acao = 'Passe Certo' THEN 1 ELSE 0 END) AS passes_certos,
            SUM(CASE WHEN e.tipo_acao = 'Passe Errado' THEN 1 ELSE 0 END) AS passes_errados,
            SUM(CASE WHEN e.tipo_acao = 'Interceptação' THEN 1 ELSE 0 END) AS interceptacoes,
            SUM(CASE WHEN e.tipo_acao = 'Finalização' THEN 1 ELSE 0 END) AS finalizacoes,
            SUM(CASE WHEN e.tipo_acao = 'Gol' THEN 1 ELSE 0 END) AS gols
        FROM atletas a
        LEFT JOIN eventos_scout e ON a.id = e.atleta_id
        WHERE a.id = ?
        GROUP BY a.id;
    `;
    conexao.query(sql, [idAtleta], (erro, resultados) => {
        if (erro) return res.status(500).json({ erro: 'Erro interno' });
        res.json(resultados[0] || {});
    });
});

// 2. Busca TODOS os eventos de UM jogador (Para o Mapa de Calor Pessoal)
app.get('/api/eventos/atleta/:id', (req, res) => {
    const idAtleta = req.params.id;
    // Pega só lances que têm coordenada no campo
    const sql = 'SELECT * FROM eventos_scout WHERE atleta_id = ? AND coord_x IS NOT NULL';
    conexao.query(sql, [idAtleta], (erro, resultados) => {
        if (erro) return res.status(500).json({ erro: 'Erro ao buscar lances do atleta' });
        res.json(resultados);
    });
});

// 3. Deletar um Jogador
app.delete('/api/atletas/:id', (req, res) => {
    const idAtleta = req.params.id;
    // CUIDADO: Se o jogador tem lances, apagar ele quebra o banco. 
    // Primeiro apagamos os lances dele (Efeito Cascata), depois apagamos ele!
    conexao.query('DELETE FROM eventos_scout WHERE atleta_id = ? OR jogador_entrou_id = ?', [idAtleta, idAtleta], () => {
        conexao.query('DELETE FROM atletas WHERE id = ?', [idAtleta], (erro) => {
            if (erro) return res.status(500).json({ erro: 'Erro ao deletar atleta' });
            res.json({ mensagem: 'Atleta deletado com sucesso!' });
        });
    });
});

// 4. Ligando o servidor
app.listen(porta, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${porta}`);
});

// ROTA DE LOGIN COM AUTO-REGISTO
app.post('/api/login', (req, res) => {
    const { email, nome } = req.body; // Recebemos o nome vindo do Google
    
    const sqlBusca = 'SELECT id, nome, email FROM usuarios WHERE email = ?';

    conexao.query(sqlBusca, [email], (erro, resultados) => {
        if (erro) return res.status(500).json({ erro: 'Erro no servidor' });

        if (resultados.length > 0) {
            // Utilizador já existe
            res.json({ sucesso: true, usuario: resultados[0] });
        } else {
            // Utilizador novo: Regista automaticamente
            const sqlInsert = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, "google-auth")';
            conexao.query(sqlInsert, [nome || 'Treinador', email], (erroIns, resIns) => {
                if (erroIns) return res.status(500).json({ erro: 'Erro ao criar conta' });
                
                res.json({ 
                    sucesso: true, 
                    usuario: { id: resIns.insertId, nome: nome || 'Treinador', email: email } 
                });
            });
        }
    });
});;

// ROTA PARA CRIAR NOVA PARTIDA
app.post('/api/partidas', (req, res) => {
    const { data_jogo, adversario, escalacao } = req.body;
    
    // Agora salvamos a escalação como JSON no banco!
    const sql = 'INSERT INTO partidas (data_jogo, adversario, escalacao) VALUES (?, ?, ?)';
    
    conexao.query(sql, [data_jogo, adversario, JSON.stringify(escalacao)], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao criar partida:', erro);
            return res.status(500).json({ erro: 'Erro ao criar partida' });
        }
        res.status(201).json({ mensagem: 'Partida criada!', id_partida: resultados.insertId });
    });
});

// ROTA PARA BUSCAR PARTIDAS ANTERIORES (NOVO!)
app.get('/api/partidas', (req, res) => {
    const sql = 'SELECT * FROM partidas ORDER BY data_jogo DESC, id DESC';
    conexao.query(sql, (erro, resultados) => {
        if (erro) return res.status(500).json({ erro: 'Erro ao buscar partidas' });
        res.json(resultados);
    });
});

