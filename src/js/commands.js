
let player;

let jogoPreparado = false;
let jogoIniciado = false;
let jogoPausado = false;
let rcpAtiva = false;

let intervaloJogo = null;
let animacaoGrafico = null;
let animacaoBotao = null;

// Relógio suave: o vídeo é a referência, mas performance.now() mantém os
// cliques e a animação precisos entre duas leituras da API do YouTube.
let referenciaVideo = 0;
let referenciaPerformance = 0;

let compressions = 0;
let pontuacao = 0;
let perfectCount = 0;
let okayCount = 0;
let badCount = 0;

let temposCompressoes = [];
let batidasPontuadas = [];
let eventosRitmoJogador = [];
let ultimoTempoVideo = 0;

// Elementos
const prepareBtn = document.getElementById("prepare-btn");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const rcpBtn = document.getElementById("rcp-btn");

const gameMessage = document.getElementById("game-message");
const compressionCount = document.getElementById("compression-count");
const modal = document.getElementById("game-modal");
const judgement = document.getElementById("judgement");

const scoreElement = document.getElementById("score");
const perfectElement = document.getElementById("perfect-count");
const okayElement = document.getElementById("okay-count");
const badElement = document.getElementById("bad-count");

const canvas = document.getElementById("rcp-chart");
const ctx = canvas.getContext("2d");

const idealBpmElement = document.getElementById("ideal-bpm");
const playerBpmElement = document.getElementById("player-bpm");
const accuracyElement = document.getElementById("accuracy");

// Configurações
const BPM_IDEAL = 104;
const INICIO_RCP = 10;
const INTERVALO_IDEAL = 60 / BPM_IDEAL;

const JANELA_GRAFICO = 8;
const POSICAO_CURSOR = 0.60;

const TOLERANCIA_PERFECT = 0.10;
const TOLERANCIA_OKAY = 0.30;
const TEMPO_INATIVIDADE = 2;

idealBpmElement.textContent = BPM_IDEAL;

prepareBtn.disabled = true;
pauseBtn.disabled = true;
rcpBtn.disabled = true;

// ======================================
// 1. YOUTUBE
// ======================================

function onYouTubeIframeAPIReady() {
  player = new YT.Player("youtube-player", {
    height: "315",
    width: "560",
    videoId: "fNFzfwLM72c",
    playerVars: {
      playsinline: 1
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: function (event) {
        console.error("Erro no YouTube:", event.data);
        gameMessage.textContent = "ERRO NO VÍDEO";
      }
    }
  });
}

function onPlayerReady() {
  prepareBtn.disabled = false;
}

// ======================================
// 2. PREPARAR
// ======================================

prepareBtn.addEventListener("click", function () {
  if (!player || jogoPreparado) {
    return;
  }

  jogoPreparado = true;
  prepareBtn.disabled = true;

  player.playVideo();

  modal.style.display = "flex";
  gameMessage.textContent = "PREPARANDO...";
});

// ======================================
// 3. INICIAR
// ======================================

startBtn.addEventListener("click", function () {
  if (!jogoPreparado || jogoIniciado) {
    return;
  }

  jogoIniciado = true;
  jogoPausado = false;
  rcpAtiva = false;

  reiniciarPontuacao();

  rcpBtn.disabled = true;
  pauseBtn.disabled = false;
  pauseBtn.textContent = "Pausar";

  modal.style.display = "none";

  player.seekTo(0, true);
  player.playVideo();

  if (intervaloJogo !== null) {
    clearInterval(intervaloJogo);
  }

  intervaloJogo = setInterval(atualizarJogo, 50);

  if (animacaoGrafico !== null) {
    cancelAnimationFrame(animacaoGrafico);
  }

  animacaoGrafico = requestAnimationFrame(desenharGrafico);

});

function reiniciarPontuacao() {
  compressions = 0;
  pontuacao = 0;
  perfectCount = 0;
  okayCount = 0;
  badCount = 0;

  temposCompressoes = [];
  batidasPontuadas = [];
  eventosRitmoJogador = [];
  ultimoTempoVideo = 0;
  referenciaVideo = 0;
  referenciaPerformance = performance.now();

  judgement.className = "judgement";
  judgement.textContent = "";

  atualizarPlacar();

  playerBpmElement.textContent = "0";
  accuracyElement.textContent = "0";

  rcpBtn.style.setProperty("--beat-progress", 0);
  rcpBtn.style.backgroundColor = "#858d99";
  rcpBtn.classList.remove("ready", "pressed");
}

// ======================================
// 4. PAUSAR / CONTINUAR
// ======================================

pauseBtn.addEventListener("click", function () {
  if (!jogoIniciado || !player) {
    return;
  }

  if (!jogoPausado) {
    jogoPausado = true;
    rcpAtiva = false;

    rcpBtn.disabled = true;
    pauseBtn.textContent = "Continuar";
    gameMessage.textContent = "JOGO PAUSADO";

    player.pauseVideo();
  } else {
    jogoPausado = false;

    pauseBtn.textContent = "Pausar";
    gameMessage.textContent = "RETOMANDO...";

    player.playVideo();
  }
});

// ======================================
// 5. ATUALIZAR JOGO
// ======================================

function sincronizarRelogioComVideo() {
  if (!player) {
    return;
  }

  referenciaVideo = player.getCurrentTime();
  referenciaPerformance = performance.now();
}

function tempoDoJogo() {
  return referenciaVideo + (performance.now() - referenciaPerformance) / 1000;
}

function atualizarJogo() {
  if (!jogoIniciado || !player || jogoPausado) {
    return;
  }

  if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
    rcpAtiva = false;
    rcpBtn.disabled = true;
    return;
  }

  sincronizarRelogioComVideo();
  const tempo = tempoDoJogo();

  // Se o jogador voltar o vídeo, reiniciar os dados.
  if (tempo < ultimoTempoVideo - 0.5) {
    reiniciarPontuacao();
  }

  ultimoTempoVideo = tempo;

  if (tempo < INICIO_RCP) {
    rcpAtiva = false;
    rcpBtn.disabled = true;
    rcpBtn.classList.remove("ready");

    if (tempo < 7) {
      gameMessage.textContent = "PRONTO?";
    } else if (tempo < 8) {
      gameMessage.textContent = "3";
    } else if (tempo < 9) {
      gameMessage.textContent = "2";
    } else {
      gameMessage.textContent = "1";
    }

    return;
  }

  gameMessage.textContent = "INICIE A RCP!";

  rcpAtiva = true;
  rcpBtn.disabled = false;

  atualizarEstatisticas(tempo);
}

// ======================================
// 6. ANIMAÇÃO DO BOTÃO ARCADE
// ======================================


function atualizarBotaoArcade(tempo) {
  const tempoRelativo = tempo - INICIO_RCP;

  // Progresso de cada ciclo ideal: 0 até 1
  const fase = (
    tempoRelativo / INTERVALO_IDEAL
  ) % 1;

  // O botão fica pequeno entre as batidas
  // e cresce quando a próxima batida se aproxima.
  // O cosseno garante uma animação contínua.
  const progresso = (
    1 + Math.cos(2 * Math.PI * fase)
  ) / 2;

  rcpBtn.style.setProperty(
    "--beat-progress",
    progresso
  );

  // Transição de cinza para verde
  // Detectar proximidade da batida ideal
  const batidaMaisProxima = Math.round(
    tempoRelativo / INTERVALO_IDEAL
  );

  const diferenca = Math.abs(
    tempoRelativo -
    batidaMaisProxima * INTERVALO_IDEAL
  );

  // Verde somente dentro da mesma janela que gera PERFECT.
  rcpBtn.style.backgroundColor =
    diferenca <= TOLERANCIA_PERFECT ? "#22c55e" : "#858d99";

  rcpBtn.classList.toggle(
    "ready",
    diferenca <= TOLERANCIA_PERFECT
  );
}

function animarBotao() {
  if (!jogoIniciado) {
    animacaoBotao = null;
    return;
  }

  if (
    rcpAtiva && !jogoPausado && player &&
    player.getPlayerState() === YT.PlayerState.PLAYING
  ) {
    atualizarBotaoArcade(tempoDoJogo());
  }

  animacaoBotao = requestAnimationFrame(animarBotao);
}

// ======================================
// 7. REGISTRAR COMPRESSÃO
// ======================================

rcpBtn.addEventListener("click", function () {
  if (!rcpAtiva || jogoPausado || !player) {
    return;
  }

  if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
    return;
  }

  const tempo = tempoDoJogo();

  if (tempo < INICIO_RCP) {
    return;
  }

  compressions++;
  temposCompressoes.push(tempo);
  registrarCliqueNoRitmo(tempo);

  avaliarCompressao(tempo);

  // Efeito de botão pressionado
  rcpBtn.classList.add("pressed");
  rcpBtn.style.backgroundColor = "#22c55e";
  window.setTimeout(function () {
    rcpBtn.classList.remove("pressed");
    rcpBtn.style.backgroundColor = "#858d99";
  }, 110);

  // Reinicia a animação de feedback
  judgement.classList.remove("show");
  void judgement.offsetWidth;
  judgement.classList.add("show");

  atualizarPlacar();
  atualizarEstatisticas(tempo);

  // A classe pressed será retirada na próxima atualização
  // sem depender de temporizadores.
});

// ======================================
// 8. AVALIAR CADA CLIQUE
// ======================================

function avaliarCompressao(tempo) {
  const tempoRelativo = tempo - INICIO_RCP;

  const indiceBatida = Math.max(
    0,
    Math.round(tempoRelativo / INTERVALO_IDEAL)
  );

  const tempoIdeal =
    INICIO_RCP + indiceBatida * INTERVALO_IDEAL;

  const diferenca = Math.abs(tempo - tempoIdeal);

  let resultado = "BAD";
  let pontos = 0;

  // Impede pontuar duas vezes a mesma batida
  const jaPontuada = batidasPontuadas.includes(indiceBatida);

  if (!jaPontuada && diferenca <= TOLERANCIA_PERFECT) {
    resultado = "PERFECT";
    pontos = 100;
    perfectCount++;
    batidasPontuadas.push(indiceBatida);

  } else if (!jaPontuada && diferenca <= TOLERANCIA_OKAY) {
    resultado = "OKAY";
    pontos = 50;
    okayCount++;
    batidasPontuadas.push(indiceBatida);

  } else {
    badCount++;
  }

  pontuacao += pontos;

  judgement.textContent = resultado;
  judgement.className = "judgement " + resultado.toLowerCase();
}

// ======================================
// 9. ATUALIZAR PLACAR
// ======================================

function atualizarPlacar() {
  compressionCount.textContent = compressions;
  scoreElement.textContent = pontuacao;

  perfectElement.textContent = perfectCount;
  okayElement.textContent = okayCount;
  badElement.textContent = badCount;
}

// ======================================
// 10. ESTATÍSTICAS
// ======================================

function atualizarEstatisticas(tempoAtual) {
  if (!jogoIniciado || jogoPausado) {
    return;
  }

  if (temposCompressoes.length === 0) {
    playerBpmElement.textContent = "0";
    accuracyElement.textContent = "0";
    return;
  }

  const ultimoClique =
    temposCompressoes[temposCompressoes.length - 1];

  if (tempoAtual - ultimoClique > TEMPO_INATIVIDADE) {
    playerBpmElement.textContent = "0";

  } else if (temposCompressoes.length >= 2) {
    // Usa cliques recentes para evitar que o BPM
    // permaneça influenciado por pausas antigas.
    const recentes = temposCompressoes.filter(function (t) {
      return t >= tempoAtual - 4;
    });

    const ultimas = recentes.slice(-6);

    if (ultimas.length >= 2) {
      const primeiro = ultimas[0];
      const ultimo = ultimas[ultimas.length - 1];

      const intervalo = ultimo - primeiro;

      if (intervalo > 0) {
        const bpm =
          60 * (ultimas.length - 1) / intervalo;

        playerBpmElement.textContent = Math.round(bpm);
      }
    } else {
      playerBpmElement.textContent = "0";
    }
  }

  // Porcentagem de cliques classificados como
  // PERFECT ou OKAY.
  const acertos = perfectCount + okayCount;

  const precisao = compressions > 0
    ? acertos / compressions * 100
    : 0;

  const ultimoEvento = eventosRitmoJogador[eventosRitmoJogador.length - 1];
  playerBpmElement.textContent = ultimoEvento && eventosRitmoJogador.length > 1
    ? Math.round(60 / ultimoEvento.periodo)
    : "0";

  accuracyElement.textContent = Math.round(precisao);
}

// ======================================
// 11. DESENHAR GRÁFICO
// ======================================


function desenharGrafico() {
  if (!player || !jogoIniciado) {
    animacaoGrafico = null;
    return;
  }

  if (
    !jogoPausado &&
    player.getPlayerState() === YT.PlayerState.PLAYING
  ) {
    const tempoAtual = tempoDoJogo();

    const largura = canvas.width;
    const altura = canvas.height;

    const centroY = altura / 2;
    const amplitude = 65;

    const cursorX = largura * POSICAO_CURSOR;

    const inicioJanela =
      tempoAtual - JANELA_GRAFICO * POSICAO_CURSOR;

    const pixelsPorSegundo = largura / JANELA_GRAFICO;

    ctx.clearRect(0, 0, largura, altura);

    // Fundo
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, largura, altura);

    // Grade
    ctx.strokeStyle = "#273244";
    ctx.lineWidth = 1;

    for (let x = 0; x <= largura; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, altura);
      ctx.stroke();
    }

    for (let y = 0; y <= altura; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(largura, y);
      ctx.stroke();
    }

    // Linha central
    ctx.strokeStyle = "#64748b";
    ctx.beginPath();
    ctx.moveTo(0, centroY);
    ctx.lineTo(largura, centroY);
    ctx.stroke();

    // ==================================
    // ONDA IDEAL - LARANJA
    // ==================================

    ctx.beginPath();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;

    let iniciouIdeal = false;

    for (let x = 0; x <= largura; x++) {
      const tempo =
        inicioJanela + x / pixelsPorSegundo;

      if (tempo < INICIO_RCP) {
        continue;
      }

      const fase =
        2 * Math.PI *
        (tempo - INICIO_RCP) /
        INTERVALO_IDEAL;

      const y =
        centroY - Math.cos(fase) * amplitude;

      if (!iniciouIdeal) {
        ctx.moveTo(x, y);
        iniciouIdeal = true;
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // ==================================
    // ONDA DO JOGADOR - VERDE
    // ==================================

    // Oscilação diminui após inatividade.
    // Desenhar a onda até 60%
    ctx.beginPath();
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;

    let pontaY = centroY;

    for (let x = 0; x <= cursorX; x++) {
      const tempo = inicioJanela + x / pixelsPorSegundo;
      const ponto = pontoJogadorNoTempo(tempo, centroY, amplitude);

      if (x === 0) {
        ctx.moveTo(x, ponto.y);
      } else {
        ctx.lineTo(x, ponto.y);
      }

      if (x === Math.floor(cursorX)) {
        pontaY = ponto.y;
      }
    }

    ctx.stroke();

    // ==================================
    // CURSOR LUMINOSO
    // ==================================

    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1;
    ctx.moveTo(cursorX, 0);
    ctx.lineTo(cursorX, altura);
    ctx.stroke();

    // Brilho externo
    ctx.save();
    ctx.shadowColor = "#22c55e";
    ctx.shadowBlur = 25;

    ctx.beginPath();
    ctx.fillStyle = "rgba(34,197,94,0.35)";
    ctx.arc(cursorX, pontaY, 14, 0, Math.PI * 2);
    ctx.fill();

    // Ponto central
    ctx.beginPath();
    ctx.fillStyle = "#4ade80";
    ctx.arc(cursorX, pontaY, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  animacaoGrafico = requestAnimationFrame(desenharGrafico);
}


// ======================================
// 12. EVENTOS DO YOUTUBE
// ======================================

// O ritmo e a intensidade consultados abaixo pertencem ao instante que está
// sendo desenhado. Portanto, um novo clique só muda o trecho novo da onda.
function registrarCliqueNoRitmo(tempo) {
  const ultimo = eventosRitmoJogador[eventosRitmoJogador.length - 1];
  const periodoAnterior = ultimo ? ultimo.periodo : INTERVALO_IDEAL;

  if (!ultimo) {
    eventosRitmoJogador.push({
      tempo: tempo,
      periodo: INTERVALO_IDEAL,
      fase: 2 * Math.PI * (tempo - INICIO_RCP) / INTERVALO_IDEAL
    });
    return;
  }

  const intervaloClique = Math.max(0.03, tempo - ultimo.tempo);
  // Responde ao último clique, mas a mistura curta evita oscilações visuais
  // por toques acidentais isolados.
  const periodo = intervaloClique * 0.75 + periodoAnterior * 0.25;
  const faseNoClique = ultimo.fase +
    2 * Math.PI * (tempo - ultimo.tempo) / ultimo.periodo;

  eventosRitmoJogador.push({ tempo: tempo, periodo: periodo, fase: faseNoClique });
}

function pontoJogadorNoTempo(tempo, centroY, amplitude) {
  if (
    eventosRitmoJogador.length === 0 ||
    tempo < eventosRitmoJogador[0].tempo
  ) {
    return { y: centroY };
  }

  let indice = eventosRitmoJogador.length - 1;
  while (indice > 0 && eventosRitmoJogador[indice].tempo > tempo) {
    indice--;
  }

  const evento = eventosRitmoJogador[indice];
  const proximo = eventosRitmoJogador[indice + 1];
  const tempoDesdeClique = tempo - evento.tempo;
  let ganho = 1;

  // Sem cliques novos, a onda perde amplitude e se estabiliza no centro.
  if (!proximo && tempoDesdeClique > 0.7) {
    ganho = Math.max(0, 1 - (tempoDesdeClique - 0.7) / 0.45);
  }

  const fase = evento.fase + 2 * Math.PI * tempoDesdeClique / evento.periodo;
  return { y: centroY - Math.cos(fase) * amplitude * ganho };
}

function onPlayerStateChange(event) {
  if (!jogoIniciado) {
    return;
  }

  if (event.data === YT.PlayerState.PAUSED) {
    rcpAtiva = false;
    rcpBtn.disabled = true;

    jogoPausado = true;
    pauseBtn.textContent = "Continuar";
    gameMessage.textContent = "JOGO PAUSADO";
  }

  if (event.data === YT.PlayerState.BUFFERING) {
    rcpAtiva = false;
    rcpBtn.disabled = true;

    if (!jogoPausado) {
      gameMessage.textContent = "AGUARDANDO VÍDEO...";
    }
  }

  if (event.data === YT.PlayerState.PLAYING) {
    if (jogoPausado) {
      player.pauseVideo();
      return;
    }

    atualizarJogo();
  }

  if (event.data === YT.PlayerState.ENDED) {
    finalizarJogo();
  }
}

// ======================================
// 13. FINALIZAR
// ======================================

function finalizarJogo() {
  jogoIniciado = false;
  jogoPreparado = false;
  jogoPausado = false;
  rcpAtiva = false;

  rcpBtn.disabled = true;
  prepareBtn.disabled = false;

  pauseBtn.disabled = true;
  pauseBtn.textContent = "Pausar";

  if (intervaloJogo !== null) {
    clearInterval(intervaloJogo);
    intervaloJogo = null;
  }

  if (animacaoGrafico !== null) {
    cancelAnimationFrame(animacaoGrafico);
    animacaoGrafico = null;
  }

  if (animacaoBotao !== null) {
    cancelAnimationFrame(animacaoBotao);
    animacaoBotao = null;
  }

  rcpBtn.classList.remove("ready", "pressed");
  gameMessage.textContent = "JOGO FINALIZADO!";
}

// Remove o efeito de pressão ao soltar o botão
rcpBtn.addEventListener("pointerup", function () {
  rcpBtn.classList.remove("pressed");
});

rcpBtn.addEventListener("pointerleave", function () {
  rcpBtn.classList.remove("pressed");
});
