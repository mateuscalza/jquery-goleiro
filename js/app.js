// Variável que será true sempre que a partida estiver acontencendo
let emPartida = false;
// Contabiliza defesas
let defesas = 0;
// Armazena elemento de áudio do fundo
let audioFundo = null;

// Ao clicar em iniciar a partida
$('#iniciar').click(function(event) {
  event.preventDefault();

  // Esconde o botão de iniciar
  $('#modal').hide();
  // Exibe o placar
  $('#placar').show();
  // Exibe a luva
  $('#luva').show();
  // Exibe a bola
  $('#bola').show();

  // E inicia a partida
  iniciaPartida();
});

// Prepara último placar
function preparaUltimoPlacar() {
  // Pega o que tem armazenado
  if (localStorage.ultimoPlacar) {
    // Se tiver mostra
    $('#ultimo-placar').show();
    // Com o valor que está armazenado
    $('#ultimo-placar span').text(localStorage.ultimoPlacar);
  } else {
    // Se não, oculta o último placar
    $('#ultimo-placar').hide();
  }
}
// Prepara o último placar imediatamente
preparaUltimoPlacar();

// Reinicia tudo
function reiniciar() {
  // Zera as defesas e coloca a variável "emPartida" como false
  emPartida = false;
  defesas = 0;
  $('#placar').text(defesas);

  // Escondendo placar, luva e bola
  $('#placar').hide();
  $('#luva').hide();
  $('#bola').hide();
  // E exibindo o botão de iniciar partida
  $('#modal').show();

  // Exibe o último placar
  preparaUltimoPlacar();

  // E para o som de fundo
  if (audioFundo) {
    audioFundo.pause();
    audioFundo = null;
  }
}

// Sempre que mover o cursor no jogo
$('#jogo').mousemove(function(event) {
  // Move a luva
  moveLuva(event.pageX, event.pageY);
});

// Sempre que usar o touch do celular
$('#jogo').on('touchmove', function(event) {
  event.preventDefault();
  event.stopPropagation();
  // Move a luva
  moveLuva(
    event.originalEvent.touches[0].pageX,
    event.originalEvent.touches[0].pageY
  );
});

// Lança bola
async function lancarBola() {
  // Toca som de chute
  audio('chute.wav', 1);
  // Aplica CSS de transição na bola
  $('#bola').css({
    transitionProperty: 'transform',
    transitionTimingFunction: 'ease-in',
    transitionDuration: `${Math.floor(
      700 + Math.max(0, 2000 - (defesas || 1) * 100) - 150 * Math.random()
    )}ms`
  });
  // Salva evento de término de transição
  const termino = new Promise(resolve => {
    $('#bola').one('transitionend', resolve);
  });

  // Aplica nova posição da bola
  const posicaoAtual = $('#bola')
    .get(0)
    .getBoundingClientRect();
  
  // Aleatoriamente no espaço do jogo
  const proporcaoX = Math.min(0.4, Math.max(-0.4, (Math.random() - 0.5) * 2));
  const proporcaoY = Math.min(0.4, Math.max(-0.4, (Math.random() - 0.5) * 2));
  
  // Busca o deslocamento em comparação com a posição atual da bola
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

  // E também gera uma rotação aleatória na bola para dar efeito
  const rotacao = (Math.random() - 0.5) * 500;

  // Aplica essas novas condições de espaço, tamanho e rotação
  $('#bola').css({
    transform: `translate(${deslocamentoX}px, ${deslocamentoY}px) scale(1) rotate(${Math.floor(
      rotacao > 0 ? rotacao + 800 : rotacao - 800
    )}deg)`
  });
  
  // Aguarda o término dessa transição
  await termino;
  
  // Valida se ocorreu a defesa
  await validaDefesa();

  // Reseta bola para as condições iniciais
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

// Audio (não usa jQuery nessa função)
function audio(file, volume = 1) {
  try {
    // Cria um elemento de áudio do HTML5
    const elementoNativo = document.createElement('audio');
    // Com a mídia necessária
    elementoNativo.src = `midias/${file}`;
    // E o volume configurado
    elementoNativo.volume = volume;
    // E reproduz imediatamente
    elementoNativo.play();
    return elementoNativo;
  } catch (error) {
    console.error(error);
  }
}

// Inicia a partida
async function iniciaPartida() {
  // Indicando o início na variável, resetando as defesas, e as defesas armazenadas também
  emPartida = true;
  defesas = 0;
  localStorage.ultimoPlacar = defesas;

  // Toca o áudio de fundo
  audioFundo = audio('background.mp3', 0.3);
  // A partir dos 4s, já que o áudio demora para iniciar
  audioFundo.currentTime = 4;
  // E configura para ficar repetindo
  audioFundo.loop = true;

  // Enquanto estiver em partida
  while (emPartida) {
    // Aguarda um delay menor a cada defesa
    await new Promise(resolve =>
      setTimeout(resolve, 200 + Math.max(0, 800 - (defesas || 1) * 50))
    );
    // E aguarda o lançamento da bola
    await lancarBola(defesas);
    // Incrementando as defesas
    defesas++;
  }
}

// Função útil para mudar o valor de uma escala para outra
function map(value, min1, max1, min2, max2) {
  return min2 + ((max2 - min2) * (value - min1)) / (max1 - min1);
}

// Move a luva
function moveLuva(x, y) {
  // Em x, y e uma rotação leve para efeito
  $('#luva').css({
    left: x - 75,
    top: y - 55,
    transform: `rotate(${map(x, 0, $('#jogo').width(), -40, 40)}deg)`
  });
}

// Verifica gol
async function validaDefesa() {
  // Pega as posições da bola
  const rectBola = $('#bola')
    .get(0)
    .getBoundingClientRect();
  // E o seu centro
  const bolaCentroX = rectBola.left + rectBola.width / 2;
  const bolaCentroY = rectBola.top + rectBola.height / 2;
  // Pega as posições da luva
  const rectLuvas = $('#luva')
    .get(0)
    .getBoundingClientRect();

  // Se o centro estiver dentro das dimensões da luva ou de sua área para espalmar
  if (
    bolaCentroX >= rectLuvas.left - 50 &&
    bolaCentroX <= rectLuvas.right + 50 &&
    bolaCentroY >= rectLuvas.top - 50 &&
    bolaCentroY <= rectLuvas.bottom + 50
  ) {
    // Incrementa o placar
    $('#placar').text(defesas + 1);
    // E o placar armazenado
    localStorage.ultimoPlacar = defesas + 1;
    // Reproduz o áudio de espalmar/agarrar a bola
    audio('espalmar-agarrar.mp3', 1);
  } else {
    // Se não, reproduz o áudio de gol
    audio('grito_de_gol.mp3', 1);
    // E reinicia a partida
    reiniciar();
  }
}
