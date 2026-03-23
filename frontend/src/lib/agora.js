import AgoraRTC from 'agora-rtc-sdk-ng';

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;

// ── Unlock AudioContext (required on Android/iOS before any audio plays) ─────
async function unlockAudioContext() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    if (ctx.state === 'suspended') await ctx.resume();
  } catch { /* ignore */ }
}

// ── Audience (listener) ──────────────────────────────────────────────────────

let audienceClient    = null;
let remoteAudioTracks = [];
let audienceMuted     = false;

function playTrack(track) {
  track.setVolume(audienceMuted ? 0 : 100);
  track.play();
  remoteAudioTracks.push(track);
}

export function setAudienceMuted(muted) {
  audienceMuted = muted;
  remoteAudioTracks.forEach(t => t.setVolume(muted ? 0 : 100));
}

export async function joinAsAudience(channelName, onUserCount) {
  if (audienceClient) return; // already joined

  // Must be called in user-gesture context to unlock audio on Android
  await unlockAudioContext();

  audienceClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
  await audienceClient.setClientRole('audience');

  // When browser blocks autoplay, Agora fires this — we surface a "Tap to Hear" button
  AgoraRTC.onAutoplayFailed = () => { window.__agoraAutoplayFailed?.(); };

  audienceClient.on('user-published', async (user, mediaType) => {
    await audienceClient.subscribe(user, mediaType);
    if (mediaType === 'audio' && user.audioTrack) {
      playTrack(user.audioTrack);
    }
    onUserCount?.(audienceClient.remoteUsers.length);
  });

  audienceClient.on('user-unpublished', (user, mediaType) => {
    if (mediaType === 'audio' && user.audioTrack) {
      user.audioTrack.stop();
      remoteAudioTracks = remoteAudioTracks.filter(t => t !== user.audioTrack);
    }
    onUserCount?.(audienceClient.remoteUsers.length);
  });

  audienceClient.on('user-left', () => onUserCount?.(audienceClient.remoteUsers.length));

  // Force-play all subscribed tracks — called when browser unblocks autoplay
  window.__agoraPlayAll = () => {
    remoteAudioTracks.forEach(t => { try { t.setVolume(audienceMuted ? 0 : 100); t.play(); } catch { /* ignore */ } });
  };

  await audienceClient.join(APP_ID, channelName, null, null);

  // Manually subscribe to any host already publishing when we joined
  // (user-published may not always fire for pre-existing hosts on slow connections)
  await Promise.all(
    audienceClient.remoteUsers
      .filter(u => u.hasAudio && !remoteAudioTracks.length)
      .map(async (u) => {
        try {
          await audienceClient.subscribe(u, 'audio');
          if (u.audioTrack) playTrack(u.audioTrack);
        } catch { /* ignore */ }
      })
  );

  onUserCount?.(audienceClient.remoteUsers.length);
}

export async function leaveAsAudience() {
  if (!audienceClient) return;
  remoteAudioTracks.forEach(t => { try { t.stop(); } catch { /* ignore */ } });
  remoteAudioTracks = [];
  audienceMuted     = false;
  window.__agoraPlayAll = null;
  await audienceClient.leave();
  audienceClient = null;
}

// ── Host (muazzin / broadcaster) ────────────────────────────────────────────

let hostClient      = null;
let micTrack        = null;
let rawMediaStream  = null; // keep reference so we can stop it on cleanup

export async function startBroadcast(channelName) {
  if (hostClient) return;

  // Get microphone with all call-processing disabled at the browser/OS level.
  // Using getUserMedia directly (instead of Agora's createMicrophoneAudioTrack)
  // is the only reliable way to disable processing on Android WebView.
  rawMediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl:  false,
      sampleRate:       { ideal: 48000 },
      channelCount:     1,
    },
  });

  hostClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
  await hostClient.setClientRole('host');
  await hostClient.join(APP_ID, channelName, null, null);

  // createCustomAudioTrack takes our raw track — Agora only encodes & transmits,
  // no extra processing applied on top.
  micTrack = AgoraRTC.createCustomAudioTrack({
    mediaStreamTrack: rawMediaStream.getAudioTracks()[0],
    encoderConfig: { sampleRate: 48000, stereo: false, bitrate: 128 },
  });
  await hostClient.publish(micTrack);
}

export async function stopBroadcast() {
  if (micTrack) {
    micTrack.stop();
    micTrack.close();
    micTrack = null;
  }
  // Stop the underlying OS mic stream so the recording indicator clears
  if (rawMediaStream) {
    rawMediaStream.getTracks().forEach(t => t.stop());
    rawMediaStream = null;
  }
  if (hostClient) {
    await hostClient.leave();
    hostClient = null;
  }
}

export function isBroadcasting() {
  return !!hostClient;
}
