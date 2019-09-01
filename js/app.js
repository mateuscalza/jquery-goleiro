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

// Lança bola
async function lancarBola() {
  $('#bola').css({
    transitionProperty: 'transform',
    transitionTimingFunction: 'ease-in',
    transitionDuration: `${Math.floor(
      1300 + 2000 / (defesas || 1) + 300 * defesas * Math.random()
    )}ms`
  });
  const termino = new Promise(resolve => {
    $('#bola').one('transitionend', resolve);
  });

  // Aplica nova posição da bola
  const posicaoAtual = $('#bola')
    .get(0)
    .getBoundingClientRect();
  const proporcaoX = Math.min(0.5, Math.max(-0.5, (Math.random() - 0.5) * 2));
  const proporcaoY = Math.min(0.5, Math.max(-0.5, (Math.random() - 0.5) * 2));
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
  console.log({ proporcaoX, proporcaoY, deslocamentoX, deslocamentoY });

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
  const offset = $('#jogoplace').offset();
  $('#luva').css({
    left: x - 75 - offset.left,
    top: y - 55 - offset.top,
    transform: `rotate(${map(x - offset.left, 0, 700, -40, 40)}deg)`
  });
}

// Verifica gol
async function validaDefesa() {
  console.log('verificaGol');
  if (Math.random() > 0.9) {
    reiniciar();
  } else {
    $('#placar').text(defesas + 1);
    localStorage.ultimoPlacar = defesas + 1;
  }
}
