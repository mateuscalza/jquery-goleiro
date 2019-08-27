// Ao clicar em iniciar
$('#iniciar').click(function(event) {
  event.preventDefault();

  $('#modal').hide();
  $('#placar').show();
  $('#luva').show();
  $('#bola').show();
});

// Ao mover o cursor
$('#jogo').mousemove(function(event) {
  moveLuva(event.pageX, event.pageY);
});

// Ao término da animação da bola
$('#bola').on('transitionend', function(event) {
  verificaGol();
});

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
function verificaGol() {
  console.log('verificaGol');
}
