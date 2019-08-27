// JavaScript Document

var pontos = 0;
var ranking = JSON.parse(localStorage.getItem('jogo_calza') || '[]');
var bg;
var isbest = false;

function get(id) {
  return document.getElementById(id);
}
function rect(id) {
  return document.getElementById(id).getBoundingClientRect();
}
function sound(file) {
  var elem = document.createElement('audio');
  elem.setAttribute('src', 'midias/' + file);
  return elem;
}

bg = sound('background.mp3');

var tempo = 20;
function partida() {
  inicio = new Date();
  loop = setInterval(function() {
    var segundo = 20 - Math.floor((new Date() - inicio) / 1000);
    if (segundo != tempo) {
      tempo = segundo;
      if (segundo <= 0) {
        clearInterval(loop);
        fimPartida();
      } else if (segundo % 2 == 0) {
				console.log('teste')
        lancaBola();
      }
    }
  }, 100);
}

function lancaBola() {
	sound('chute.wav').play();
  get('bola').style.transition = 'all ' + get('dificuldade').value + 's';
  get('bola').style.top =
    Math.floor(map(Math.random(), 0, 1, 100, 600) - 100) + 'px';
  get('bola').style.left = Math.floor(map(Math.random(), 0, 1, 60, 500)) + 'px';
  get('bola').style.transform = 'scale(0.9)';
  get('agrupa-gomos').className = 'moveX';
}

function fimPartida() {
  get('inicio').style.display = 'none';
  get('modal').style.display = 'block';
  get('fim').style.display = 'block';
  ordenarRanking();
  if (typeof ranking[0] == 'object' && ranking[0].value < pontos) isbest = true;
  ranking.push({ name: get('nome').value.toUpperCase(), value: pontos });
  var apitofinal = sound('apito_final.wav');
  apitofinal.onended = function() {
    if (isbest) sound('nova-pontuacao.mp3').play();
  };
  apitofinal.play();
  ordenarRanking();
  for (jogador in ranking) {
    document.querySelector('#ranking tbody').innerHTML +=
      '<tr><td>' +
      (parseInt(jogador) + 1) +
      'º </td><td>' +
      ranking[jogador].value +
      '</td><td>' +
      ranking[jogador].name +
      '</td></tr>';
  }
  localStorage.setItem('jogo_calza', JSON.stringify(ranking));
}

function map(value, min1, max1, min2, max2) {
  return min2 + ((max2 - min2) * (value - min1)) / (max1 - min1);
}

function resetarBola() {
  get('bola').style = '';
  get('bola').style.transition = 'none';
  get('bola').style.transform = 'rotate(0deg) scale(0.4)';
  get('bola').style.top = '300px';
  get('bola').style.left = '320px';
}

function verifica(e) {
  if (e.propertyName === 'transform') {
    var x = map(
      rect('bola').left + rect('bola').width / 2,
      rect('luva').left - 50,
      rect('luva').right + 50,
      0,
      100
    );
    var y = map(
      rect('bola').top + rect('bola').height / 2,
      rect('luva').top,
      rect('luva').bottom,
      0,
      100
    );
    if (x >= 25 && x <= 75 && y >= 25 && y <= 75) {
      pontos += 20;
      feedback('Agarrou!<br>+20');
      sound('espalmar-agarrar.mp3').play();
    } else if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      pontos += 10;
      feedback('Espalmou!<br>+10');
      sound('espalmar-agarrar.mp3').play();
    } else {
      sound('grito_de_gol.mp3').play();
    }
    get('agrupa-gomos').className = '';
    resetarBola();
  }
}

function ordenarRanking() {
  ranking.sort(function(a, b) {
    if (a.value < b.value) {
      return -1;
    } else if (a.value > b.value) {
      return 1;
    }
    return 0;
  });
  ranking.reverse();
}

function feedback(msg) {
  get('feedback').innerHTML = msg;
  get('feedback').style.top = get('luva').offsetTop - 50 + 'px';
  get('feedback').style.left = get('luva').offsetLeft + 50 + 'px';
  get('feedback').style.opacity = 1;
  setTimeout(function() {
    get('feedback').style.opacity = 0;
  }, 700);
  get('placar').innerHTML = pontos;
}

function moveLuva(x, y) {
  get('luva').style.left =
    (x - 75 - get('jogoplace').offsetLeft).toString() + 'px';
  get('luva').style.top =
    (y - 55 - get('jogoplace').offsetTop).toString() + 'px';
  get('luva').style.transform =
    'rotate(' + map(x - get('jogoplace').offsetLeft, 0, 700, -40, 40) + 'deg)';
}

window.onload = function() {
  get('iniciar').onclick = function(e) {
    e.preventDefault();
    get('modal').style.display = 'none';
    get('placar').style.display = 'block';
		get('luva').style.display = 'block';
		debugger;
    get('bola').style.display = 'block';
    get('jogo').addEventListener('mousemove', function(e) {
      moveLuva(e.pageX, e.pageY);
    });
    get('bola').addEventListener('transitionend', verifica);
    resetarBola();
    bg.currentTime = 4;
    bg.play();
    bg.currentTime = 4;
    bg.volume = 0.6;
    partida();
  };
};
