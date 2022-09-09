//var videoElement = document.querySelector('video');
var btnFront = document.querySelector('#btn-front');
var btnBack = document.querySelector('#btn-back');
var camerasDisponiveis = document.querySelector("#camerasDisponiveis");
var cameras = document.getElementById("selectCameras");
var capture = null;
var opt = 0;

function abrirModalErroCamera(mensagem) {
    $("#mensagemRespostaErro").text(mensagem);
    $('#modalErro').modal({ backdrop: 'static', keyboard: false });
    $(".btndireito").addClass("invisivel");
}

let sucesso = false;

(async() => {

    await navigator.mediaDevices.getUserMedia({ video: true });

    let devices = await navigator.mediaDevices.enumerateDevices();
    for (let item of devices) {
        if (item.kind == "videoinput") {

            let option = document.createElement("option");

            option.text = item.label;

            option.value = item.deviceId;

            cameras.add(option);
        }
    }

    divCamerasDisponiveis.classList.add("invisivel");

    if (cameras.length == 0) {
        abrirModalErroCamera();
    } else if (cameras.length == 1) {

        sucesso = await capture(cameras[0].value);

    } else {
        divCamerasDisponiveis.classList.remove("invisivel");

        for (let i = 0; i < cameras.length; i++) {

            sucesso = await capture(cameras[i].value);

            if (sucesso) {

                cameras.selectedIndex = i;

                break;
            }
        }
    }

    if (!sucesso) {

        $(".divformOuBotaoCapturar").addClass("invisivel");

        abrirModalErroCamera();
        $("#contBtnOK").click(function() {
            document.location.reload(true);
        });
    }
})();


(() => {

    const supports = navigator.mediaDevices.getSupportedConstraints();

    if (!supports['facingMode']) {
        console.log('Browser Not supported!');
        return;
    }

    let stream;

    capture = async(deviceId) => {
        const options = {
            audio: false,
            video: {
                deviceId: deviceId
            },
        };

        try {

            if (stream) {
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }

            stream = await navigator.mediaDevices.getUserMedia(options);

        } catch (e) {
            return false;
        }


        let tracks = stream.getTracks();
        let settings = tracks[0].getSettings();

        if (settings.facingMode == "environment") {
            video.classList.remove("refletir-camera");

        } else {
            video.classList.add("refletir-camera");
        }

        video.srcObject = null;
        video.srcObject = stream;
        video.play();

        return true;
    }
})();

async function selecionarCamera() {
    let sucesso = await capture(selectCameras.value);

    if (sucesso) {
        $(".divformOuBotaoCapturar").removeClass("invisivel");
    } else {
        abrirModalErroCamera();

        $(".divformOuBotaoCapturar").addClass("invisivel");
    }
}

//Abrindo modal de câmeras disponiveis
function abrirModalCamerasDisponiveis() {
    $('#modalCamerasDisponiveis').modal({ backdrop: 'static', keyboard: false });
}