/**
 * Easter Eggs Engine
 * 
 * Interactive cinematic easter eggs for:
 *  1. Ayn Rand / Atlas Shrugged ("Who is John Galt?") - Cosmic Synth & Horizon Beam
 *  2. Alexandre Dumas / The Count of Monte Cristo ("Wait and Hope") - Antique Manuscript & Baroque Soundscape
 *  3. Julian Assange - Minimalist Silent Photographic Portrait
 * 
 * Zero external dependencies. Uses Web Audio API with automatic lifecycle teardown.
 */

(function () {
  'use strict';

  // State Management
  let isGaltOpen = false;
  let isMontecristoOpen = false;
  let isAssangeOpen = false;

  let currentAudioCtx = null;
  let currentMontecristoAudioCtx = null;

  // Helper to pause/resume WebGL background waves when modals open/close
  function pauseWaves() {
    if (window.wavesController && window.wavesController.pause) {
      window.wavesController.pause();
    }
  }

  function resumeWaves() {
    if (
      window.wavesController &&
      window.wavesController.resume &&
      !isGaltOpen &&
      !isMontecristoOpen &&
      !isAssangeOpen
    ) {
      window.wavesController.resume();
    }
  }

  // ==========================================================================
  // 1. John Galt Cinematic Soundscape (Blade Runner / Interstellar Synth Pad)
  // ==========================================================================
  function playGaltCinematicSound() {
    try {
      if (currentAudioCtx) {
        try { currentAudioCtx.close(); } catch (e) {}
      }
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      currentAudioCtx = ctx;
      const now = ctx.currentTime;

      // Resonant Lowpass Filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 1.8);
      filter.frequency.exponentialRampToValueAtTime(360, now + 6.0);
      filter.Q.setValueAtTime(1.5, now);

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.09, now + 1.2);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 6.8);

      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Analog Synth Chord Pad (A minor / Cosmic cluster)
      const padNotes = [55.00, 110.00, 164.81, 220.00, 261.63, 329.63, 440.00, 659.25];

      padNotes.forEach((freq, i) => {
        const oscSaw = ctx.createOscillator();
        const oscTri = ctx.createOscillator();
        const noteGain = ctx.createGain();

        oscSaw.type = 'sawtooth';
        oscSaw.frequency.setValueAtTime(freq, now);
        oscSaw.detune.setValueAtTime((i % 2 === 0 ? -4 : 4), now);

        oscTri.type = 'triangle';
        oscTri.frequency.setValueAtTime(freq * 1.002, now);

        noteGain.gain.setValueAtTime(0.55 / (padNotes.length + 1), now);

        oscSaw.connect(noteGain);
        oscTri.connect(noteGain);
        noteGain.connect(filter);

        oscSaw.start(now);
        oscTri.start(now);
        oscSaw.stop(now + 7.0);
        oscTri.stop(now + 7.0);
      });

      // Shimmer Crystal Chimes
      const chimeFreqs = [880.00, 1318.51, 1760.00];
      chimeFreqs.forEach((freq, idx) => {
        const chimeOsc = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(freq, now + 0.5 + idx * 0.25);

        chimeGain.gain.setValueAtTime(0, now + 0.5 + idx * 0.25);
        chimeGain.gain.linearRampToValueAtTime(0.012, now + 0.65 + idx * 0.25);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.8 + idx * 0.4);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(ctx.destination);

        chimeOsc.start(now + 0.5 + idx * 0.25);
        chimeOsc.stop(now + 5.2 + idx * 0.4);
      });

      // Cleanup context on finish
      setTimeout(() => {
        if (currentAudioCtx === ctx) {
          try { ctx.close(); } catch (e) {}
          currentAudioCtx = null;
        }
      }, 7200);
    } catch (e) {}
  }

  function openGaltModal() {
    if (isGaltOpen || isMontecristoOpen || isAssangeOpen) return;
    const modal = document.getElementById('galt-modal');
    if (!modal) return;

    isGaltOpen = true;
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    pauseWaves();
    playGaltCinematicSound();
  }

  function closeGaltModal() {
    const modal = document.getElementById('galt-modal');
    if (!modal) return;
    isGaltOpen = false;
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (currentAudioCtx) {
      try {
        currentAudioCtx.close();
        currentAudioCtx = null;
      } catch (e) {}
    }

    resumeWaves();

    if (
      window.location.hash === '#galt' ||
      window.location.hash === '#johngalt' ||
      window.location.hash === '#whoisjohngalt'
    ) {
      try {
        history.replaceState(null, null, window.location.pathname + window.location.search);
      } catch (e) {}
    }
  }

  // ==========================================================================
  // 2. The Count of Monte Cristo Soundscape (Baroque Cello + Cathedral Bell)
  // ==========================================================================
  function playMontecristoSound() {
    try {
      if (currentMontecristoAudioCtx) {
        try { currentMontecristoAudioCtx.close(); } catch (e) {}
      }
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      currentMontecristoAudioCtx = ctx;
      const now = ctx.currentTime;

      // C minor cello drone notes (C2, G2, C3, G3, C4, Eb4)
      const droneNotes = [65.41, 98.00, 130.81, 196.00, 261.63, 311.13];

      const masterFilter = ctx.createBiquadFilter();
      masterFilter.type = 'lowpass';
      masterFilter.frequency.setValueAtTime(300, now);
      masterFilter.frequency.exponentialRampToValueAtTime(1500, now + 2.0);
      masterFilter.frequency.exponentialRampToValueAtTime(340, now + 6.0);
      masterFilter.Q.setValueAtTime(1.2, now);

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0, now);
      droneGain.gain.linearRampToValueAtTime(0.08, now + 1.5);
      droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 7.0);

      masterFilter.connect(droneGain);
      droneGain.connect(ctx.destination);

      droneNotes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i < 2 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime((i % 2 === 0 ? -4 : 4), now);
        gain.gain.setValueAtTime(0.55 / droneNotes.length, now);

        osc.connect(gain);
        gain.connect(masterFilter);
        osc.start(now);
        osc.stop(now + 7.2);
      });

      // Church Bell Harmonic Overtones
      const bellRatios = [1.0, 2.0, 2.76, 5.4];
      const fundamental = 523.25; // C5
      bellRatios.forEach((ratio, idx) => {
        const bellOsc = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(fundamental * ratio, now + 0.1);

        bellGain.gain.setValueAtTime(0, now + 0.1);
        bellGain.gain.linearRampToValueAtTime(0.015 / (idx + 1), now + 0.12);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5 + idx * 0.3);

        bellOsc.connect(bellGain);
        bellGain.connect(ctx.destination);

        bellOsc.start(now + 0.1);
        bellOsc.stop(now + 6.0);
      });

      setTimeout(() => {
        if (currentMontecristoAudioCtx === ctx) {
          try { ctx.close(); } catch (e) {}
          currentMontecristoAudioCtx = null;
        }
      }, 7400);
    } catch (e) {}
  }

  function openMontecristoModal() {
    if (isMontecristoOpen || isGaltOpen || isAssangeOpen) return;
    const modal = document.getElementById('montecristo-modal');
    if (!modal) return;

    isMontecristoOpen = true;
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    pauseWaves();
    playMontecristoSound();
  }

  function closeMontecristoModal() {
    const modal = document.getElementById('montecristo-modal');
    if (!modal) return;
    isMontecristoOpen = false;
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (currentMontecristoAudioCtx) {
      try {
        currentMontecristoAudioCtx.close();
        currentMontecristoAudioCtx = null;
      } catch (e) {}
    }

    resumeWaves();

    if (
      window.location.hash === '#montecristo' ||
      window.location.hash === '#dantes' ||
      window.location.hash === '#esperer' ||
      window.location.hash === '#attendre'
    ) {
      try {
        history.replaceState(null, null, window.location.pathname + window.location.search);
      } catch (e) {}
    }
  }

  // ==========================================================================
  // 3. Julian Assange Portrait Modal (Silent & Minimalist)
  // ==========================================================================
  function openAssangeModal() {
    if (isAssangeOpen || isGaltOpen || isMontecristoOpen) return;
    const modal = document.getElementById('assange-modal');
    if (!modal) return;

    isAssangeOpen = true;
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    pauseWaves();
  }

  function closeAssangeModal() {
    const modal = document.getElementById('assange-modal');
    if (!modal) return;
    isAssangeOpen = false;
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    resumeWaves();

    if (
      window.location.hash === '#assange' ||
      window.location.hash === '#julian' ||
      window.location.hash === '#wikileaks'
    ) {
      try {
        history.replaceState(null, null, window.location.pathname + window.location.search);
      } catch (e) {}
    }
  }

  // Export to window for HTML onclick handlers
  window.openGaltModal = openGaltModal;
  window.closeGaltModal = closeGaltModal;
  window.openMontecristoModal = openMontecristoModal;
  window.closeMontecristoModal = closeMontecristoModal;
  window.openAssangeModal = openAssangeModal;
  window.closeAssangeModal = closeAssangeModal;

  // Initialize Keyboard & Click Triggers
  document.addEventListener('DOMContentLoaded', () => {
    // Keyboard sequence listener
    let keySequence = '';
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (isGaltOpen) closeGaltModal();
        if (isMontecristoOpen) closeMontecristoModal();
        if (isAssangeOpen) closeAssangeModal();
        return;
      }

      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }

      keySequence += e.key.toLowerCase();
      if (keySequence.length > 25) keySequence = keySequence.slice(-25);

      // 1. John Galt triggers
      if (
        keySequence.includes('galt') ||
        keySequence.includes('johngalt') ||
        keySequence.includes('whoisjohngalt')
      ) {
        keySequence = '';
        openGaltModal();
      }

      // 2. Monte Cristo triggers
      if (
        keySequence.includes('dantes') ||
        keySequence.includes('cristo') ||
        keySequence.includes('montecristo') ||
        keySequence.includes('wait') ||
        keySequence.includes('hope') ||
        keySequence.includes('esperer') ||
        keySequence.includes('attendre')
      ) {
        keySequence = '';
        openMontecristoModal();
      }

      // 3. Julian Assange triggers
      if (
        keySequence.includes('assange') ||
        keySequence.includes('julian') ||
        keySequence.includes('wikileaks')
      ) {
        keySequence = '';
        openAssangeModal();
      }
    });

    // Hero Location & Logo trigger (John Galt)
    const trigger = document.getElementById('secret-hero-trigger');
    if (trigger) {
      trigger.addEventListener('click', openGaltModal);
    }

    const dockLogo = document.querySelector('.dock-logo');
    if (dockLogo) {
      dockLogo.addEventListener('click', openGaltModal);
    }

    // Book Cards Triggers
    const bookAtlas = document.getElementById('book-card-atlas');
    if (bookAtlas) {
      bookAtlas.addEventListener('click', openGaltModal);
    }

    const bookMontecristo = document.getElementById('book-card-montecristo');
    if (bookMontecristo) {
      bookMontecristo.addEventListener('click', openMontecristoModal);
    }

    const bookConsent = document.getElementById('book-card-consent');
    if (bookConsent) {
      bookConsent.addEventListener('click', openAssangeModal);
    }

    // URL Hash trigger checks on load
    if (
      window.location.hash === '#galt' ||
      window.location.hash === '#johngalt' ||
      window.location.hash === '#whoisjohngalt'
    ) {
      setTimeout(openGaltModal, 400);
    }

    if (
      window.location.hash === '#montecristo' ||
      window.location.hash === '#dantes' ||
      window.location.hash === '#wait' ||
      window.location.hash === '#hope' ||
      window.location.hash === '#esperer' ||
      window.location.hash === '#attendre'
    ) {
      setTimeout(openMontecristoModal, 400);
    }

    if (
      window.location.hash === '#assange' ||
      window.location.hash === '#julian' ||
      window.location.hash === '#wikileaks'
    ) {
      setTimeout(openAssangeModal, 400);
    }

    // Developer Console Easter Egg Signatures
    console.log(
      '%c⚡ "Who is John Galt?" %c// Click Atlas Shrugged or type "galt".',
      'color: #FF9FFC; font-family: monospace; font-size: 13px; font-weight: bold;',
      'color: #94a3b8; font-family: monospace; font-size: 11px;'
    );
    console.log(
      '%c⚓ "Wait and hope." %c// Click Monte-Cristo or type "dantes".',
      'color: #d97706; font-family: monospace; font-size: 13px; font-weight: bold;',
      'color: #94a3b8; font-family: monospace; font-size: 11px;'
    );
    console.log(
      '%c🕊️ "Julian Assange" %c// Click Manufacturing Consent or type "assange".',
      'color: #94a3b8; font-family: monospace; font-size: 13px; font-weight: bold;',
      'color: #64748b; font-family: monospace; font-size: 11px;'
    );
  });
})();
