const db = require('../database/connection');

module.exports = {
    async listarExemplares(request, response) {
        try {
            const {liv_nome} = request.body;
            const livPesq = liv_nome ? `%${liv_nome}%` : `%%`;
            // instruções SQL
            const sql = `SELECT 
                exe.exe_cod, liv.liv_nome, exe.exe_tombo, exe.exe_data_aquis, exe.exe_data_saida
                FROM exemplares exe
                INNER JOIN livros liv ON liv.liv_cod = exe.liv_cod
                Where liv.liv_nome like ?;`;

            const values = [livPesq];
            // executa instruções SQL e armazena o resultado na variável usuários
            const exemplares = await db.query(sql, values);
            // armazena em uma variável o número de registros retornados
            const nItens = exemplares[0].length;

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de exemplares.',
                dados: exemplares[0],
                nItens
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },  


    async cadastrarExemplares(request, response) {
        try {
            // Parâmetros recebidos no corpo da requisição
            const { liv_cod, exe_tombo, exe_data_aquis, exe_data_saida } = request.body;

            // Validação dos dados recebidos
            if (liv_cod === undefined || liv_cod === null) {
                return response.status(400).json({
                    sucesso: false,
                    mensagem: 'liv_cod é obrigatório e não pode ser nulo.',
                });
            }

            // Corrigir formato da data, se necessário
            // Dependendo da configuração do banco de dados, você pode precisar converter a data para o formato adequado
            const formatDate = (dateStr) => {
                const [day, month, year] = dateStr.split('/');
                return `${year}-${month}-${day}`; // Formato YYYY-MM-DD
            };

            const dataAquis = formatDate(exe_data_aquis);
            const dataSaida = formatDate(exe_data_saida);

            // Instrução SQL para inserção
            const sql = `INSERT INTO exemplares (liv_cod, exe_tombo, exe_data_aquis, exe_data_saida) VALUES (?, ?, ?, ?)`;
            const values = [liv_cod, exe_tombo, dataAquis, dataSaida];

            // Execução da instrução SQL
            const execSql = await db.query(sql, values);
            const exe_cod = execSql[0].insertId;

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Cadastro do exemplar efetuado com sucesso.',
                dados: exe_cod,
            });
        } catch (error) {
            console.error('Erro ao cadastrar exemplar:', error.message); // Log do erro para depuração
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message,
            });
        }
    },


    async editarExemplares(request, response) {
        try {
            // parâmetros recebidos pelo corpo da requisição
            const { liv_cod, exe_tombo, exe_data_aquis, exe_data_saida} = request.body;
            // parâmetro recebido pela URL via params ex: /usuario/1
            const { exe_cod } = request.params;
            // instruções SQL
            const sql = `UPDATE exemplares SET liv_cod = ?, 
                        exe_tombo = ?, exe_data_aquis = ?, exe_data_saida = ?
                        WHERE exe_cod = ?;`;
            // preparo do array com dados que serão atualizados
            const values = [ liv_cod, exe_tombo, exe_data_aquis, exe_data_saida, exe_cod];
            // execução e obtenção de confirmação da atualização realizada
            const atualizaDados = await db.query(sql, values);

            return response.status(200).json({
                sucesso: true,
                mensagem: `Exemplar ${exe_cod} atualizado com sucesso!`,
                dados: atualizaDados[0].affectedRows
                // mensSql: atualizaDados
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }
    },
    async apagarExemplares(request, response) {
        try {
            // parâmetro passado via url na chamada da api pelo front-end
            const { exe_cod } = request.params;
            // comando de exclusão
            const sql = `DELETE FROM exemplares WHERE exe_cod = ?`;
            // array com parâmetros da exclusão
            const values = [exe_cod];
            // executa instrução no banco de dados
            const excluir = await db.query(sql, values);

            return response.status(200).json({
                sucesso: true,
                mensagem: `Exemplar ${exe_cod} excluído com sucesso`,
                dados: excluir[0].affectedRows
            });
        } catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.message
            });
        }    
    }
}