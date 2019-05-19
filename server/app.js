var express = require('express'),
    app = express();
var fs = require('fs');

var _ = require('underscore');
var fetch = require('node-fetch');
var jogosPorJogador;


const url_jogador = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=46A4B854A44A481019A98BF992309915&steamids=76561198009353585";
const url_jogos = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=46A4B854A44A481019A98BF992309915&steamid=76561198009353585&include_appinfo=1";

function requestAPI() {
    fetch(url_jogos)
        .then(res => res.json())
        .then(json => jogosPorJogador = json.response);
}
// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 3-4 linhas de código (você deve usar o módulo de filesystem (fs))
var db = {
};


// configurar qual templating engine usar. Sugestão: hbs (handlebars)
//app.set('view engine', '???');


// EXERCÍCIO
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json
db.jogadores = fs.readFileSync(__dirname + '/data/jogadores.json', 'utf8');
let jogadores = JSON.parse(db.jogadores);

app.set('view engine', 'hbs');
app.set('views','server/views');
app.get(['/', '/index'], function (req, res) {
    res.render('index', jogadores);
});



//console.log(jogadores)


// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter umas 15 linhas de código

app.get('/jogador/:id/', function (req, res) {
    var usuarios = _.find(jogadores.players, function(el){
        return el.steamid === req.params.id;
    });

    jogosPorJogador.nao_jogados = _.where(jogosPorJogador.games, {
        playtime_forever: 0
    }).length;

    jogosPorJogador.games = _.sortBy(jogosPorJogador.games, function(el) {
        return -el.playtime_forever;
    });

    jogosPorJogador.games = _.head(jogosPorJogador.games, 5);

    jogosPorJogador.games = _.map(jogosPorJogador.games, function (el) {
        el.playtime_forever_h = Math.round(el.playtime_forever / 60);
        return el;
    });

    res.render('jogador', {
        profile: usuarios,
        gameInfo: jogosPorJogador,
        favorito: jogosPorJogador.games[0]
    });
});
// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código
app.use(express.static(__dirname + '/../client'))


// abrir servidor na porta 3000
var server = app.listen(3000, function () {
    requestAPI();
});
// dica: 1-3 linhas de código
