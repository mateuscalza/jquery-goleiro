let emPartida = false;
let defesas = 0;
let audioFundo = null;

// Ao clicar em iniciar
$('#iniciar').click(function(event) {
  event.preventDefault();

  $('#modal').hide();
  $('#placar').show();
  $('#luva').show();
  $('#bola').show();

  iniciaPartida();
});

// Prepara último placar
function preparaUltimoPlacar() {
  if (localStorage.ultimoPlacar) {
    $('#ultimo-placar').show();
    $('#ultimo-placar span').text(localStorage.ultimoPlacar);
  } else {
    $('#ultimo-placar').hide();
  }
}
preparaUltimoPlacar();

// Reinicia tudo
function reiniciar() {
  emPartida = false;
  defesas = 0;
  $('#placar').text(defesas);

  $('#placar').hide();
  $('#luva').hide();
  $('#bola').hide();
  $('#modal').show();

  preparaUltimoPlacar();

  if (audioFundo) {
    audioFundo.pause();
    audioFundo = null;
  }
}

// Ao mover o cursor
$('#jogo').mousemove(function(event) {
  moveLuva(event.pageX, event.pageY);
});
$('#jogo').on('touchmove', function(event) {
  moveLuva(
    event.originalEvent.touches[0].pageX,
    event.originalEvent.touches[0].pageY
  );
});

// Lança bola
async function lancarBola() {
  audio('chute.wav', 1);
  $('#bola').css({
    transitionProperty: 'transform',
    transitionTimingFunction: 'ease-in',
    transitionDuration: `${Math.floor(
      700 + Math.max(0, 2000 - (defesas || 1) * 100) - 150 * Math.random()
    )}ms`
  });
  const termino = new Promise(resolve => {
    $('#bola').one('transitionend', resolve);
  });

  // Aplica nova posição da bola
  const posicaoAtual = $('#bola')
    .get(0)
    .getBoundingClientRect();
  const proporcaoX = Math.min(0.4, Math.max(-0.4, (Math.random() - 0.5) * 2));
  const proporcaoY = Math.min(0.4, Math.max(-0.4, (Math.random() - 0.5) * 2));
  const deslocamentoX = Math.floor(
    proporcaoX < 0
      ? proporcaoX * posicaoAtual.left
      : proporcaoX * posicaoAtual.right
  );
  const deslocamentoY = Math.floor(
    proporcaoY < 0
      ? proporcaoY * posicaoAtual.top
      : proporcaoY * posicaoAtual.bottom
  );

  const rotacao = (Math.random() - 0.5) * 500;

  $('#bola').css({
    transform: `translate(${deslocamentoX}px, ${deslocamentoY}px) scale(1) rotate(${Math.floor(
      rotacao > 0 ? rotacao + 800 : rotacao - 800
    )}deg)`
  });
  await termino;
  await validaDefesa();

  // Reseta bola
  $('#bola')
    .css({
      transitionProperty: 'none',
      transitionTimingFunction: 'ease-in',
      transitionTiming: '0ms'
    })
    .css({
      transform: 'translate(0px, 0px) scale(0) rotate(0deg)'
    });
}

// Audio
function audio(file, volume = 1) {
  try {
    const elementoNativo = document.createElement('audio');
    elementoNativo.src = `midias/${file}`;
    elementoNativo.volume = volume;
    elementoNativo.play();
    return elementoNativo;
  } catch (error) {
    console.error(error);
  }
}

// Partida
async function iniciaPartida() {
  emPartida = true;
  defesas = 0;
  localStorage.ultimoPlacar = defesas;

  audioFundo = audio('background.mp3', 0.3);
  audioFundo.currentTime = 4;
  audioFundo.loop = true;

  while (emPartida) {
    await new Promise(resolve =>
      setTimeout(resolve, 200 + Math.max(0, 800 - (defesas || 1) * 50))
    );
    await lancarBola(defesas);
    defesas++;
  }
}

// Mapeia valores
function map(value, min1, max1, min2, max2) {
  return min2 + ((max2 - min2) * (value - min1)) / (max1 - min1);
}

// Move a luva
function moveLuva(x, y) {
  $('#luva').css({
    left: x - 75,
    top: y - 55,
    transform: `rotate(${map(x, 0, $('#jogo').width(), -40, 40)}deg)`
  });
}

// Verifica gol
async function validaDefesa() {
  const rectBola = $('#bola')
    .get(0)
    .getBoundingClientRect();
  const bolaCentroX = rectBola.left + rectBola.width / 2;
  const bolaCentroY = rectBola.top + rectBola.height / 2;
  const rectLuvas = $('#luva')
    .get(0)
    .getBoundingClientRect();

  if (
    bolaCentroX >= rectLuvas.left - 50 &&
    bolaCentroX <= rectLuvas.right + 50 &&
    bolaCentroY >= rectLuvas.top - 50 &&
    bolaCentroY <= rectLuvas.bottom + 50
  ) {
    $('#placar').text(defesas + 1);
    localStorage.ultimoPlacar = defesas + 1;

    audio('espalmar-agarrar.mp3', 1);
  } else {
    audio('grito_de_gol.mp3', 1);
    reiniciar();
  }
}
