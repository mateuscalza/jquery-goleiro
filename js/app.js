let emPartida = false;
let defesas = 0;

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
  $('#bola').css({
    transitionProperty: 'transform',
    transitionTimingFunction: 'ease-in',
    transitionDuration: `${Math.floor(
      800 + 3000 / (defesas || 1) + 300 * defesas * Math.random()
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

// Partida
async function iniciaPartida() {
  emPartida = true;
  defesas = 0;
  localStorage.ultimoPlacar = defesas;

  while (emPartida) {
    await new Promise(resolve => setTimeout(resolve, 1000));
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
  } else {
    reiniciar();
  }
}
