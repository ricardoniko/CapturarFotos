class PosicaoTempo {
    constructor(posicaoInicial, capturarFotoEMostraOProximoMovimentoNaTela, capturarUltimaFotoEEnviarOsDados, removerFotosCapturadas, mostraMovimentoNaTela, removerProgressBarCamera) {
        this.movimentoAtual = 0;
        this.tempo = 1;
        this.qtdMovimentos = 5;
        this.capturarFotoEMostraOProximoMovimentoNaTela = capturarFotoEMostraOProximoMovimentoNaTela;
        this.capturarUltimaFotoEEnviarOsDados = capturarUltimaFotoEEnviarOsDados;
        this.removerFotosCapturadas = removerFotosCapturadas;
        this.mostraMovimentoNaTela = mostraMovimentoNaTela;
        this.removerProgressBarCamera = removerProgressBarCamera;
        this.movimentosPossiveis = [
            'cima',
            'baixo',
            'esquerda',
            'direita'
        ];

        this.gerarMovimentosRandomicos();
    }

    //Gerando movimentos randômicos
    gerarMovimentosRandomicos() {
        var currentIndex = this.movimentosPossiveis.length;
        var temporaryValue;
        var randomIndex;

        while (1 !== currentIndex) {

            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            temporaryValue = this.movimentosPossiveis[currentIndex];
            this.movimentosPossiveis[currentIndex] = this.movimentosPossiveis[randomIndex];
            this.movimentosPossiveis[randomIndex] = temporaryValue;
        }

        this.movimentosPossiveis.push('frente');
        //console.log(this.movimentosPossiveis);
        return this.movimentosPossiveis;
    }

    get timerRec() {
        return this._timerRec;
    }

    set timerRec(value) {
        this._timerRec = value;
    }

    get posicao() {
        return this._posicaoSolicitada;
    }

    set posicao(posicaoUsuario) {
        if (comecarDetectarRosto == true) {
            if (contagemParaZerarMovimentos == 0) {
                this.removerFotosCapturadas();
                contagemParaZerarMovimentos = 60;
                this.removerProgressBarCamera();
                contador = 1;
                this.movimentosPossiveis = [
                    'cima',
                    'baixo',
                    'esquerda',
                    'direita'
                ];

                this.gerarMovimentosRandomicos();
            }

            if (condicaoParaGerarMovimentosRandomicos == true) {
                this.movimentosPossiveis = [
                    'cima',
                    'baixo',
                    'esquerda',
                    'direita'
                ];

                this.gerarMovimentosRandomicos();
                condicaoParaGerarMovimentosRandomicos = false;
            }

            if (contador > this.movimentosPossiveis.length) {
                clearInterval(this.timerRec);
                this.capturarUltimaFotoEEnviarOsDados();
            } else {
                if (posicaoUsuario != this._posicaoSolicitada) {
                    this._posicaoSolicitada = posicaoUsuario;
                    reiniciarProgressBar();
                    this.mostraMovimentoNaTela(this.movimentosPossiveis[contador - 1]);
                    $("#divEtapasDoLiveness").removeClass("invisivel");
                    $(".tituloTelaCaptura").addClass("invisivel");
                    $(".subtituloTelaCaptura").addClass("invisivel");
                    $('#modalCarregando').modal('hide');
                    if (comecarContagemCronometro == true) {
                        inicializarCronometroAoLadoDaCamera();
                        setInterval(function() {
                            if (i == 1) {
                                contagemParaZerarMovimentos = 60;
                                $("#contagemParaZerarOsMovimentos").removeClass("invisivel");
                            }
                            i++;
                        }, 500);
                        comecarContagemCronometro = false;
                    }

                    $("#email").prop('disabled', true);
                    $("#btnIniciarCaptura").addClass("invisivel");

                } else {
                    this.mostraMovimentoNaTela(this.movimentosPossiveis[contador - 1]);
                }
            }
        }
    }
}