<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Room, RoomEvent, Track } from "livekit-client";
import { videoApi } from "../api/video";

const route = useRoute();
const router = useRouter();
const reservaId = Number(route.params.id);

const cargando = ref(true);
const error = ref("");
const micActivo = ref(true);
const camaraActiva = ref(true);
const otroConectado = ref(false);

const videoLocal = ref<HTMLVideoElement | null>(null);
const videoRemoto = ref<HTMLVideoElement | null>(null);

const room = new Room();

function manejarTrack(track: any) {
  if (track.kind === Track.Kind.Video) {
    otroConectado.value = true;
    track.attach(videoRemoto.value!);
  } else if (track.kind === Track.Kind.Audio) {
    track.attach(); // livekit crea el elemento de audio solo
  }
}

onMounted(async () => {
  try {
    const res = await videoApi.obtenerToken(reservaId);
    const { token, url } = res.data;

    await room.connect(url, token);

    // publicar cámara y micrófono
    await room.localParticipant.enableCameraAndMicrophone();

    // mostrar video local
    const pubLocal = room.localParticipant.getTrackPublication(Track.Source.Camera);
    if (pubLocal?.track) {
      pubLocal.track.attach(videoLocal.value!);
    }

    // si el otro ya estaba en la sala
    room.remoteParticipants.forEach((participante) => {
      participante.trackPublications.forEach((pub) => {
        if (pub.track) manejarTrack(pub.track);
      });
    });

    // cuando el otro se une
    room.on(RoomEvent.TrackSubscribed, (track) => {
      manejarTrack(track);
    });

    // cuando el otro se va
    room.on(RoomEvent.ParticipantDisconnected, () => {
      otroConectado.value = false;
    });

    cargando.value = false;
  } catch (e: any) {
    error.value = e?.response?.data?.error ?? "No se pudo conectar a la videollamada.";
    cargando.value = false;
  }
});

onUnmounted(() => {
  room.disconnect();
});

async function toggleMic() {
  micActivo.value = !micActivo.value;
  await room.localParticipant.setMicrophoneEnabled(micActivo.value);
}

async function toggleCamara() {
  camaraActiva.value = !camaraActiva.value;
  await room.localParticipant.setCameraEnabled(camaraActiva.value);
}

async function colgar() {
  room.disconnect();
  router.push({ name: "ReservaDetalle", params: { id: reservaId } });
}
</script>

<template>
  <div class="sala">

    <!-- Cargando -->
    <div v-if="cargando" class="pantalla-centro">
      <div class="spinner"></div>
      <p>Conectando...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="pantalla-centro">
      <p class="error-texto">{{ error }}</p>
      <button class="btn-volver" @click="router.push({ name: 'ReservaDetalle', params: { id: reservaId } })">
        Volver a la reserva
      </button>
    </div>

    <!-- Sala activa -->
    <template v-else>

      <!-- Video remoto (ocupa toda la sala) -->
      <div class="video-principal">
        <video ref="videoRemoto" autoplay playsinline class="video-el" />
        <div v-if="!otroConectado" class="esperando">
          <div class="avatar-grande">?</div>
          <p>Esperando que el otro participante se una...</p>
        </div>
      </div>

      <!-- Video local (esquina) -->
      <div class="video-local-wrapper">
        <video ref="videoLocal" autoplay playsinline muted class="video-el" />
        <div v-if="!camaraActiva" class="camara-off-overlay">Cámara apagada</div>
      </div>

      <!-- Controles -->
      <div class="controles">
        <button
          class="btn-control"
          :class="{ inactivo: !micActivo }"
          :title="micActivo ? 'Silenciar' : 'Activar micrófono'"
          @click="toggleMic"
        >
          <svg v-if="micActivo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z"/>
            <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z"/>
          </svg>
          <span>{{ micActivo ? 'Silenciar' : 'Activar mic' }}</span>
        </button>

        <button
          class="btn-control"
          :class="{ inactivo: !camaraActiva }"
          :title="camaraActiva ? 'Apagar cámara' : 'Encender cámara'"
          @click="toggleCamara"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z"/>
          </svg>
          <span>{{ camaraActiva ? 'Apagar cámara' : 'Encender cámara' }}</span>
        </button>

        <button class="btn-control colgar" title="Colgar" @click="colgar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clip-rule="evenodd"/>
          </svg>
          <span>Colgar</span>
        </button>
      </div>

    </template>
  </div>
</template>

<style scoped>
.sala {
  position: fixed;
  inset: 0;
  background: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

/* Cargando / error */
.pantalla-centro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #f9fafb;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: girar 0.8s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

.error-texto {
  color: #fca5a5;
  font-size: 1rem;
  text-align: center;
  max-width: 320px;
}

.btn-volver {
  background: #374151;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  font-size: 0.9rem;
}

/* Video principal (otro participante) */
.video-principal {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-el {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.esperando {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #9ca3af;
}

.avatar-grande {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #6b7280;
}

/* Video local (esquina inferior derecha) */
.video-local-wrapper {
  position: absolute;
  bottom: 100px;
  right: 24px;
  width: 180px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255,255,255,0.15);
  background: #1f2937;
}

.video-local-wrapper .video-el {
  transform: scaleX(-1); /* efecto espejo */
}

.camara-off-overlay {
  position: absolute;
  inset: 0;
  background: #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: #6b7280;
}

/* Barra de controles */
.controles {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  background: rgba(17, 24, 39, 0.85);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  padding: 0.75rem 1.25rem;
}

.btn-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  background: #374151;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: white;
  cursor: pointer;
  transition: background 0.15s;
  min-width: 72px;
}

.btn-control svg {
  width: 22px;
  height: 22px;
}

.btn-control span {
  font-size: 0.65rem;
  font-weight: 500;
  white-space: nowrap;
}

.btn-control:hover { background: #4b5563; }
.btn-control.inactivo { background: #6b7280; }
.btn-control.colgar { background: #dc2626; }
.btn-control.colgar:hover { background: #b91c1c; }
</style>
