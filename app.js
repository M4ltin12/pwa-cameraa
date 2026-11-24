let streamActual = null;
let modoCamaraActual = 'environment';
let solicitando = false;
let eventoInstalacion = null;

function actualizarMensajeEstado(texto, tipo) {
  document.getElementById('estado-camara').textContent = texto;
  const indicador = document.getElementById('indicador-estado');
  if (indicador) {
    indicador.dataset.estado = tipo || 'apagada';
  }
}

function detenerCamaraActiva() {
  if (streamActual) {
    streamActual.getTracks().forEach((track) => track.stop());
    streamActual = null;
  }
  const visorVideo = document.getElementById('visor-camara');
  visorVideo.srcObject = null;
  visorVideo.classList.remove('activo');
  const marcador = document.getElementById('marcador-visor');
  if (marcador) {
    marcador.hidden = false;
  }
}

function actualizarControles() {
  const activa = streamActual !== null;
  document.getElementById('btn-alternar-camara').disabled = !activa || solicitando;
  document.getElementById('btn-apagar-camara').disabled = !activa || solicitando;
  document.getElementById('btn-preparar-camara').disabled = solicitando;
  document.getElementById('btn-confirmar-permiso').disabled = solicitando;
  const cancelar = document.getElementById('btn-cancelar-permiso');
  if (cancelar) {
    cancelar.disabled = solicitando;
  }
}

function iniciarCamara(modo) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    actualizarMensajeEstado('Este navegador no soporta el acceso a la cámara.', 'error');
    return Promise.resolve();
  }

  if (solicitando) {
    return Promise.resolve();
  }

  solicitando = true;
  actualizarControles();
  detenerCamaraActiva();

  const restricciones = {
    video: { facingMode: modo },
    audio: false
  };

  return navigator.mediaDevices.getUserMedia(restricciones)
    .then((stream) => {
      streamActual = stream;
      const visorVideo = document.getElementById('visor-camara');
      visorVideo.srcObject = stream;
      visorVideo.classList.add('activo');
      const marcador = document.getElementById('marcador-visor');
      if (marcador) {
        marcador.hidden = true;
      }

      const pista = stream.getVideoTracks()[0];
      let etiqueta = modo === 'environment' ? 'Trasera' : 'Frontal';

      if (pista && typeof pista.getSettings === 'function') {
        const ajustes = pista.getSettings();
        if (ajustes.facingMode) {
          if (ajustes.facingMode === 'environment') {
            etiqueta = 'Trasera';
            modoCamaraActual = 'environment';
          } else if (ajustes.facingMode === 'user') {
            etiqueta = 'Frontal';
            modoCamaraActual = 'user';
          }
        }
      }

      actualizarMensajeEstado(`Cámara activa (${etiqueta})`, 'activa');
    })
    .catch((error) => {
      if (error.name === 'NotAllowedError') {
        actualizarMensajeEstado('Permiso denegado. Habilita el acceso a la cámara en los ajustes de tu navegador.', 'error');
      } else if (error.name === 'NotFoundError') {
        actualizarMensajeEstado('No se detectó el sensor de cámara solicitado en este dispositivo.', 'error');
      } else {
        actualizarMensajeEstado(`Error al acceder al hardware: ${error.message}`, 'error');
      }
    })
    .finally(() => {
      solicitando = false;
      actualizarControles();
    });
}

function verificarEntornoIOS() {
  const esIOSClasico = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const esIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  const esIOS = esIOSClasico || esIPadOS;

  const estaInstalada = window.navigator.standalone === true ||
                        window.matchMedia('(display-mode: standalone)').matches;

  if (esIOS && !estaInstalada) {
    const guiaIOS = document.getElementById('instrucciones-ios');
    if (guiaIOS) guiaIOS.hidden = false;
  }
}

document.getElementById('btn-preparar-camara').addEventListener('click', () => {
  document.getElementById('aviso-permiso').hidden = false;
});

document.getElementById('btn-confirmar-permiso').addEventListener('click', () => {
  document.getElementById('aviso-permiso').hidden = true;
  iniciarCamara(modoCamaraActual);
});

document.getElementById('btn-cancelar-permiso').addEventListener('click', () => {
  document.getElementById('aviso-permiso').hidden = true;
});

document.getElementById('btn-alternar-camara').addEventListener('click', () => {
  modoCamaraActual = modoCamaraActual === 'environment' ? 'user' : 'environment';
  iniciarCamara(modoCamaraActual);
});

document.getElementById('btn-apagar-camara').addEventListener('click', () => {
  detenerCamaraActiva();
  actualizarMensajeEstado('Cámara apagada', 'apagada');
  actualizarControles();
});

window.addEventListener('beforeinstallprompt', (evento) => {
  evento.preventDefault();
  eventoInstalacion = evento;
  document.getElementById('btn-instalar').hidden = false;
});

document.getElementById('btn-instalar').addEventListener('click', () => {
  if (!eventoInstalacion) {
    return;
  }

  eventoInstalacion.prompt();
  eventoInstalacion.userChoice.then((resultado) => {
    if (resultado.outcome === 'accepted') {
      document.getElementById('btn-instalar').hidden = true;
    }
    eventoInstalacion = null;
  });
});

window.addEventListener('appinstalled', () => {
  document.getElementById('btn-instalar').hidden = true;
  eventoInstalacion = null;
});

window.addEventListener('pagehide', () => {
  detenerCamaraActiva();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

verificarEntornoIOS();
actualizarControles();
