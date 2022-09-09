const tituloPosicao = document.querySelector("#tituloPosicao");
const tituloZerarMovimentos = document.querySelector('#zerarMovimentos');
const etapasMovimento = document.querySelector('#etapasMovimento');
const textoMovimentoAtual = document.querySelector("#textoMovimentoAtual");
const divCamera = document.querySelector("#divCamera");
const TextoPosicaoAleatoriaDoRosto = document.querySelector("#TextoPosicaoAleatoriaDoRosto");
const video = document.getElementById('video');
TextoPosicaoAleatoriaDoRosto.classList.remove("invisivel");
var btnIniciarProgressBar = document.querySelector("#btnIniciarProgressBar");
var btnFecharModalCamerasDisponiveis = document.querySelector(".btnFecharModalCamerasDisponiveis");
var posicaoAtualDoUsuario = null;
var contagemParaZerarMovimentos = 60;
var comecarContagemCronometro = true;
var condicaoParaGerarMovimentosRandomicos = false;
let state = new PosicaoTempo(
    "Face não detectada",
    capturarFotoEMostraOProximoMovimentoNaTela,
    capturarUltimaFotoEEnviarOsDados,
    removerFotosCapturadas,
    mostraMovimentoNaTela,
    removerProgressBarCamera
);

//Removendo o progressBar da camera
function removerProgressBarCamera() {
    $("#video").removeClass("borderLeft");
    $("#video").removeClass("borderTop");
    $("#video").removeClass("borderRight");
    $("#video").removeClass("borderBottom");
}


//Captura foto e mostra o proximo movimento na tela
function capturarFotoEMostraOProximoMovimentoNaTela(posicaoSolicitada) {
    textoMovimentoAtual.classList.remove("invisivel");
    textoMovimentoAtual.textContent = posicaoSolicitada;
    tirarFotoComLiveness();
}


//Removendo as fotos capturadas
function removerFotosCapturadas() {
    removerFotos();
}


//Mostra o movimento na tela, a palavra em azul
function mostraMovimentoNaTela(posicaoSolicitada) {
    textoMovimentoAtual.classList.remove("invisivel");
    textoMovimentoAtual.textContent = posicaoSolicitada;
}


//Reiniciando todo o processo, as fotos capturadas, zerando o cronometro e zerando os dois progressBar
function reiniciarProcesso() {
    removerFotosCapturadas();
    contagemParaZerarMovimentos = 60;
    removerProgressBarCamera();
    condicaoParaGerarMovimentosRandomicos = true;
    contador = 1;
}


//Clicando no icone camera e abrindo a modal com as cameras disponiveis
function abrirModalCamerasDisponiveis() {
    $('#modalCamerasDisponiveis').modal({ backdrop: 'static', keyboard: false });

}


//Captura a ultima foto e envia os dados para a controller
function capturarUltimaFotoEEnviarOsDados() {
    comecarDetectarRosto = false;
    $("#myProgress").addClass("invisivel");
    $("#divCamera").addClass("invisivel");
    $(".formulario").addClass("invisivel");
    $("#divCamerasDisponiveis").addClass("invisivel");
    $("#divGifLoading").removeClass("invisivel");
    $("#divIconeAvisos").addClass("invisivel");
    TextoPosicaoAleatoriaDoRosto.classList.remove("posicaoAleatoriaDoRosto");
    TextoPosicaoAleatoriaDoRosto.classList.add("posicaoAleatoriaDoRostoSucesso");
    gerarToken();
}


function getTop(l) {
    return l
        .map((a) => a.y)
        .reduce((a, b) => Math.min(a, b));
}


function getMeanPosition(l) {
    return l
        .map((a) => [a.x, a.y])
        .reduce((a, b) => [a[0] + b[0], a[1] + b[1]])
        .map((a) => a / l.length);
}


//Adicionando o evento de reproduzir o video/câmera
video.addEventListener('play', async() => {
    Promise.all([
        await faceapi.nets.tinyFaceDetector.loadFromUri('scripts/faceapi/models'), //Detecta rosto no video, desenhando um quadrado em volta do rosto
        await faceapi.nets.faceLandmark68Net.loadFromUri('scripts/faceapi/models') // desenhando os traços no rosto

    ]).then();

    /*Intervalo de tempo, a cada 500 milissegundos verifica se existe um rosto, se existir um rosto, pegamos as referencias de
    algumas partes do rosto para detectar a posição que o usuario esta rotacionando o rosto.*/
    setInterval(async() => { // executando os metodos em tempo real
        if (comecarDetectarRosto == true) {
            var res = await faceapi
                .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks();

            //Se existir um rosto
            if (res) {
                //Referencia do nariz e altura do rosto
                var PontosNariz = res.landmarks.getNose();
                var subtraindoPosicoesNariz = PontosNariz[8]._y - PontosNariz[2]._y;
                var alturaRosto = res.detection.box.height;
                var calculoNariz = subtraindoPosicoesNariz / alturaRosto;

                //Referencias da mandibula
                var mandibula = res.landmarks.getJawOutline();

                //Referencias do olho esquerdo
                var olhoEsquerdo = res.landmarks.getLeftEye();
                //Subtraindo posição 0 do eixo X do olho esquerdo e a posição 0 do eixo x da mandibula
                var calculoOlhandoParaEsquerda = (olhoEsquerdo[0]._x - mandibula[0]._x) / res.detection.box.width;

                //Referencias do olho direito
                var olhoDireito = res.landmarks.getRightEye();

                //Subtraindo posição 10 do eixo X da mandibula e a posicao 3 do eixo x do olho direito
                var calculoOlhandoParaDireita = (mandibula[16]._x - olhoDireito[3]._x) / res.detection.box.width;

                //Se a pontuação de detecção do rosto for maior que 0.3
                if (res.detection.score > 0.3) {


                    //variavel auxiliar para debug no console
                    var estado = "frente";
                    posicaoAtualDoUsuario = "frente";

                    //Validação baixo e cima
                    if (calculoNariz < 0.1) {
                        estado = "baixo";
                        posicaoAtualDoUsuario = "baixo";
                    } else if (calculoNariz > 0.14) {
                        estado = "cima";
                        posicaoAtualDoUsuario = "cima";
                    }

                    //Validação direita e esquerda
                    if (calculoOlhandoParaDireita > 0.24) {
                        estado = "direita";
                        posicaoAtualDoUsuario = "direita";
                    } else if (calculoOlhandoParaEsquerda > 0.24) {
                        estado = "esquerda";
                        posicaoAtualDoUsuario = "esquerda";
                    }

                    state.posicao = estado;
                }
            } else {
                state.posicao = "Face não detectada.";
                posicaoAtualDoUsuario = "";
            }


            if ($("#textoMovimentoAtual").text() == posicaoAtualDoUsuario) {
                inicioProgressBar();
            }
        }
        state.posicao = estado;
    }, 500);
});

//Cronometro que fica ao lado da camera
function inicializarCronometroAoLadoDaCamera() {
    setInterval(function() {
        $("#contagemParaZerarOsMovimentos").text(contagemParaZerarMovimentos);
        contagemParaZerarMovimentos--;
    }, 1000);
}



video.addEventListener('emptied', async() => {
    clearInterval(state);
});


//Iniciando o progressBar
var i = 0;
var intervaloTempo;
var width;
var progressBar = document.getElementById("myBar");

function inicioProgressBar() {
    if (aparecerProgressBar == true) {
        width = 0;
        $("#myProgress").removeClass("invisivel");
        if (i == 0) {
            i = 1;
            intervaloTempo = setInterval(frame, 100);

            function frame() {
                if (width >= 100) {
                    clearInterval(intervaloTempo);
                    $("#myProgress").addClass("invisivel");
                    capturarFotoEMostraOProximoMovimentoNaTela();
                    i = 0;
                } else {
                    width += 10;
                    progressBar.style.width = width + "%";
                    progressBar.innerHTML = width + "%";
                }
            }
        }
        aparecerProgressBar = false;
    }
}


//Reiniciando o progressBar
function reiniciarProgressBar() {
    clearInterval(intervaloTempo);
    width = 0;
    i = 0;
    progressBar.style.width = 0;
    progressBar.innerHTML = "";
    $("#myProgress").addClass("invisivel");
    aparecerProgressBar = true;
}